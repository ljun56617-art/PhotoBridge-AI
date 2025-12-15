import { GoogleGenAI, Type } from "@google/genai";

// We use the new @google/genai library pattern
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export interface AIAnalysisResult {
  tags: string[];
  description: string;
  ratingSuggestion: number;
}

export const analyzeImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const ai = getClient();
  
  // Using gemini-2.5-flash for speed and vision capabilities
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Analyze this image for a photo management application.
    1. Provide 5-10 precise, searchable tags (keywords) describing the content, mood, and technical aspects (e.g., "landscape", "low-light", "bokeh").
    2. Write a concise 1-sentence description.
    3. Suggest a technical rating from 1 to 5 based on composition, focus, and exposure (1=poor, 5=professional).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of relevant tags"
            },
            description: {
              type: Type.STRING,
              description: "Short description of the photo"
            },
            ratingSuggestion: {
              type: Type.INTEGER,
              description: "Suggested rating 1-5"
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
