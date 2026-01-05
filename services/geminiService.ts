import { GoogleGenAI, Type } from "@google/genai";

// WARNING: In a real production app, never expose API keys on the client side.
// This should be proxied through a backend. 
// For this demo structure, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const sendChatMessage = async (history: {role: 'user' | 'model', text: string}[], newMessage: string) => {
  if (!API_KEY) {
    return "Xin chào! Tôi là trợ lý ảo TaxGo. Hiện tại tôi đang chạy ở chế độ demo do chưa có API Key. Tôi có thể giúp bạn giải đáp các thắc mắc về Thông tư 40, cách tính thuế khoán và kê khai thuế.";
  }

  try {
    const model = 'gemini-3-flash-preview';

    const systemInstruction = `Bạn là TaxGo AI, một chuyên gia về thuế hộ kinh doanh tại Việt Nam. 
    Nhiệm vụ của bạn là giải thích các quy định thuế (Thông tư 40/2021/TT-BTC), 
    cảnh báo rủi ro phạt, và hướng dẫn kê khai.
    Hãy trả lời ngắn gọn, dễ hiểu, giọng điệu chuyên nghiệp và hỗ trợ.
    Không đưa ra lời khuyên trốn thuế. Luôn khuyến khích tuân thủ pháp luật.`;

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    // In a real app we would properly sync history, here we just send the latest message for the demo context
    const result = await chat.sendMessage({ message: newMessage });
    return result.text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Xin lỗi, hiện tại tôi không thể kết nối với máy chủ. Vui lòng thử lại sau.";
  }
};

export interface InvoiceData {
  amount: number;
  date: string;
  description: string;
  category: string;
}

export const analyzeInvoiceImage = async (base64Data: string): Promise<InvoiceData | null> => {
  if (!API_KEY) {
    console.warn("No API Key available for OCR");
    return null;
  }

  try {
    // gemini-3-flash-preview is good for multimodal tasks (Image -> Text/JSON)
    const model = 'gemini-3-flash-preview'; 

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: base64Data
            }
          },
          {
            text: `Analyze this receipt/invoice image and extract the following information in JSON format:
            1. 'amount': The total monetary amount (number only).
            2. 'date': The date of transaction in YYYY-MM-DD format.
            3. 'description': A short summary of the items or service.
            4. 'category': ONE of the following values based on content: 'SUPPLIES', 'RENT', 'UTILITIES', 'MARKETING', 'SALARY', 'OTHER'.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['SUPPLIES', 'RENT', 'UTILITIES', 'MARKETING', 'SALARY', 'OTHER'] }
          },
          required: ["amount", "description", "category"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InvoiceData;
    }
    return null;

  } catch (error) {
    console.error("OCR Analysis Error:", error);
    return null;
  }
};
