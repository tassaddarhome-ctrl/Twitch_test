import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT } from "../constants";
import { TriviaQuestion, StorySegment } from "../types";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    // In a real scenario, we assume process.env.API_KEY is available.
    // For this demo context, ensure the environment is set up correctly.
    if (process.env.API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
      console.warn("API Key missing for Gemini.");
    }
  }
  return ai;
};

export const generateTriviaQuestion = async (topic: string = "general knowledge"): Promise<TriviaQuestion | null> => {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: `Generate a fun, engaging trivia question about ${topic} in Russian language. Provide 4 distinct options and indicate the correct one.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              minItems: 4,
              maxItems: 4
            },
            correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          },
          required: ["question", "options", "correctAnswerIndex", "difficulty"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as TriviaQuestion;
  } catch (error) {
    console.error("Error generating trivia:", error);
    return null;
  }
};

export const generateStoryStart = async (): Promise<StorySegment | null> => {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: "Start a short, adventurous interactive story in Russian (approx 50 words). Provide the story text and two distinct choices for what the main character should do next.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            optionA: { type: Type.STRING },
            optionB: { type: Type.STRING }
          },
          required: ["text", "optionA", "optionB"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as StorySegment;
  } catch (error) {
    console.error("Error generating story:", error);
    return null;
  }
};

export const generateStoryContinuation = async (currentStory: string, choice: string): Promise<StorySegment | null> => {
  const client = getAI();
  if (!client) return null;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: `Continue this story in Russian: "${currentStory}". The user chose: "${choice}". Write the next segment (approx 50 words) and provide two new distinct choices.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            optionA: { type: Type.STRING },
            optionB: { type: Type.STRING }
          },
          required: ["text", "optionA", "optionB"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as StorySegment;
  } catch (error) {
    console.error("Error continuing story:", error);
    return null;
  }
};