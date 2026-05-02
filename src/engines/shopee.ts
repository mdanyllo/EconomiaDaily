import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

export const scanShopee = async () => {
    let offers: any[] = [];
    const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    console.log("🚀 Iniciando extração técnica (Foco em Link Real)...");

    try {
        const scrapeResult = await app.scrape('https://shopee.com.br/search?keyword=fone%20de%20ouvido', {
            formats: [
                {
                    type: 'json',
                    // PROMPT MELHORADO: Instruímos a IA a buscar o href interno do card de produto
                    prompt: "Extraia o primeiro produto da lista de resultados. Pegue o título, o preço e, principalmente, o link (href) REAL do produto. O link deve ser o caminho específico do item (ex: /nome-do-produto-i.123.456). Ignore links de navegação do site ou propagandas.",
                    schema: {
                        type: "object",
                        properties: {
                            products: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        price: { type: "number" },
                                        url: { type: "string" }
                                    },
                                    required: ["title", "price", "url"]
                                }
                            }
                        }
                    }
                }
            ],
            // IMPORTANTE: 20s é o tempo necessário para o JS da Shopee "injetar" os links nos cards
            waitFor: 20000,
            mobile: false,
            actions: [
                { type: "scroll", direction: "down", amount: 1200 },
                { type: "wait", milliseconds: 3000 }
            ]
        });

        if (!scrapeResult || (scrapeResult as any).error) {
            console.error(`❌ Erro no Firecrawl:`, (scrapeResult as any).error);
            return [];
        }

        const data = (scrapeResult as any).json;

        if (data && data.products && data.products.length > 0) {
            offers = data.products
                .map((item: any) => {
                    let finalUrl = item.url || '';
                    
                    // Limpeza de links fakes que a IA pode gerar quando falha
                    if (finalUrl === '/' || finalUrl.includes('search') || finalUrl.length < 5) {
                        return null;
                    }

                    // Transforma link relativo (/produto-x) em link absoluto
                    if (finalUrl.startsWith('/')) {
                        finalUrl = `https://shopee.com.br${finalUrl}`;
                    }
                    
                    return {
                        externalId: `shp-${Math.random().toString(36).substring(7)}`,
                        title: item.title,
                        price: item.price,
                        image: '', 
                        url: finalUrl 
                    };
                })
                .filter((i: any) => i !== null && i.price > 0 && i.url.length > 25);
            
            offers = offers.slice(0, 1);
        }

        if (offers.length > 0) {
            console.log(`🎉 VITÓRIA! Link: ${offers[0].url}`);
        } else {
            console.warn("⚠️ Link real não encontrado. A Shopee pode estar ofuscando os seletores.");
        }

    } catch (error) {
        console.error("❌ Erro na execução:", error);
    }
    return offers;
};