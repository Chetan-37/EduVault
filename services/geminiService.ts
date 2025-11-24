import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
// Note: In a real production app, calls should go through a backend to protect the key.
// For this frontend-only demo, we use the environment variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates a study plan or summary based on metadata.
   */
  generateStudyPlan: async (course: string, subject: string, topics: string[] = []): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is missing. Please configure the environment to use AI features.";
    }

    try {
      const prompt = `
        Act as an expert academic tutor. 
        Create a concise, high-impact study guide for a student studying:
        Course: ${course}
        Subject: ${subject}
        
        The student is reviewing previous year question papers. 
        Please provide:
        1. A list of 5 key concepts that are frequently asked in exams for this subject.
        2. A suggested breakdown of how to approach studying this subject.
        3. A motivational quote for exam preparation.

        Format the output in clean Markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "No study plan generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Sorry, I couldn't generate a study plan at this moment. Please try again later.";
    }
  },

  /**
   * Analyze paper topics (Simulated analysis based on paper title/subject since we can't OCR client-side easily)
   */
  analyzePaperTrend: async (subject: string, years: number[]): Promise<string> => {
      if (!process.env.API_KEY) {
          return "API Key missing.";
      }
      try {
          const prompt = `
            Analyze the typical academic trends for the subject "${subject}".
            Considering exams from years: ${years.join(', ')}.
            
            Predict 3 potential "Hot Topics" that are likely to appear in the upcoming exam based on general curriculum patterns for this subject.
            Keep it brief and actionable.
          `;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          return response.text || "Analysis unavailable.";
      } catch (error) {
          console.error(error);
          return "Could not analyze trends.";
      }
  }
};