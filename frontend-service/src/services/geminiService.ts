import { GoogleGenAI } from "@google/genai";
import { UserRole } from "../types";

export const getAIGreeting = async (name: string, role: UserRole): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = role === UserRole.LECTURER 
    ? `Write a short, professional, and inspiring one-sentence welcome message for a lecturer named ${name}.`
    : `Write a short, encouraging, and friendly one-sentence welcome message for a college student named ${name}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });
    return response.text || "Welcome back to your academic portal!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Welcome back to EduPortal AI!";
  }
};

export const getSmartSuggestions = async (role: UserRole): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = role === UserRole.LECTURER
    ? "Suggest 3 quick academic tasks for a lecturer today (e.g., review papers, prepare slides). Keep them brief."
    : "Suggest 3 quick academic focus areas for a student today (e.g., finish math homework, read chapter 4). Keep them brief.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.5,
      }
    });
    
    // Simple split by newline or numbering
    return (response.text || "")
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3)
      .map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    return ["Review your schedule", "Check notifications", "Update profile"];
  }
};
