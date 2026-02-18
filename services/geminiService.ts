
import { GoogleGenAI, Type } from "@google/genai";
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
 * AI Web Scraper: Searches the web and returns STRUCTURED JSON.
 * This is used to populate the Supabase database with live external data.
 */
export const searchWebListings = async (query: string, university: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ACT AS AN AI REAL ESTATE AGGREGATOR.
      Find 5 real student sublets or off-campus housing posts for ${university} in ${query}.
      
      You MUST return valid JSON only. An array of objects with these keys:
      - title: string
      - price: number (monthly rent)
      - location: string (neighborhood)
      - description: string (summary)
      - room_type: "private" | "shared" | "studio"
      - start_date: string (YYYY-MM-DD)
      - end_date: string (YYYY-MM-DD)
      - photo_urls: string[] (at least one valid architectural/interior unsplash URL)
      - amenities: string[] (Wifi, Laundry, etc.)
      
      Use recent dates (e.g., starting next month).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              room_type: { type: Type.STRING },
              start_date: { type: Type.STRING },
              end_date: { type: Type.STRING },
              photo_urls: { type: Type.ARRAY, items: { type: Type.STRING } },
              amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["title", "price", "location", "description", "room_type", "start_date", "end_date", "photo_urls", "amenities"]
          }
        }
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Web Scraper Error:", error);
    return [];
  }
};
