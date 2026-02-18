
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Home, 
  Building, 
  Users, 
  ShieldCheck, 
  Loader2,
  Zap,
  Sparkles,
  Globe,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
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
  
  // Web Search State
  const [isWebSearch, setIsWebSearch] = useState(false);
  const [webResults, setWebResults] = useState<{ text: string, sources: any[] } | null>(null);
  const [searchingWeb, setSearchingWeb] = useState(false);

  useEffect(() => {
    if (routerLocation.state?.search) {
      const { where, university } = routerLocation.state.search;
      setSearchTerm(where || university || '');
    }
    fetchListings();
  }, [routerLocation.state]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          lister_profile:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error("Fetch listings error:", err);
      setListings(MOCK_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleWebSearch = async () => {
    if (!searchTerm && !user.university) return;
    setSearchingWeb(true);
    const results = await searchWebListings(searchTerm || "anywhere", user.university);
    setWebResults(results);
    setSearchingWeb(false);
    setIsWebSearch(true);
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = l.title.toLowerCase().includes(lowerSearch) || 
                          l.location.toLowerCase().includes(lowerSearch) ||
                          l.lister_profile?.university?.toLowerCase().includes(lowerSearch);
      
      const matchesCategory = activeCategory === 'All Sublets' || 
                             (activeCategory === 'Private Rooms' && l.room_type === 'private') ||
                             (activeCategory === 'Shared Spaces' && l.room_type === 'shared') ||
                             (activeCategory === 'Verified'); 
      
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
      {/* Category & Search Header */}
      <div className="sticky top-20 z-40 bg-zinc-950/90 backdrop-blur-xl py-6 mb-12 -mx-10 px-10 border-b border-white/5">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth flex-grow pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => { setActiveCategory(cat.label); setIsWebSearch(false); }}
                className={`flex flex-col items-center gap-2.5 min-w-fit transition-all group ${
                  activeCategory === cat.label && !isWebSearch ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className={`p-3 rounded-2xl transition-all ${
                  activeCategory === cat.label && !isWebSearch ? 'bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'bg-white/5'
                }`}>
                  {cat.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                <div className={`h-1 w-1 rounded-full bg-rose-500 transition-transform ${
                  activeCategory === cat.label && !isWebSearch ? 'scale-100' : 'scale-0'
                }`} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Where are you heading?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleWebSearch()}
                className="w-full glass pl-12 pr-6 py-4 rounded-2xl border border-white/10 text-sm font-bold focus:ring-1 focus:ring-rose-500/50 outline-none placeholder:text-zinc-700 shadow-xl"
              />
            </div>
             <button 
                onClick={handleWebSearch}
                disabled={searchingWeb}
                className={`glass flex items-center gap-2.5 px-6 py-4 rounded-2xl border border-white/10 transition-all shrink-0 shadow-xl group ${
                  isWebSearch ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' : 'hover:bg-white/5'
                }`}
             >
                {searchingWeb ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                <span className="text-sm font-bold">Search the Web</span>
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isWebSearch ? (
          <motion.div 
            key="web-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="glass p-10 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full" />
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                   <Sparkles size={20} className="fill-current" />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight uppercase">AI Aggregator Results</h2>
               </div>
               
               <div className="prose prose-invert max-w-none mb-10">
                 <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-line">
                   {webResults?.text || "Searching for live student housing opportunities across the web..."}
                 </p>
               </div>

               <div className="space-y-4">
                 <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Found on the Web</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {webResults?.sources.map((source, i) => (
                     <a 
                       key={i} 
                       href={source.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-5 glass rounded-2xl border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group flex flex-col justify-between h-full"
                     >
                       <div>
                         <p className="text-xs font-black text-rose-400 mb-1 uppercase tracking-wider">Source {i + 1}</p>
                         <h4 className="font-bold text-white group-hover:text-rose-500 transition-colors line-clamp-2 mb-4">{source.title}</h4>
                       </div>
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-[10px] font-bold text-zinc-500 truncate max-w-[150px]">{new URL(source.url).hostname}</span>
                         <ExternalLink size={14} className="text-zinc-500 group-hover:text-rose-500" />
                       </div>
                     </a>
                   ))}
                 </div>
               </div>
               
               <button 
                 onClick={() => setIsWebSearch(false)}
                 className="mt-12 text-zinc-500 hover:text-white font-bold flex items-center gap-2 group"
               >
                 Back to Marketplace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="marketplace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                  Marketplace
                  <span className="text-zinc-700">/</span>
                  <span className="text-rose-500">{user?.university || 'All Peers'}</span>
                </h1>
                <p className="text-sm font-medium text-zinc-500 mt-1">
                  {filteredListings.length} student-posted spaces verified for you.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-400">
                <Zap size={14} className="text-rose-500 fill-rose-500" />
                Community Database
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <Loader2 className="animate-spin text-rose-500" size={48} />
                  <div className="absolute inset-0 blur-xl bg-rose-500/20 rounded-full" />
                </div>
                <p className="text-zinc-500 font-bold tracking-tight">Syncing community listings...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} user={user} />
                ))}
                {filteredListings.length === 0 && (
                  <div className="col-span-full py-32 text-center glass rounded-[40px] border border-white/5">
                    <Zap size={48} className="mx-auto mb-6 text-zinc-800" />
                    <h3 className="text-xl font-bold mb-2">No marketplace listings yet</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto font-medium mb-8">Try searching the web to find live listings from other student sites.</p>
                    <button 
                      onClick={handleWebSearch}
                      className="px-8 py-4 rounded-2xl bg-rose-500 text-white font-black shadow-xl shadow-rose-500/20 hover:scale-105 transition-all"
                    >
                      Search External Sites
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingsFeed;
