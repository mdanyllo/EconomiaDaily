import { PlaywrightCrawler } from 'crawlee';

export const scanML = async () => {
    let offers: any[] = [];
    const crawler = new PlaywrightCrawler({
        // LIMITES DE MEMÓRIA:
        maxConcurrency: 1, // Apenas uma aba por vez
        launchContext: {
            launchOptions: {
                headless: true,
                // Argumentos para economizar RAM
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], 
            },
        },
        async requestHandler({ page }) {
            // Bloqueia imagens e CSS se o seu foco for apenas o texto/preço (ECONOMIZA MUITA RAM)
            // await page.route('**/*.{png,jpg,jpeg,css}', route => route.abort());

            await page.waitForSelector('.poly-card', { timeout: 30000 });
            
            offers = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.poly-card')).slice(0, 5);
                return items.map(item => ({
                    externalId: item.querySelector('a')?.getAttribute('href')?.split('MLB-')[1]?.split('-')[0] || Math.random().toString(),
                    title: item.querySelector('.poly-component__title')?.textContent?.trim(),
                    price: parseFloat(item.querySelector('.andes-money-amount__fraction')?.textContent?.replace('.', '') || '0'),
                    image: item.querySelector('img')?.getAttribute('src'),
                    url: item.querySelector('a')?.getAttribute('href'),
                }));
            });
        },
    });

    await crawler.run(['https://www.mercadolivre.com.br/ofertas']);
    return offers;
};