
import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Menu, 
  X, 
  Bell,
  Search,
  MessageSquare,
  PlusCircle,
  User,
  Zap,
  ArrowRight
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

  // Don't show navbar on Auth page
  if (location.pathname === '/auth') return null;

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
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">Roomeo</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <>
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
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-8 py-3 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-400 transition-all flex items-center gap-2"
            >
              Log In <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-zinc-400 p-2 glass rounded-xl">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s) await fetchProfile(s.user.id);
      setLoading(false);
    };

    checkSession();

    // Listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUserProfile(data);
      } else {
        // Fallback for demo if profile doesn't exist yet
        setUserProfile({ ...MOCK_USER, id: userId });
      }
    } catch (e) {
      setUserProfile({ ...MOCK_USER, id: userId });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Zap size={40} className="text-rose-500 animate-pulse" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Initializing Secure App State...</p>
      </div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(129,140,248,0.05),transparent_50%)] pointer-events-none" />
        
        <Navbar session={session} />
        
        <main className="relative pt-20">
          <Routes>
            <Route path="/" element={session ? <ListingsFeed user={userProfile!} /> : <LandingPage />} />
            <Route path="/auth" element={!session ? <Auth /> : <ListingsFeed user={userProfile!} />} />
            <Route path="/listing/:id" element={session ? <ListingDetail user={userProfile!} /> : <Auth />} />
            <Route path="/create" element={session ? <CreateListing user={userProfile!} /> : <Auth />} />
            <Route path="/profile" element={session ? <Profile user={userProfile!} /> : <Auth />} />
            <Route path="/messages" element={session ? <Messages user={userProfile!} /> : <Auth />} />
            <Route path="/saved" element={session ? <SavedListings user={userProfile!} /> : <Auth />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
