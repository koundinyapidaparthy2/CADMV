import { GoogleGenAI, Type } from "@google/genai";
import { getGenerationPrompt } from '../constants';
import { QuizData, QuizConfig } from '../types';

export const generateQuiz = async (config: QuizConfig, seenHashes: string[] = []): Promise<QuizData> => {
  try {
    // Safely retrieve and sanitize API Key
    let apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

    // Handle string "undefined" which can happen in some build/shim environments
    if (apiKey === 'undefined' || apiKey === 'null') {
      apiKey = undefined;
    }
    
    // Aggressive cleaning of the key
    if (apiKey) {
      // Remove any surrounding quotes that might have been injected
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      // Remove any whitespace including newlines
      apiKey = apiKey.trim();
    }

    if (!apiKey) {
      throw new Error("API Key is missing. Please select your Google API Key.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview";
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        quizTitle: { type: Type.STRING },
        totalQuestions: { type: Type.INTEGER },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionId: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              questionImageUrl: { type: Type.STRING, nullable: true },
              optionImageUrls: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
            },
            required: ["questionId", "difficulty", "question", "options", "correctAnswer"],
          },
        },
      },
      required: ["quizTitle", "totalQuestions", "questions"],
    };

    const prompt = getGenerationPrompt(config, seenHashes);

    // Build configuration object
    const generationConfig: any = {
      systemInstruction: "You are a California DMV examiner. Ensure strict accuracy to the 2025 Handbook. For sign questions, YOU MUST use the 'STABLE ASSET URLS' provided in the handbook context whenever possible. Only use real Wikimedia Commons links. Do not hallucinate URLs.",
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      maxOutputTokens: 12000, 
      // Note: We are not setting thinkingConfig to allow the model to use its default behavior.
      // This also avoids potential configuration conflicts in certain environments.
    };

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: generationConfig,
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model.");

    return JSON.parse(text) as QuizData;
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    
    const msg = error.message || "";
    // Handle specific Google API Auth errors
    if (msg.includes("401") || msg.includes("UNAUTHENTICATED") || msg.includes("CREDENTIALS_MISSING") || msg.includes("API keys are not supported")) {
      throw new Error("Authentication failed. Please re-select your Google API Key and ensure your project has the Generative Language API enabled.");
    }
    
    throw error;
  }
};