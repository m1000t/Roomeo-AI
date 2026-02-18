
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Loader2, ArrowRight } from 'lucide-react';
import { Listing, UserProfile } from '../types';
import ListingCard from '../components/ListingCard';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const SavedListings = ({ user }: { user: UserProfile }) => {
  const [saved, setSaved] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedListings();
  }, [user.id]);

  const fetchSavedListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .select(`
          listing:listings(
            *,
            lister_profile:profiles(*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Flatten the result since it's nested under 'listing'
      const listings = data.map((item: any) => item.listing).filter(Boolean);
      setSaved(listings);
    } catch (err) {
      console.error("Error fetching saved listings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 tracking-tighter">
          Saved Listings
          <Heart className="text-rose-500 fill-rose-500" size={32} />
        </h1>
        <p className="text-zinc-500 font-medium">Keep track of spaces that match your Lifestyle DNA.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-rose-500" size={40} />
          <p className="text-zinc-500 font-medium tracking-tight">Syncing your wishlist...</p>
        </div>
      ) : saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {saved.map((listing) => (
            <ListingCard key={listing.id} listing={listing} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-[40px] border border-white/5 shadow-2xl">
          <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-zinc-700">
            <Heart size={32} />
          </div>
          <h3 className="text-2xl font-black mb-2 tracking-tight">Your wishlist is empty</h3>
          <p className="text-zinc-500 font-medium mb-8 max-w-xs mx-auto">Heart your favorite student sublets to keep them here for quick access later.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black transition-all shadow-xl shadow-rose-500/20 active:scale-95 group">
            Start Exploring
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedListings;
