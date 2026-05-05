import { PlaywrightCrawler } from 'crawlee';
import { stableId, normalizeUrl } from '../services/hash';

const MAX_PRICE = 200;

const ML_URLS = [
  'https://www.mercadolivre.com.br/ofertas',
  'https://www.mercadolivre.com.br/ofertas#category_id=MLB1648',
  'https://www.mercadolivre.com.br/ofertas#category_id=MLB1051',
  'https://www.mercadolivre.com.br/ofertas#category_id=MLB1000',
];

export const scanML = async () => {
  let offers: any[] = [];

  const randomUrl = ML_URLS[Math.floor(Math.random() * ML_URLS.length)];

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 1,
    launchContext: {
      useIncognitoPages: true,
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },

    async requestHandler({ page }) {
      await page.waitForSelector('.poly-card', { timeout: 30000 });

      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);

      offers = await page.evaluate(() => {
        const allItems = Array.from(document.querySelectorAll('.poly-card'));
        const shuffled = allItems.sort(() => Math.random() - 0.5);

        return shuffled.slice(0, 10).map((item: any) => {
          const linkEl = item.querySelector('a');
          const imgEl = item.querySelector('img');
          const priceEl = item.querySelector('.andes-money-amount__fraction');

          const originalUrl = linkEl?.getAttribute('href') || '';
          const affiliateUrl = originalUrl.includes('?')
            ? `${originalUrl}&matt_word=economiadaily`
            : `${originalUrl}?matt_word=economiadaily`;

          return {
            originalUrl,
            title: item.querySelector('.poly-component__title')?.textContent?.trim(),
            price: parseFloat(
              priceEl?.textContent?.replace('.', '') || '0'
            ),
            image:
              imgEl?.src ||
              imgEl?.getAttribute('data-src') ||
              '',
            url: affiliateUrl,
          };
        });
      });

      offers = offers
        .filter((i) => i.price > 0 && i.price <= MAX_PRICE)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((offer) => {
          const mlbMatch = offer.originalUrl.match(/MLB\d+/);
          return {
            ...offer,
            externalId: mlbMatch?.[0] || stableId(normalizeUrl(offer.url)),
            url: normalizeUrl(offer.url),
          };
        });
    },
  });

  await crawler.run([randomUrl]);
  return offers;
};