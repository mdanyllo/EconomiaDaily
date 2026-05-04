import { PlaywrightCrawler } from 'crawlee';
import { stableId, normalizeUrl } from '../services/hash';

export const scanML = async () => {
  let offers: any[] = [];

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 1,
    launchContext: {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },

    async requestHandler({ page }) {
      await page.waitForSelector('.poly-card', { timeout: 30000 });

      offers = await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll('.poly-card')
        ).slice(0, 3);

        return items.map((item: any) => {
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
        .filter((i) => i.price > 0)
        .map((offer) => {
          const mlbMatch = offer.originalUrl.match(/MLB\d+/);

          return {
            ...offer,
            externalId:
              mlbMatch?.[0] || stableId(normalizeUrl(offer.url)),
            url: normalizeUrl(offer.url),
          };
        });
    },
  });

  await crawler.run(['https://www.mercadolivre.com.br/ofertas']);
  return offers;
};