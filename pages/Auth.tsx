
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              university: university
            }
          }
        });
        if (error) throw error;
        
        // Create initial profile in profiles table
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: fullName,
              email: email,
              university: university,
              cleanliness: 3, // Default
              sleep_schedule: 'night' // Default
            });
          if (profileError) console.error("Profile creation error:", profileError);
        }
      }
      // Note: We don't call navigate() here anymore. 
      // The App.tsx onAuthStateChange listener will detect the new session
      // and redirect the user automatically by re-rendering the Routes.
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full" />
          
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
              <Heart size={28} className="text-white fill-current" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">{isLogin ? 'Welcome back' : 'Join Roomeo'}</h1>
            <p className="text-zinc-500 font-medium mt-2">Connect with your university community</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="University Name" 
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                placeholder="Student Email (.edu)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all font-semibold"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all font-semibold"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-black transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Continue' : 'Create Account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-zinc-500 hover:text-rose-400 transition-colors"
            >
              {isLogin ? "New to Roomeo? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
