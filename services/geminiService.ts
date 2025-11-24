import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoClip, ViralScoreResult } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:video/mp4;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Clip Engine Logic
export const analyzeVideoForClips = async (file: File): Promise<VideoClip[]> => {
  const ai = getAiClient();
  const base64Data = await fileToGenerativePart(file);

  const prompt = `
    You are an expert video editor and viral content strategist for TikTok and YouTube Shorts.
    Analyze this video file. Identify the 3 most engaging segments suitable for vertical short-form content (approx 30-60 seconds each).
    Focus on high energy, laughter, strong hooks, or valuable insights.
    
    For each segment return:
    - A catchy, clickbait-style title.
    - The start and end time in MM:SS format.
    - The start and end time in raw seconds (number).
    - A virality score (0-100).
    - A brief reasoning why this segment will go viral.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        startTime: { type: Type.STRING },
        endTime: { type: Type.STRING },
        startSeconds: { type: Type.NUMBER },
        endSeconds: { type: Type.NUMBER },
        viralityScore: { type: Type.NUMBER },
        description: { type: Type.STRING },
        reasoning: { type: Type.STRING }
      },
      required: ["title", "startTime", "endTime", "startSeconds", "endSeconds", "viralityScore", "description"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as VideoClip[];
  } catch (error) {
    console.error("Gemini Clip Analysis Error:", error);
    throw error;
  }
};

// 2. Viral Score Logic
export const calculateViralScore = async (file: File): Promise<ViralScoreResult> => {
  const ai = getAiClient();
  const base64Data = await fileToGenerativePart(file);

  const prompt = `
    Analyze the first 10 seconds of this video as a "Hook".
    Rate its ability to stop the scroll on social media from 0 to 100.
    Provide a critique of the visual and audio hook, and list 3 specific improvements to make it more viral.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      hookAnalysis: { type: Type.STRING },
      improvements: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING } 
      }
    },
    required: ["score", "hookAnalysis", "improvements"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ViralScoreResult;
  } catch (error) {
    console.error("Gemini Score Analysis Error:", error);
    throw error;
  }
};

// 3. Chat with Library (Contextual Query)
export const chatWithVideo = async (file: File, query: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
    const ai = getAiClient();
    const base64Data = await fileToGenerativePart(file);

    // We use a simplified approach here: Send the video with every request for context since we aren't maintaining persistent file handles in this frontend-only demo.
    // In production, you'd upload via File API and use the file URI.
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: file.type, data: base64Data } },
                    { text: `You are a helpful assistant analyzing this video. User query: ${query}` }
                ]
            }
        });
        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Sorry, I encountered an error analyzing the video.";
    }
}
