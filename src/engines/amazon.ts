import { PlaywrightCrawler } from 'crawlee';
import { stableId, normalizeUrl } from '../services/hash';

const MAX_PRICE = 200;

const AMAZON_URLS = [
  'https://www.amazon.com.br/deals',
  'https://www.amazon.com.br/s?i=deals-intl-ship&bbn=16209815011&rh=n%3A16209815011&deals-widget=%7B%22version%22%3A1%2C%22pageSize%22%3A60%2C%22offset%22%3A60%7D',
  'https://www.amazon.com.br/s?i=deals-intl-ship&bbn=16209815011&rh=n%3A16209815011&deals-widget=%7B%22version%22%3A1%2C%22pageSize%22%3A60%2C%22offset%22%3A120%7D',
];

export const scanAmazon = async () => {
  let offers: any[] = [];
  const AMAZON_TAG = 'economiadaily-20';

  const randomUrl = AMAZON_URLS[Math.floor(Math.random() * AMAZON_URLS.length)];

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 1,
    launchContext: {
      useIncognitoPages: true,
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
    requestHandlerTimeoutSecs: 90,

    async requestHandler({ page, log }) {
      log.info('Acessando Amazon...');

      try {
        await page.waitForSelector('div[data-asin]', { timeout: 30000 });
      } catch {
        log.error('Bloqueio detectado.');
        return;
      }

      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);

      offers = await page.evaluate(({ tag }) => {
        const allItems = Array.from(document.querySelectorAll('div[data-asin]'));
        const shuffled = allItems.sort(() => Math.random() - 0.5);

        return shuffled.slice(0, 10).map((item: any) => {
          const titleEl = item.querySelector(
            'h2, .a-truncate-full, span.a-size-base-plus'
          );
          const priceEl = item.querySelector('.a-price-whole');
          const linkEl = item.querySelector('a.a-link-normal');
          const imgEl = item.querySelector('img.s-image');

          const rawUrl = linkEl?.getAttribute('href') || '';
          const cleanUrl = rawUrl.split('?')[0];
          const affiliateUrl = `https://www.amazon.com.br${cleanUrl}?tag=${tag}`;

          return {
            externalId: item.getAttribute('data-asin'),
            title: titleEl?.textContent?.trim() || 'Produto',
            price: parseFloat(
              priceEl?.textContent?.replace('.', '').replace(',', '.') || '0'
            ),
            image: imgEl?.src || '',
            url: affiliateUrl,
          };
        });
      }, { tag: AMAZON_TAG });

      offers = offers
        .filter((i) => i.price > 0 && i.price <= MAX_PRICE)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((offer) => ({
          ...offer,
          externalId: offer.externalId || stableId(normalizeUrl(offer.url)),
          url: normalizeUrl(offer.url),
        }));
    },
  });

  await crawler.run([randomUrl]);
  return offers;
};