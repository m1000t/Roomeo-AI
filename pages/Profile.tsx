
import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  GraduationCap,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

const Profile = ({ user }: { user: UserProfile }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-rose-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-zinc-900 overflow-hidden relative">
            {user.name.charAt(0)}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <User size={32} />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-rose-400">
            <Sparkles size={20} />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-rose-400" />
              <span>{user.university}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span>{user.program || 'Student'}, Year {user.year || '3'}</span>
            </div>
          </div>
        </div>
        
        <button className="md:ml-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
          Edit Profile
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Lifestyle DNA
              <Sparkles size={18} className="text-rose-400" />
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm text-zinc-500 mb-4">Cleanliness Level</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className={`h-2 flex-grow rounded-full ${
                        i <= (user.cleanliness || 3) ? 'bg-rose-500' : 'bg-zinc-800'
                      }`} 
                    />
                  ))}
                  <span className="ml-2 font-bold">{user.cleanliness || 3}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-500 mb-4">Sleep Schedule</label>
                <div className="flex items-center gap-2 text-zinc-200">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
                    <Clock size={20} />
                  </div>
                  <span className="font-bold capitalize">{user.sleep_schedule || 'Night'} Owl</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4">Bio</h2>
            <p className="text-zinc-400 leading-relaxed italic">
              "{user.bio || 'No bio yet. Tell the student community about yourself!'}"
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-zinc-400 group-hover:text-zinc-200" />
                <span className="font-medium">Account Settings</span>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </button>
            <div className="h-px bg-white/5" />
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-zinc-400 group-hover:text-zinc-200" />
                <span className="font-medium">Notifications</span>
              </div>
              <ChevronRight size={18} className="text-zinc-500" />
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full p-4 flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all font-bold"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
