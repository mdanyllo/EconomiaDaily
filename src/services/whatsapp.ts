import axios from 'axios';

// Agora pegamos os dados direto do arquivo .env que o Docker carregou
const API_URL = process.env.EVOLUTION_API_URL || 'http://evolution:8080'; 
const API_KEY = process.env.EVOLUTION_API_KEY || '42D6D73-6290-4C4F-AF69-123456789';
const INSTANCE = 'EconomiaDaily';

export const sendToWhatsApp = async (text: string, image?: string) => {
    try {
        // Se tiver imagem, usa sendMedia, se não, sendText
        const endpoint = image ? '/message/sendMedia' : '/message/sendText';
        
        // Ajuste no payload para o padrão da Evolution API v1.5.4
        const payload: any = {
            number: "120363409994831728@g.us", // Certifique-se que este número está correto
            delay: 1200,
            linkPreview: true
        };

        if (image) {
            payload.mediaMessage = {
                mediatype: "image",
                caption: text,
                media: image
            };
        } else {
            payload.textMessage = { 
                text: text 
            };
        }

        // A URL agora usa 'evolution' (nome do serviço no docker-compose)
        await axios.post(`${API_URL}${endpoint}/${INSTANCE}`, payload, {
            headers: { 'apikey': API_KEY }
        });
        
        console.log("📤 Publicado no WhatsApp!");
    } catch (error) {
        // Log mais detalhado para ajudar no debug dentro do Docker
        if (axios.isAxiosError(error)) {
            console.error("❌ Erro ao enviar WhatsApp:", error.response?.data || error.message);
        } else {
            console.error("❌ Erro inesperado:", error);
        }
    }
}