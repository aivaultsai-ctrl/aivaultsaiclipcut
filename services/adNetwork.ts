import { AdContent } from "../types";
import { generateAffiliateAd } from "./geminiService";

const AD_STORAGE_KEY = "daily_ad_campaign";
const AD_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getDailyAd = async (): Promise<AdContent> => {
  // 1. Check Local Storage
  const storedAd = localStorage.getItem(AD_STORAGE_KEY);
  
  if (storedAd) {
    try {
      const ad: AdContent = JSON.parse(storedAd);
      const generatedTime = new Date(ad.generatedAt).getTime();
      const now = new Date().getTime();
      
      // Calculate age
      const age = now - generatedTime;

      // If ad is less than 24 hours old, return it
      if (age < AD_EXPIRY_MS) {
        console.log(`Serving cached ad: ${ad.sponsorName} (${(age / (1000 * 60 * 60)).toFixed(1)} hours old)`);
        return ad;
      }
      
      console.log("Cached ad expired (>24h). Refreshing campaign...");
    } catch (e) {
      console.warn("Failed to parse stored ad or invalid date", e);
    }
  }

  // 2. Generate New Ad (if expired or missing)
  console.log("Generating fresh ad campaign...");
  try {
    const newAd = await generateAffiliateAd();
    
    // Ensure timestamp is set to now
    const adWithTimestamp = {
        ...newAd,
        generatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(adWithTimestamp));
    return adWithTimestamp;
  } catch (error) {
    console.error("Failed to generate ad", error);
    // Return a safe fallback with your specific tracking link
    return {
      id: "default",
      sponsorName: "Creator Tools Pro",
      sponsorTagline: "Everything you need to grow",
      description: "Check out the latest gear for content creators.",
      ctaText: "View Offer",
      // Your specific fallback link ensures you monetize even on errors
      affiliateLink: "https://www.amazon.com?&linkCode=ll2&tag=aivaultsai-20&linkId=3e91a71879b1273b3b901635a8796a15&language=en_US&ref_=as_li_ss_tl",
      themeColor: "#6366f1",
      generatedAt: new Date().toISOString()
    };
  }
};