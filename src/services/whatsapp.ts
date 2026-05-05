import axios from 'axios';

const API_URL = process.env.EVOLUTION_API_URL || 'http://evolution:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || '42D6D73-6290-4C4F-AF69-123456789';
const INSTANCE = 'EconomiaDaily';

export const sendToWhatsApp = async (text: string) => {
    try {
        const response = await axios.post(`${API_URL}/message/sendText/${INSTANCE}`, {
            number: "120363409994831728@g.us",
            delay: 1200,
            textMessage: { text }
        }, {
            headers: { 'apikey': API_KEY }
        });

        console.log("✅ Resposta da Evolution:", JSON.stringify(response.data, null, 2));
        console.log("📤 Publicado no WhatsApp!");

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("❌ Status HTTP:", error.response?.status);
            console.error("❌ Erro da Evolution:", JSON.stringify(error.response?.data, null, 2));
            console.error("❌ Mensagem:", error.message);
        } else {
            console.error("❌ Erro inesperado:", error);
        }
    }
}