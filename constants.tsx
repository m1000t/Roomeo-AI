
import React from 'react';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Heart, 
  PlusCircle, 
  Zap, 
  Shield, 
  Globe,
  Star,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

export const AMENITIES = [
  'Wifi', 'Kitchen', 'Laundry', 'Parking', 'Gym', 
  'Study Room', 'Air Conditioning', 'Private Bathroom', 'Furnished'
];

export const NAV_ITEMS = [
  { label: 'Explore', icon: <Search size={20} />, path: '/' },
  { label: 'Saved', icon: <Heart size={20} />, path: '/saved' },
  { label: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
  { label: 'List Space', icon: <PlusCircle size={20} />, path: '/create' },
  { label: 'Profile', icon: <User size={20} />, path: '/profile' },
];

export const MOCK_USER: any = {
  id: 'user-1',
  name: 'Alex Rivera',
  university: 'Stanford University',
  program: 'Computer Science',
  year: 3,
  cleanliness: 4,
  sleep_schedule: 'night',
  budget_min: 1200,
  budget_max: 2000,
  bio: 'Quiet CS student looking for a summer sublet near Palo Alto. Clean, organized, and spends most time at the library or lab.'
};

export const MOCK_LISTINGS: any[] = [
  {
    id: 'listing-1',
    user_id: 'user-2',
    title: 'Modern Apartment near Campus',
    location: 'Palo Alto, CA',
    price: 1850,
    start_date: '2024-06-01',
    end_date: '2024-08-31',
    room_type: 'private',
    amenities: ['Wifi', 'Kitchen', 'Furnished'],
    description: 'Beautiful private room in a 2-bedroom apartment. 5 minutes walk to campus.',
    photo_urls: ['https://picsum.photos/seed/apt1/800/600'],
    created_at: new Date().toISOString(),
    lister_profile: {
      name: 'Jordan Smith',
      university: 'Stanford University',
      cleanliness: 4,
      sleep_schedule: 'night'
    }
  },
  {
    id: 'listing-2',
    user_id: 'user-3',
    title: 'Cozy Studio for Summer',
    location: 'Mountain View, CA',
    price: 2200,
    start_date: '2024-05-15',
    end_date: '2024-09-15',
    room_type: 'private',
    amenities: ['Wifi', 'Gym', 'Parking'],
    description: 'Full studio apartment, very quiet neighborhood.',
    photo_urls: ['https://picsum.photos/seed/apt2/800/600'],
    created_at: new Date().toISOString(),
    lister_profile: {
      name: 'Sarah Chen',
      university: 'UC Berkeley',
      cleanliness: 5,
      sleep_schedule: 'early'
    }
  }
];
