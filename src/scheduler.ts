import cron from 'node-cron';
import { scanML } from './engines/mercadolivre';
import { scanAmazon } from './engines/amazon';
// import { scanShopee } from './engines/shopee'; // 1. Desativado aqui
import { generateLegenda } from './services/ai';
import { prisma } from './services/db';
import { sendToWhatsApp } from './services/whatsapp';

async function hunt() {
  const now = new Date().toLocaleTimeString();
  console.log(`\n🕵️ [${now}] Iniciando ciclo de varredura...`);

  try {
    const mlOffers = await scanML();
    const amzOffers = await scanAmazon();
    
    // 2. Comentei a chamada da Shopee para evitar o erro
    // const shpOffers = await scanShopee(); 
    
    // 3. Removi shpOffers da lista de processamento
    const allOffers = [...mlOffers, ...amzOffers]; 
    console.log(`📊 Encontradas ${allOffers.length} ofertas (ML e Amazon).`);

    for (const offer of allOffers) {
      const exists = await prisma.promotion.findUnique({
        where: { url: offer.url }
      });

      if (!exists) {
        console.log(`✨ Nova oferta encontrada: ${offer.title}`);

        const copy = await generateLegenda(offer.title, offer.price, offer.url);

        if (!copy) {
          console.warn(`⚠️ Pulando oferta por falha na IA: ${offer.title}`);
          continue;
        }

        await prisma.promotion.create({
          data: {
            externalId: offer.externalId,
            title: offer.title,
            price: offer.price,
            image: offer.image || '',
            url: offer.url,
            affiliateUrl: offer.url, 
            source: offer.url.includes('amazon') ? 'AMAZON' : 'MERCADOLIVRE',
            posted: true
          }
        });

        await sendToWhatsApp(copy, offer.image || undefined);
      }
    }
  } catch (error) {
    console.error("❌ Erro no ciclo do scheduler:", error);
  }
}

cron.schedule('*/30 * * * *', hunt);
hunt();