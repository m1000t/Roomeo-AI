
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Search, Home, Building, Users, ShieldCheck, Loader2, Zap, Database, Sparkles } from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { MOCK_LISTINGS } from '../constants';
import ListingCard from '../components/ListingCard';
import { supabase } from '../lib/supabase';
import { searchWebListings } from '../services/geminiService';

const CATEGORIES = [
  { label: 'All Sublets', icon: <Home size={18} /> },
  { label: 'Private Rooms', icon: <Building size={18} /> },
  { label: 'Shared Spaces', icon: <Users size={18} /> },
  { label: 'Verified', icon: <ShieldCheck size={18} /> },
];

const ListingsFeed = ({ user }: { user: UserProfile }) => {
  const routerLocation = useLocation();
  const [activeCategory, setActiveCategory] = useState('All Sublets');
  const [searchTerm, setSearchTerm] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (routerLocation.state?.search) {
      setSearchTerm(routerLocation.state.search.where || '');
    }
    fetchListings();
  }, [routerLocation.state]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('listings').select('*, lister_profile:profiles(*)').order('created_at', { ascending: false });
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      setListings(MOCK_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setStatus('AI is crawling external boards...');
    try {
      const results = await searchWebListings(searchTerm || "Major Cities", user.university);
      if (results && results.length > 0) {
        setStatus(`Found ${results.length} posts. Writing to database...`);
        const formatted = results.map((r: any) => ({
          ...r,
          user_id: user.id,
          photo_urls: r.photo_urls || ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800']
        }));
        const { error } = await supabase.from('listings').insert(formatted);
        if (error) throw error;
        await fetchListings();
        setStatus('Sync Complete.');
      }
    } catch (e) {
      setStatus('Sync Failed.');
    } finally {
      setTimeout(() => { setSyncing(false); setStatus(''); }, 3000);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const search = searchTerm.toLowerCase();
      return (l.title.toLowerCase().includes(search) || l.location.toLowerCase().includes(search)) &&
             (activeCategory === 'All Sublets' || (activeCategory === 'Private Rooms' && l.room_type === 'private'));
    });
  }, [listings, searchTerm, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-24">
      <div className="sticky top-20 z-40 bg-zinc-950/80 backdrop-blur-xl py-6 mb-12 flex flex-col lg:flex-row items-center gap-8 border-b border-white/5">
        <div className="flex-grow flex gap-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap font-black uppercase tracking-widest text-[10px] ${activeCategory === cat.label ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-zinc-500'}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="City, school or neighborhood..." 
            className="glass flex-grow lg:w-64 px-6 py-4 rounded-2xl text-sm font-bold border-white/10 outline-none focus:ring-1 focus:ring-rose-500/50"
          />
          <button onClick={handleSync} disabled={syncing} className="glass px-6 py-4 rounded-2xl border-rose-500/30 text-rose-400 font-black uppercase tracking-tight text-xs flex items-center gap-2 hover:bg-rose-500/5 disabled:opacity-50">
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            AI Sync
          </button>
        </div>
      </div>

      {status && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
          <Sparkles size={12} className="animate-pulse" /> {status}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredListings.map(l => <ListingCard key={l.id} listing={l} user={user} />)}
      </div>
    </div>
  );
};

export default ListingsFeed;
