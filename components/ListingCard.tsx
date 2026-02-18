
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Zap, Star } from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { calculateMatchScore } from '../lib/matchLogic';
import { supabase } from '../lib/supabase';

const CircularProgress = ({ score }: { score: number }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          className="text-zinc-800"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeWidth="3"
          strokeLinecap="round"
          stroke="url(#gradient)"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[8px] font-black text-white">{score}%</span>
    </div>
  );
};

const ListingCard: React.FC<{ listing: Listing, user: UserProfile }> = ({ listing, user }) => {
  const match = calculateMatchScore(user, listing);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [listing.id, user.id]);

  const checkIfSaved = async () => {
    const { data } = await supabase
      .from('saved_listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();
    
    setIsSaved(!!data);
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id);
      setIsSaved(false);
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: user.id, listing_id: listing.id });
      setIsSaved(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="flex flex-col gap-4 group cursor-pointer"
    >
      <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-white/5 bg-zinc-900 shadow-xl group-hover:shadow-rose-500/5 transition-all duration-500">
        <Link to={`/listing/${listing.id}`} className="block w-full h-full">
          <img 
            src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop'} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
        </Link>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="glass px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border-white/10 pointer-events-auto">
            <CircularProgress score={match.score} />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-rose-500 leading-none">AI MATCH</span>
              <span className="text-[10px] font-bold text-white tracking-tight">Best Tenant</span>
            </div>
          </div>

          <button 
            onClick={toggleSave}
            className="p-2.5 rounded-full glass border-white/10 text-white transition-all hover:scale-110 active:scale-90 pointer-events-auto"
          >
            <Heart 
              size={18} 
              className={`transition-all ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-white/80'}`} 
            />
          </button>
        </div>

        {/* Bottom Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
           <div className="flex items-center gap-1.5 text-rose-400 font-black text-[10px] uppercase tracking-widest mb-1">
             <Star size={10} className="fill-current" />
             Verified Student
           </div>
           <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-rose-400 transition-colors">
             {listing.title}
           </h3>
        </div>
      </div>

      <Link to={`/listing/${listing.id}`} className="px-2 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-semibold">{listing.location}</span>
          <span className="text-zinc-500 font-medium">Available now</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-white">${listing.price}</span>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">/ month</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard;
