import { PlaywrightCrawler } from 'crawlee';

export const scanAmazon = async () => {
    let offers: any[] = [];
    
    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                // Mude para false para ver o navegador abrindo e entender o que a Amazon está fazendo
                headless: true, 
                args: ['--disable-blink-features=AutomationControlled'],
            },
        },
        // Aumentamos o tempo de espera porque a Amazon é pesada
        requestHandlerTimeoutSecs: 60, 
        
        async requestHandler({ page, log }) {
            log.info('Acessando Amazon Brasil...');
            
            // 1. Tenta esperar um seletor mais genérico de produto
            try {
                await page.waitForSelector('div[data-asin]', { timeout: 20000 });
            } catch (e) {
                log.error('A Amazon bloqueou ou mudou o layout. Tirando print para conferir...');
                await page.screenshot({ path: 'erro-amazon.png' });
                return;
            }

            offers = await page.evaluate(() => {
                // Pegamos os itens que têm o atributo ASIN (padrão Amazon)
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
                }).filter(i => i.price > 0); // Remove o que não tem preço
            });
        },
    });

    // Vamos tentar uma URL de ofertas mais direta
    await crawler.run(['https://www.amazon.com.br/deals']);
    return offers;
};