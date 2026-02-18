
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  program: string;
  year: number;
  bio: string;
  cleanliness: number; // 1-5
  sleep_schedule: 'early' | 'night';
  gender_preference?: string;
  budget_min: number;
  budget_max: number;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  location: string;
  price: number;
  start_date: string;
  end_date: string;
  room_type: 'private' | 'shared';
  amenities: string[];
  description: string;
  photo_urls: string[];
  created_at: string;
  lister_profile?: UserProfile;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

export interface MatchScore {
  score: number;
  reasons: string[];
}
