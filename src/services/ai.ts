import 'dotenv/config';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const generateLegenda = async (title: string, price: number, url: string): Promise<string | null> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é o social media do 'EconomiaDaily'. Crie um post curto, com emojis e gatilhos mentais para WhatsApp sobre a oferta enviada. Foque no preço e na oportunidade. É OBRIGATÓRIO incluir o link enviado no final do post."
        },
        {
          role: "user",
          content: `Produto: ${title} | Preço: R$ ${price} | Link: ${url}`
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0].message.content || null;
  } catch (error) {
    console.error("❌ Erro na Groq API:", error);
    return null;
  }
};