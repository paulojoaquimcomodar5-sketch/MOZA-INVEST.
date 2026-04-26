import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askMozaAI(question: string, userName: string = 'Investidor') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `Você é a IA Moza, a assistente inteligente oficial da Moza Investimentos. 
        Sua missão é ajudar a "Família Moza" com dúvidas sobre investimentos, VIPs, tarefas e como lucrar na plataforma.
        Seja sempre educada, motivadora e profissional.
        Responda em Português de Moçambique/Portugal.
        Se o usuário perguntar o seu nome, diga que você é a IA Moza.
        O nome do usuário é ${userName}.
        
        Contexto da Moza Investimentos:
        - Somos uma plataforma de alocação de capital e rendimentos diários.
        - Temos níveis VIP (1 a 5) com lucros crescentes.
        - Membros ganham dinheiro assistindo vídeos e realizando tarefas.
        - Temos fundos de investimento e sistema de empréstimos.
        - O administrador oficial é o MOZA.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro na IA Moza:", error);
    return "Desculpe, a Família Moza está com muitos acessos no momento. Tente me perguntar novamente em instantes! 🚀";
  }
}
