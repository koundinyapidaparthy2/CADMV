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
    
    // Trim if it exists
    if (apiKey) {
      apiKey = apiKey.trim();
    }

    if (!apiKey) {
      throw new Error("API Key is missing or invalid. Please ensure you have connected your Google account.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-3-flash-preview";
    
    // Adjust thinking budget based on request size to balance latency/quality
    const isLargeRequest = config.questionCount > 50;
    const thinkingBudget = isLargeRequest ? 0 : 2048;

    // Detect if running in Google AI Studio
    const isAiStudio = typeof window !== 'undefined' && !!window.aistudio;
    
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
    };

    // Only apply thinking budget if NOT in AI Studio
    // AND if the key is likely valid for thinking models (simple heuristic, not strictly needed but safe)
    if (!isAiStudio) {
      generationConfig.thinkingConfig = { thinkingBudget: thinkingBudget };
    }

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
    
    // Check for the specific 401 error message from the user's report
    if (error.message && (error.message.includes("401") || error.message.includes("CREDENTIALS_MISSING") || error.message.includes("API keys are not supported"))) {
      throw new Error("Authentication failed. Please verify your API Key is selected and valid.");
    }
    
    throw error;
  }
};