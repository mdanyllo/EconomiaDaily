import cron from 'node-cron';
import { scanML } from './engines/mercadolivre';
import { scanAmazon } from './engines/amazon';
import { generateLegenda } from './services/ai';
import { prisma } from './services/db';
import { sendToWhatsApp } from './services/whatsapp';

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

let running = false;

async function hunt() {
  if (running) {
    console.log('⏳ Hunt já está rodando.');
    return;
  }

  running = true;

  try {
    console.log(`🕵️ Nova varredura...`);

    const mlOffers = await scanML();
    const amzOffers = await scanAmazon();

    const allOffers = [...mlOffers, ...amzOffers];

    for (const offer of allOffers) {
      const exists = await prisma.promotion.findUnique({
        where: { externalId: offer.externalId },
      });

      if (exists) {
        console.log(`⏭️ Já enviada.`);
        continue;
      }

      const copy = await generateLegenda(
        offer.title,
        offer.price,
        offer.url
      );

      if (!copy) continue;

      await prisma.promotion.create({
        data: {
          externalId: offer.externalId,
          title: offer.title,
          price: offer.price,
          image: offer.image || '',
          url: offer.url,
          affiliateUrl: offer.url,
          source: offer.url.includes('amazon') ? 'AMAZON' : 'MERCADOLIVRE',
          posted: true,
        },
      });

      await sendToWhatsApp(copy);

      console.log('📤 Enviado.');

      await sleep(300000);
    }
  } catch (error) {
    console.error(error);
  } finally {
    running = false;
  }
}

cron.schedule('*/30 * * * *', hunt);

setTimeout(() => {
  hunt();
}, 10000);