
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Zap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center w-full z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-rose-400 text-[10px] font-black tracking-widest uppercase mb-12">
          <Sparkles size={14} /> AI-POWERED STUDENT SUBLETTING
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
          Student sublets you’ll <br />
          <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent italic px-2">actually love.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-16 font-medium">
          Roomeo connects verified students using deep lifestyle DNA matching. <br/> Zero stress, 100% compatibility.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/auth" className="w-full sm:w-auto px-12 py-5 rounded-full bg-rose-500 text-white font-black text-lg shadow-2xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
            Start Scouting <ArrowRight size={20} />
          </Link>
          <Link to="/auth" className="w-full sm:w-auto px-12 py-5 rounded-full glass border border-white/10 text-white font-black text-lg hover:bg-white/5 transition-all">
            Login
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
