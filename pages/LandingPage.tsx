
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Zap, MapPin, GraduationCap, DollarSign } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ where: '', university: '', budget: '' });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to feed with search params in state
    navigate('/', { state: { search }, replace: true });
  };

  return (
    <div className="flex flex-col items-center min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(129,140,248,0.08),transparent_50%)] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold mb-10 tracking-widest uppercase"
        >
          <Sparkles size={14} className="text-rose-500" />
          <span>The New Standard in Student Living</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white"
        >
          Student sublets you’ll <br />
          <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic px-2">actually love.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium"
        >
          Roomeo uses deep lifestyle DNA matching to connect you with the 
          perfect student sublet. Verified peers, zero stress.
        </motion.p>

        {/* Floating 3-Field Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto mb-24"
        >
          <form 
            onSubmit={handleSearch}
            className="glass p-2 rounded-full border border-white/10 airbnb-shadow flex flex-col md:flex-row items-center gap-1 group focus-within:ring-1 focus-within:ring-rose-500/30 transition-all shadow-[0_0_50px_-12px_rgba(244,63,94,0.15)]"
          >
            <div className="flex-1 flex flex-col items-start px-8 py-3 hover:bg-white/5 rounded-full transition-all cursor-pointer w-full text-left">
              <span className="text-[10px] font-black uppercase text-rose-500/70 tracking-widest mb-1">Where</span>
              <input 
                type="text" 
                placeholder="City or neighborhood"
                className="bg-transparent border-none outline-none text-sm font-bold text-zinc-100 w-full placeholder:text-zinc-700"
                value={search.where}
                onChange={e => setSearch({...search, where: e.target.value})}
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="flex-1 flex flex-col items-start px-8 py-3 hover:bg-white/5 rounded-full transition-all cursor-pointer w-full text-left">
              <span className="text-[10px] font-black uppercase text-rose-500/70 tracking-widest mb-1">University</span>
              <input 
                type="text" 
                placeholder="Target school"
                className="bg-transparent border-none outline-none text-sm font-bold text-zinc-100 w-full placeholder:text-zinc-700"
                value={search.university}
                onChange={e => setSearch({...search, university: e.target.value})}
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="flex-1 flex flex-col items-start px-8 py-3 hover:bg-white/5 rounded-full transition-all cursor-pointer w-full text-left">
              <span className="text-[10px] font-black uppercase text-rose-500/70 tracking-widest mb-1">Budget</span>
              <input 
                type="text" 
                placeholder="Max rent"
                className="bg-transparent border-none outline-none text-sm font-bold text-zinc-100 w-full placeholder:text-zinc-700"
                value={search.budget}
                onChange={e => setSearch({...search, budget: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto p-5 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 hover:scale-105 active:scale-95 text-white transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <Search size={24} strokeWidth={3} />
            </button>
          </form>
        </motion.div>

        {/* Dynamic Image Grid */}
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
          {[
            { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop', match: 98, name: 'Minimal Studio' },
            { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop', match: 94, name: 'Campus Loft' },
            { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2070&auto=format&fit=crop', match: 92, name: 'The Study Hub' },
            { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop', match: 89, name: 'Sunlit Suite' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/5] rounded-[32px] overflow-hidden border border-white/5 relative group cursor-pointer"
            >
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-6 text-left">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-[10px] font-black text-rose-400 mb-2 w-fit">
                  <Zap size={10} fill="currentColor" />
                  {item.match}% MATCH
                </div>
                <p className="text-sm font-bold text-white tracking-tight">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
