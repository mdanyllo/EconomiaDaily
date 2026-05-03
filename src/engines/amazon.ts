import { PlaywrightCrawler } from 'crawlee';

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
            log.info('Acessando Amazon Brasil...');
            
            try {
                await page.waitForSelector('div[data-asin]', { timeout: 30000 });
            } catch (e) {
                log.error('Bloqueio detectado na Amazon.');
                return;
            }

            // Captura 3 itens para não sobrecarregar
            offers = await page.evaluate(({ tag }) => {
                const items = Array.from(document.querySelectorAll('div[data-asin]')).slice(0, 3);
                
                return items.map(item => {
                    const titleEl = item.querySelector('h2, .a-truncate-full, span.a-size-base-plus');
                    const priceEl = item.querySelector('.a-price-whole');
                    const linkEl = item.querySelector('a.a-link-normal');
                    // Pegamos o SRC da imagem (Playwright pega o que estiver carregado)
                    const imgEl = item.querySelector('img.s-image');

                    const rawUrl = linkEl?.getAttribute('href') || '';
                    // Limpa o link e injeta sua TAG de afiliado
                    const cleanUrl = rawUrl.split('?')[0];
                    const affiliateUrl = `https://www.amazon.com.br${cleanUrl}?tag=${tag}`;

                    return {
                        externalId: item.getAttribute('data-asin') || Math.random().toString(),
                        title: titleEl?.textContent?.trim() || 'Produto',
                        price: parseFloat(priceEl?.textContent?.replace('.', '').replace(',', '.') || '0'),
                        url: affiliateUrl,
                    };
                }).filter(i => i.price > 0);
            }, { tag: AMAZON_TAG });
        },
    });

    await crawler.run(['https://www.amazon.com.br/deals']);
    return offers;
};