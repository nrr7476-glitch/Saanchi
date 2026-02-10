
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDairyAnnouncement = async (isOpen: boolean, dairyName: string): Promise<string> => {
  try {
    const prompt = isOpen 
      ? `Generate a warm, professional, and welcoming opening announcement in Hindi for a milk dairy named '${dairyName}'. Mention that fresh milk, curd, and paneer are available. Keep it short (max 2 sentences).`
      : `Generate a polite closing announcement in Hindi for a milk dairy named '${dairyName}'. Mention that we will open tomorrow morning. Keep it short and respectful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant writing marketing copy for a local Indian dairy shop. Use polite and clear Hindi.",
        temperature: 0.7,
      },
    });

    return response.text || (isOpen ? "दुकान खुल गई है! ताज़ा दूध के लिए पधारें।" : "दुकान अभी बंद है। हम कल सुबह फिर मिलेंगे।");
  } catch (error) {
    console.error("Error generating announcement:", error);
    return isOpen ? "दुकान खुल गई है!" : "दुकान अभी बंद है।";
  }
};
