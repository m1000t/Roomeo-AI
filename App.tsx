
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  MessageSquare,
  PlusCircle,
  User,
  Zap
} from 'lucide-react';
import LandingPage from './pages/LandingPage';
import ListingsFeed from './pages/ListingsFeed';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import SavedListings from './pages/SavedListings';
import Auth from './pages/Auth';
import { MOCK_USER } from './constants';
import { supabase } from './lib/supabase';
import { UserProfile } from './types';

const Navbar = ({ session }: { session: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/auth' || !session) return null;

  const items = [
    { label: 'Explore', icon: <Search size={20} />, path: '/' },
    { label: 'Saved', icon: <Heart size={20} />, path: '/saved' },
    { label: 'Messages', icon: <MessageSquare size={20} />, path: '/messages' },
    { label: 'List Space', icon: <PlusCircle size={20} />, path: '/create' },
    { label: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xl shadow-rose-500/20 relative overflow-hidden">
            <Zap size={22} className="text-white fill-white" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">Roomeo</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-rose-500/10 text-rose-500' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="w-px h-6 bg-white/5 mx-4" />
          <button className="p-3 text-zinc-500 hover:text-white relative glass rounded-xl border-white/10">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-zinc-950"></span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-400 p-2 glass rounded-xl">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass absolute top-24 left-6 right-6 p-6 rounded-[32px] flex flex-col gap-3 border border-white/10 shadow-2xl z-50"
          >
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-5 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <span className="text-rose-500">{item.icon}</span>
                <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) await fetchProfile(currentSession.user.id);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) fetchProfile(newSession.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setUserProfile(data);
      else {
        setUserProfile({ ...MOCK_USER, id: userId });
      }
    } catch (e) {
      setUserProfile({ ...MOCK_USER, id: userId });
    }
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(129,140,248,0.05),transparent_50%)] pointer-events-none" />
        
        <Navbar session={session} />
        
        <main className="relative pt-20">
          <Routes>
            <Route path="/" element={session ? <ListingsFeed user={userProfile!} /> : <LandingPage />} />
            <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
            <Route path="/listing/:id" element={session ? <ListingDetail user={userProfile!} /> : <Navigate to="/auth" replace />} />
            <Route path="/create" element={session ? <CreateListing user={userProfile!} /> : <Navigate to="/auth" replace />} />
            <Route path="/profile" element={session ? <Profile user={userProfile!} /> : <Navigate to="/auth" replace />} />
            <Route path="/messages" element={session ? <Messages user={userProfile!} /> : <Navigate to="/auth" replace />} />
            <Route path="/saved" element={session ? <SavedListings user={userProfile!} /> : <Navigate to="/auth" replace />} />
            {/* Catch-all to landing/home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
