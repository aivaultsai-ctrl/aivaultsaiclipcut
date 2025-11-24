import { AdContent } from "../types";
import { generateAffiliateAd } from "./geminiService";

const AD_STORAGE_KEY = "daily_ad_campaign";

export const getDailyAd = async (): Promise<AdContent> => {
  // 1. Check Local Storage
  const storedAd = localStorage.getItem(AD_STORAGE_KEY);
  
  if (storedAd) {
    try {
      const ad: AdContent = JSON.parse(storedAd);
      const generatedDate = new Date(ad.generatedAt);
      const now = new Date();
      
      // Calculate hours difference
      const diffTime = Math.abs(now.getTime() - generatedDate.getTime());
      const diffHours = diffTime / (1000 * 60 * 60);

      // If ad is less than 24 hours old, return it
      if (diffHours < 24) {
        console.log("Serving cached ad:", ad.sponsorName);
        return ad;
      }
    } catch (e) {
      console.warn("Failed to parse stored ad", e);
    }
  }

  // 2. Generate New Ad (if expired or missing)
  console.log("Generating fresh ad campaign...");
  try {
    const newAd = await generateAffiliateAd();
    
    // In a real scenario, here you would overwrite 'newAd.affiliateLink' 
    // with your specific affiliate ID mapping logic.
    // e.g., if (newAd.sponsorName.includes("DJI")) newAd.affiliateLink = "YOUR_DJI_LINK";
    
    localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(newAd));
    return newAd;
  } catch (error) {
    console.error("Failed to generate ad", error);
    // Return a safe fallback
    return {
      id: "default",
      sponsorName: "Creator Tools Pro",
      sponsorTagline: "Everything you need to grow",
      description: "Check out the latest gear for content creators.",
      ctaText: "View Offer",
      affiliateLink: "#",
      themeColor: "#6366f1",
      generatedAt: new Date().toISOString()
    };
  }
};