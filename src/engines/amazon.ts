import { PlaywrightCrawler } from 'crawlee';
import { stableId, normalizeUrl } from '../services/hash';

export const scanAmazon = async () => {
  let offers: any[] = [];
  const AMAZON_TAG = 'economiadaily-20';

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 1,
    launchContext: {
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

      offers = await page.evaluate(({ tag }) => {
        const items = Array.from(
          document.querySelectorAll('div[data-asin]')
        ).slice(0, 3);

        return items.map((item: any) => {
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
        .filter((i) => i.price > 0)
        .map((offer) => ({
          ...offer,
          externalId:
            offer.externalId || stableId(normalizeUrl(offer.url)),
          url: normalizeUrl(offer.url),
        }));
    },
  });

  await crawler.run(['https://www.amazon.com.br/deals']);
  return offers;
};