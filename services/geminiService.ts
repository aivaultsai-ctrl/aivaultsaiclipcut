import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoClip, ViralScoreResult, AdContent } from "../types";

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

// 4. Affiliate Ad Generator (The "Agent")
export const generateAffiliateAd = async (): Promise<AdContent> => {
  const ai = getAiClient();
  const YOUR_AMAZON_AFFILIATE_ID = "aivaultsai-20"; 

  // Pick a random niche to keep ads fresh
  const niches = [
    "Wireless Microphones for Creators",
    "RGB Ring Lights",
    "4K Webcams",
    "AI Video Editing Software",
    "Noise Cancelling Headphones",
    "Smartphone Gimbals",
    "Green Screens for Streaming",
    "Podcast Equipment Bundles"
  ];
  const randomNiche = niches[Math.floor(Math.random() * niches.length)];

  const prompt = `
    You are a marketing expert maximizing affiliate revenue.
    Generate a high-converting, realistic ad for a top-tier product in the category: "${randomNiche}".
    
    The product should be a real, popular item (e.g. DJI Mic 2, Elgato Key Light, Sony ZV-E10).
    Create a catchy tagline and a short persuasive description.
    
    Return JSON format:
    - sponsorName: Product Name (exact model name)
    - sponsorTagline: Short catchy hook
    - description: 1-2 sentences why a creator needs this.
    - ctaText: "Buy Now", "Get 20% Off", etc.
    - themeColor: A hex color code matching the product vibe (e.g., #FF5500)

    IMPORTANT: Do not generate an affiliateLink in the JSON. I will generate it programmatically.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sponsorName: { type: Type.STRING },
      sponsorTagline: { type: Type.STRING },
      description: { type: Type.STRING },
      ctaText: { type: Type.STRING },
      themeColor: { type: Type.STRING },
    },
    required: ["sponsorName", "sponsorTagline", "description", "ctaText", "themeColor"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No ad generated");
    
    const adData = JSON.parse(text);

    // Construct REAL Amazon Affiliate Link with your ID
    // We use the Search URL method to ensure the link is always valid and 
    // tracks to your ID regardless of specific product availability.
    const query = encodeURIComponent(adData.sponsorName);
    const realMoneyLink = `https://www.amazon.com/s?k=${query}&tag=${YOUR_AMAZON_AFFILIATE_ID}`;

    return {
      ...adData,
      affiliateLink: realMoneyLink,
      id: Date.now().toString(),
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Ad Generation Error:", error);
    // Fallback ad with your specific link
    return {
      id: "fallback",
      sponsorName: "AIVaults Recommended Gear",
      sponsorTagline: "Upgrade Your Studio",
      description: "Check out our curated list of essential tools for content creators.",
      ctaText: "View Gear",
      affiliateLink: "https://www.amazon.com?&linkCode=ll2&tag=aivaultsai-20&linkId=3e91a71879b1273b3b901635a8796a15&language=en_US&ref_=as_li_ss_tl",
      themeColor: "#14b8a6",
      generatedAt: new Date().toISOString()
    };
  }
};