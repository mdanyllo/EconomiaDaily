import cron from 'node-cron';
import { scanML } from './engines/mercadolivre';
import { scanAmazon } from './engines/amazon';
import { generateLegenda } from './services/ai';
import { prisma } from './services/db';
import { sendToWhatsApp } from './services/whatsapp';

// Função utilitária para pausa humana
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function hunt() {
  const now = new Date().toLocaleTimeString();
  console.log(`\n🕵️ [${now}] Iniciando ciclo de varredura...`);

  try {
    const mlOffers = await scanML();
    const amzOffers = await scanAmazon();
    
    // Pegamos apenas as 3 primeiras de cada para não inundar o grupo
    const allOffers = [...mlOffers.slice(0, 3), ...amzOffers.slice(0, 3)]; 
    console.log(`📊 Processando ${allOffers.length} ofertas selecionadas.`);

    for (const offer of allOffers) {
      // 1. Verificação robusta: se já existe pelo ID externo ou URL
      const exists = await prisma.promotion.findFirst({
        where: { 
          OR: [
            { externalId: offer.externalId },
            { url: offer.url }
          ]
        }
      });

      if (!exists) {
        console.log(`✨ Nova oferta encontrada: ${offer.title}`);

        // Gerar legenda (IA)
        const copy = await generateLegenda(offer.title, offer.price, offer.url);

        if (!copy) {
          console.warn(`⚠️ Pulando oferta por falha na IA: ${offer.title}`);
          continue;
        }

        // Salva no banco ANTES de enviar (evita duplicar se o envio demorar)
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

        // Envia para o WhatsApp (Usa a imagem real do crawler se existir)
        await sendToWhatsApp(copy, offer.image || undefined);
        
        console.log(`📤 Publicado com sucesso! Aguardando 5 minutos para a próxima...`);
        
        // 2. PAUSA DE 5 MINUTOS (300000ms) - Segurança contra BAN e Firewall
        await sleep(300000); 
      } else {
        console.log(`⏭️ Oferta já existe no banco: ${offer.title.substring(0, 30)}...`);
      }
    }
    
    console.log(`✅ Ciclo finalizado. Próxima varredura em 30 minutos.`);

  } catch (error) {
    console.error("❌ Erro no ciclo do scheduler:", error);
  }
}

// Executa a cada 30 minutos
cron.schedule('*/30 * * * *', hunt);

// Início imediato ao ligar o bot
hunt();