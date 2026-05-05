import axios from 'axios';

const API_URL = process.env.EVOLUTION_API_URL || 'http://evolution:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || '42D6D73-6290-4C4F-AF69-123456789';
const INSTANCE = 'EconomiaDaily';

export const sendToWhatsApp = async (text: string, image?: string) => {
    try {
        const endpoint = image ? '/message/sendMedia' : '/message/sendText';
        const fullUrl = `${API_URL}${endpoint}/${INSTANCE}`;

        const payload: any = {
            number: "120363409994831728@g.us",
            delay: 1200,
        };

        if (image) {
            payload.mediaMessage = {
                mediatype: "image",
                caption: text,
                media: image,
            };
        } else {
            payload.textMessage = { text };
        }

        // 👇 Mostra tudo que vai ser enviado
        console.log("📦 URL:", fullUrl);
        console.log("📦 Payload:", JSON.stringify(payload, null, 2));
        console.log("📦 Image URL:", image || 'nenhuma');

        const response = await axios.post(fullUrl, payload, {
            headers: { 'apikey': API_KEY }
        });

        // 👇 Mostra o que a Evolution respondeu
        console.log("✅ Resposta da Evolution:", JSON.stringify(response.data, null, 2));
        console.log("📤 Publicado no WhatsApp!");

    } catch (error) {
        if (axios.isAxiosError(error)) {
            // 👇 Mostra o erro completo da API
            console.error("❌ Status HTTP:", error.response?.status);
            console.error("❌ Erro da Evolution:", JSON.stringify(error.response?.data, null, 2));
            console.error("❌ Mensagem:", error.message);
        } else {
            console.error("❌ Erro inesperado:", error);
        }
    }
}