import { PlaywrightCrawler } from 'crawlee';

export const scanAmazon = async () => {
    let offers: any[] = [];
    
    const crawler = new PlaywrightCrawler({
        maxConcurrency: 1, // Crucial para não estourar os 1GB de RAM
        launchContext: {
            launchOptions: {
                headless: true, 
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-dev-shm-usage'
                ],
            },
        },
        requestHandlerTimeoutSecs: 90, // Aumentado para dar tempo ao servidor lento
        
        async requestHandler({ page, log }) {
            log.info('Acessando Amazon Brasil (Modo Econômico)...');
            
            try {
                // Espera o conteúdo principal
                await page.waitForSelector('div[data-asin]', { timeout: 30000 });
            } catch (e) {
                log.error('Layout não carregou ou bloqueio detectado.');
                return;
            }

            offers = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('div[data-asin]')).slice(0, 5);
                
                return items.map(item => {
                    const titleEl = item.querySelector('h2, .a-truncate-full, span.a-size-base-plus');
                    const priceEl = item.querySelector('.a-price-whole');
                    const linkEl = item.querySelector('a.a-link-normal');
                    const imgEl = item.querySelector('img');

                    return {
                        externalId: item.getAttribute('data-asin') || Math.random().toString(),
                        title: titleEl?.textContent?.trim() || 'Produto sem título',
                        price: parseFloat(priceEl?.textContent?.replace('.', '').replace(',', '.') || '0'),
                        image: imgEl?.getAttribute('src'),
                        url: linkEl ? 'https://www.amazon.com.br' + linkEl.getAttribute('href') : '',
                    };
                }).filter(i => i.price > 0);
            });
        },
    });

    await crawler.run(['https://www.amazon.com.br/deals']);
    return offers;
};