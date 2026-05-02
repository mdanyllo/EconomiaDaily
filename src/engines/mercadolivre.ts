import { PlaywrightCrawler } from 'crawlee';

export const scanML = async () => {
    let offers: any[] = [];
    const crawler = new PlaywrightCrawler({
        async requestHandler({ page }) {
            // Seletor da lista de ofertas do dia do ML
            await page.waitForSelector('.poly-card');
            
            offers = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll('.poly-card')).slice(0, 5); // Pega as 5 primeiras
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