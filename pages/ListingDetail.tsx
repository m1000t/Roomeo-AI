
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Zap, 
  Check, 
  ArrowLeft, 
  Share2, 
  Heart,
  MessageSquare,
  Star,
  Sparkles,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { calculateMatchScore } from '../lib/matchLogic';
import { getAIMatchExplanation } from '../services/geminiService';
import { supabase } from '../lib/supabase';

const CircularProgress = ({ score }: { score: number }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="text-zinc-900"
          strokeWidth="6"
          stroke="currentColor"
          fill="transparent"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="48"
          cy="48"
          r={radius}
          strokeDasharray={circumference}
          strokeWidth="6"
          strokeLinecap="round"
          stroke="url(#gradient-large)"
          fill="transparent"
        />
        <defs>
          <linearGradient id="gradient-large" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-black text-white">{score}%</span>
      </div>
    </div>
  );
};

const ListingDetail = ({ user }: { user: UserProfile }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          lister_profile:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
      
      const match = calculateMatchScore(user, data);
      const explanation = await getAIMatchExplanation(user, data, match.score);
      setAiReport(explanation);
    } catch (err) {
      console.error("Error fetching listing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (!listing) return;
    navigate('/messages', { 
      state: { 
        listingId: listing.id, 
        receiverId: listing.user_id,
        listerName: listing.lister_profile?.name,
        listingTitle: listing.title
      },
      replace: true 
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-rose-500/20 rounded-full" />
      </div>
      <p className="text-zinc-500 font-bold tracking-tighter">Accessing property metadata...</p>
    </div>
  );

  if (!listing) return (
    <div className="p-24 text-center">
      <h2 className="text-3xl font-black mb-6">Listing Expired</h2>
      <button onClick={() => navigate('/')} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-rose-500 font-bold hover:bg-white/10 transition-all flex items-center gap-2 mx-auto">
        <ArrowLeft size={18} /> Back to Explore
      </button>
    </div>
  );

  const match = calculateMatchScore(user, listing);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm tracking-widest uppercase">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tighter mb-4">{listing.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-zinc-400">
            <div className="flex items-center gap-1.5 text-rose-400">
              <Star size={16} className="fill-current" />
              <span>Verified Student Peer</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="flex items-center gap-1.5 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">
              <MapPin size={16} />
              <span>{listing.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-white">
              <Share2 size={20} />
            </button>
            <button className="p-3 rounded-2xl glass border-white/10 hover:bg-white/5 transition-all text-zinc-400 hover:text-rose-500">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[600px] rounded-[48px] overflow-hidden mb-16 border border-white/5 shadow-2xl relative">
        <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden">
          <img src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop'} alt="Hero" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div className="hidden md:block relative group overflow-hidden">
          <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div className="hidden md:block relative group overflow-hidden">
          <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div className="hidden md:block relative group overflow-hidden">
          <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </div>
        <div className="hidden md:block relative group overflow-hidden">
          <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
          <button className="absolute bottom-6 right-6 glass px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-white/20 hover:bg-white/10 transition-all backdrop-blur-xl">Show Gallery</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                {listing.room_type === 'private' ? 'Private Suite' : 'Shared Space'} by {listing.lister_profile?.name || 'Peer'}
              </h2>
              <p className="text-zinc-500 font-bold text-lg">{listing.lister_profile?.university} • Class of '25</p>
            </div>
            <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-rose-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {listing.lister_profile?.name?.charAt(0) || 'P'}
            </div>
          </div>

          {/* AI Match DNA Card */}
          <div className="relative p-10 rounded-[48px] glass border border-white/10 overflow-hidden shadow-2xl group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full group-hover:bg-rose-500/10 transition-all" />
             
             <div className="flex flex-col md:flex-row items-center gap-10">
                <CircularProgress score={match.score} />
                <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest">
                    <Sparkles size={16} fill="currentColor" />
                    AI Compatibility DNA
                  </div>
                  <p className="text-2xl font-black italic tracking-tight text-white leading-tight">
                    "{aiReport || 'Calibrating lifestyle factors...'}"
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {match.reasons.map((reason, i) => (
                      <div key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                         {reason}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <h2 className="text-3xl font-black tracking-tight">The Space</h2>
             <p className="text-zinc-400 leading-relaxed text-xl font-medium whitespace-pre-line">
               {listing.description}
             </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Included Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {listing.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-4 text-zinc-300 font-bold p-4 glass rounded-2xl border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                    <Check size={18} />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Sidebar */}
        <div className="relative">
          <div className="sticky top-32 glass p-10 rounded-[48px] border border-white/10 shadow-2xl space-y-10">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-black text-white">${listing.price}</span>
                <span className="text-zinc-500 font-bold ml-1 uppercase tracking-widest text-xs">/ month</span>
              </div>
              <div className="text-emerald-500 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <Zap size={14} fill="currentColor" />
                Live Now
              </div>
            </div>

            <div className="glass rounded-[32px] border border-white/10 overflow-hidden">
              <div className="grid grid-cols-2 border-b border-white/5">
                <div className="p-5 border-r border-white/5">
                  <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1 block">Starts</span>
                  <p className="font-bold text-white">{new Date(listing.start_date).toLocaleDateString()}</p>
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1 block">Ends</span>
                  <p className="font-bold text-white">{new Date(listing.end_date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="p-5 bg-white/5">
                <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1 block">Occupancy</span>
                <p className="font-bold text-white">1 Private Suite</p>
              </div>
            </div>

            <button 
              onClick={handleMessage}
              className="w-full py-6 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] text-white font-black transition-all shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-3 text-lg"
            >
              <MessageSquare size={20} />
              Connect with {listing.lister_profile?.name?.split(' ')[0]}
              <ChevronRight size={18} />
            </button>
            <p className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">Student verified encryption active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
