import axios from 'axios';

const API_URL = 'http://localhost:8080'; // Se o bot rodar fora do docker, use localhost. Se rodar dentro, use 'evolution'
const API_KEY = '42D6D73-6290-4C4F-AF69-123456789';
const INSTANCE = 'EconomiaDaily';

export const sendToWhatsApp = async (text: string, image?: string) => {
    try {
        // Se tiver imagem, usa sendMedia, se não, sendText
        const endpoint = image ? '/message/sendMedia' : '/message/sendText';
        const payload = image ? {
            number: "SEU_GRUPO_OU_NUMERO",
            mediaMessage: {
                mediatype: "image",
                caption: text,
                media: image
            }
        } : {
            number: "SEU_GRUPO_OU_NUMERO",
            textMessage: { text }
        };

        await axios.post(`${API_URL}${endpoint}/${INSTANCE}`, payload, {
            headers: { 'apikey': API_KEY }
        });
        console.log("📤 Publicado no WhatsApp!");
    } catch (error) {
        console.error("❌ Erro ao enviar WhatsApp:", error);
    }
};