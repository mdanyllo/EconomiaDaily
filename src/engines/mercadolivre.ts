import { PlaywrightCrawler } from 'crawlee';

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
                // Pegamos apenas 3 para o WhatsApp não barrar
                const items = Array.from(document.querySelectorAll('.poly-card')).slice(0, 3);
                
                return items.map(item => {
                    const linkEl = item.querySelector('a');
                    const imgEl = item.querySelector('img');
                    const priceEl = item.querySelector('.andes-money-amount__fraction');
                    
                    const originalUrl = linkEl?.getAttribute('href') || '';
                    
                    /* 
                       Lógica de Afiliado ML: 
                       Para gerar o link curto 'social', precisaria da API. 
                       Aqui vamos enviar o link com o seu matt_word para rastreio básico.
                    */
                    const affiliateUrl = originalUrl.includes('?') 
                        ? `${originalUrl}&matt_word=economiadaily` 
                        : `${originalUrl}?matt_word=economiadaily`;

                    return {
                        externalId: originalUrl.split('MLB-')[1]?.split('-')[0] || Math.random().toString(),
                        title: item.querySelector('.poly-component__title')?.textContent?.trim(),
                        price: parseFloat(priceEl?.textContent?.replace('.', '') || '0'),
                        image: imgEl?.src || imgEl?.getAttribute('data-src') || '', // ML usa lazy load
                        url: affiliateUrl,
                    };
                });
            });
        },
    });

    await crawler.run(['https://www.mercadolivre.com.br/ofertas']);
    return offers;
};