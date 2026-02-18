
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Listing } from "../types";

export const getAIMatchExplanation = async (user: UserProfile, listing: Listing, score: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze compatibility for a student sublet.
        Tenant: Uni ${user.university}, Clean ${user.cleanliness}/5, Sleep ${user.sleep_schedule}.
        Listing: Uni ${listing.lister_profile?.university || 'Any'}, Rent $${listing.price}.
        Score: ${score}%.
        Provide a 2-sentence lifestyle sync summary.
      `,
    });
    return response.text || "Strong lifestyle alignment and institutional proximity make this a high-quality match.";
  } catch (error) {
    console.error("Gemini Match Error:", error);
    return "Institutional proximity and shared lifestyle preferences indicate high compatibility.";
  }
};

/**
 * AI Web Scraper: Searches the web for real-time student housing data.
 * This pulls live data from the internet to supplement the community database.
 */
export const searchWebListings = async (query: string, university: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ACT AS AN AI REAL ESTATE SCRAPER.
      Find the 5 most recent and active student sublet listings, dorm swaps, or off-campus housing posts for students at ${university} in/near ${query}.
      
      For each listing, I need:
      1. Property Title
      2. Exact or estimated monthly rent
      3. Precise Neighborhood
      4. A brief 1-sentence description.
      
      BE ACCURATE. ONLY INCLUDE RESULTS YOU CAN FIND URLS FOR.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Map the grounding chunks to structured sources
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || "External Marketplace Listing",
        url: chunk.web.uri
      }));

    return {
      text,
      sources
    };
  } catch (error) {
    console.error("Gemini Web Scraper Error:", error);
    return {
      text: "Our AI scraper is currently facing restrictions on external sites. Please browse our verified student-posted marketplace below.",
      sources: []
    };
  }
};
