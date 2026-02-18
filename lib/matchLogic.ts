
import { UserProfile, Listing, MatchScore } from "../types";

export const calculateMatchScore = (user: UserProfile, listing: Listing): MatchScore => {
  let score = 0;
  const reasons: string[] = [];

  // 1. University Match (+30)
  if (user.university && listing.lister_profile?.university && 
      user.university.toLowerCase().trim() === listing.lister_profile.university.toLowerCase().trim()) {
    score += 30;
    reasons.push(`Both attend ${user.university}`);
  }

  // 2. Budget Match (+30)
  // Check if listing price falls within user's preferred range
  if (listing.price >= user.budget_min && listing.price <= user.budget_max) {
    score += 30;
    reasons.push("Perfect budget alignment");
  } else if (listing.price <= user.budget_max + 150) {
    score += 15;
    reasons.push("Near budget range");
  }

  if (listing.lister_profile) {
    // 3. Gender Preference Match (+20)
    // If lister has a preference and user matches it, or no preference
    if (!listing.lister_profile.gender_preference || 
        listing.lister_profile.gender_preference === 'none' ||
        listing.lister_profile.gender_preference === user.gender_preference) {
      score += 20;
      reasons.push("Gender preference compatible");
    }

    // 4. Cleanliness Similarity (+10)
    const cleanDiff = Math.abs((user.cleanliness || 3) - (listing.lister_profile.cleanliness || 3));
    if (cleanDiff <= 1) {
      score += 10;
      reasons.push("Similar cleanliness standards");
    }

    // 5. Sleep Schedule Match (+10)
    if (user.sleep_schedule === listing.lister_profile.sleep_schedule) {
      score += 10;
      reasons.push(`Shared ${user.sleep_schedule} lifestyle`);
    }
  } else {
    // Fallback if no lister profile
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};
