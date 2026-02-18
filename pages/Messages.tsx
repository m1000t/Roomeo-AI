import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Search, Send, Image, MoreVertical, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

const Messages = ({ user }: { user: UserProfile }) => {
  const location = useLocation();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [user.id]);

  useEffect(() => {
    // Handle incoming navigation state (from Listing Detail)
    if (location.state && !loading) {
      const { listingId, receiverId, listerName } = location.state;
      
      // Check if this conversation already exists in our fetched list
      const existing = conversations.find(c => c.listing_id === listingId && c.other_user_id === receiverId);
      
      if (existing) {
        setActiveChat(existing);
      } else {
        // Create a temporary "new chat" object
        const newChat = {
          listing_id: listingId,
          other_user_id: receiverId,
          other_user_name: listerName || 'New Contact',
          other_user_uni: 'University Peer',
          last_msg: 'Start a conversation...',
          time: 'Now',
          listing_title: 'Interested in space',
          isNew: true
        };
        setActiveChat(newChat);
      }
    }
  }, [location.state, conversations, loading]);

  useEffect(() => {
    if (activeChat && !activeChat.isNew) {
      fetchMessages(activeChat.listing_id, activeChat.other_user_id);
      
      const channel = supabase
        .channel(`chat_${activeChat.listing_id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `listing_id=eq.${activeChat.listing_id}`
        }, payload => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, text, created_at, listing_id, sender_id, receiver_id,
        listing:listings(title),
        sender:profiles!sender_id(name, university),
        receiver:profiles!receiver_id(name, university)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const grouped: any[] = [];
      const seen = new Set();
      data.forEach(m => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        const key = `${m.listing_id}-${otherId}`;
        if (!seen.has(key)) {
          seen.add(key);
          
          // Fix: Access properties from joined arrays as inferred by TypeScript for aliases in Supabase queries.
          const otherName = m.sender_id === user.id 
            ? (Array.isArray(m.receiver) ? m.receiver[0]?.name : (m.receiver as any)?.name) 
            : (Array.isArray(m.sender) ? m.sender[0]?.name : (m.sender as any)?.name);
          
          const otherUni = m.sender_id === user.id 
            ? (Array.isArray(m.receiver) ? m.receiver[0]?.university : (m.receiver as any)?.university) 
            : (Array.isArray(m.sender) ? m.sender[0]?.university : (m.sender as any)?.university);

          const listingTitle = (Array.isArray(m.listing) ? m.listing[0]?.title : (m.listing as any)?.title);

          grouped.push({
            listing_id: m.listing_id,
            other_user_id: otherId,
            other_user_name: otherName || 'User',
            other_user_uni: otherUni || 'University',
            last_msg: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            listing_title: listingTitle || 'Unknown Sublet'
          });
        }
      });
      setConversations(grouped);
      if (grouped.length > 0 && !activeChat && !location.state) setActiveChat(grouped[0]);
    }
    setLoading(false);
  };

  const fetchMessages = async (listingId: string, otherUserId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listingId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!msg.trim() || !activeChat) return;

    const newMsg = {
      listing_id: activeChat.listing_id,
      sender_id: user.id,
      receiver_id: activeChat.other_user_id,
      text: msg
    };

    setMsg('');
    const { error } = await supabase.from('messages').insert(newMsg);
    
    if (error) {
      console.error("Message send error:", error);
      alert("Failed to send message.");
    } else {
      if (activeChat.isNew) {
        // Refresh conversations to turn the temp chat into a real one
        fetchConversations();
        setActiveChat(prev => ({...prev, isNew: false}));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)]">
      <div className="glass rounded-[40px] border border-white/10 h-full flex overflow-hidden shadow-2xl airbnb-shadow">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col h-full bg-zinc-900/30">
          <div className="p-8">
            <h1 className="text-3xl font-black mb-6 tracking-tighter">Messages</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-600" /></div>
            ) : conversations.map((chat, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveChat(chat)}
                className={`w-full p-6 flex items-center gap-4 hover:bg-white/5 transition-colors border-l-4 ${
                  activeChat?.other_user_id === chat.other_user_id && activeChat?.listing_id === chat.listing_id 
                    ? 'bg-rose-500/10 border-rose-500' : 'border-transparent'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center font-black relative shrink-0 shadow-lg">
                  {chat.other_user_name.charAt(0)}
                </div>
                <div className="text-left overflow-hidden flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-black truncate text-sm">{chat.other_user_name}</p>
                    <span className="text-[10px] font-bold text-zinc-500 shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <p className="text-xs text-rose-400 font-bold truncate mb-0.5">{chat.listing_title}</p>
                  <p className="text-xs text-zinc-500 truncate">{chat.last_msg}</p>
                </div>
              </button>
            ))}
            {!loading && conversations.length === 0 && !activeChat?.isNew && (
              <div className="p-8 text-center text-zinc-500 text-sm font-medium">No conversations yet.</div>
            )}
            {!loading && activeChat?.isNew && (
               <button 
               className="w-full p-6 flex items-center gap-4 bg-rose-500/10 border-l-4 border-rose-500 transition-colors"
             >
               <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center font-black relative shrink-0 shadow-lg">
                 {activeChat.other_user_name.charAt(0)}
               </div>
               <div className="text-left overflow-hidden flex-grow">
                 <p className="font-black truncate text-sm">{activeChat.other_user_name}</p>
                 <p className="text-xs text-rose-400 font-bold truncate mb-0.5">Starting new co-living chat...</p>
               </div>
             </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-col flex-grow h-full relative bg-zinc-950/20">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between glass sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black shadow-lg">
                    {activeChat.other_user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-base">{activeChat.other_user_name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">{activeChat.other_user_uni}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-400">
                    <Sparkles size={12} />
                    High Compatibility Match
                  </div>
                  <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-grow overflow-y-auto p-8 flex flex-col gap-6 no-scrollbar">
                <div className="flex justify-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 glass px-4 py-1.5 rounded-full border border-white/5 shadow-sm">Secure Channel Established</span>
                </div>
                
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-5 rounded-3xl font-medium text-sm shadow-xl ${
                      m.sender_id === user.id 
                        ? 'bg-rose-500/20 border border-rose-500/30 rounded-tr-none text-zinc-100' 
                        : 'glass border border-white/10 rounded-tl-none text-zinc-200'
                    }`}>
                      <p>{m.text}</p>
                      <span className="text-[9px] font-bold text-zinc-500 mt-3 block text-right opacity-60">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {activeChat.isNew && messages.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-full opacity-40 gap-4">
                      <MessageSquare size={48} />
                      <p className="font-bold">No messages yet. Say hi to {activeChat.other_user_name}!</p>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-8">
                <div className="glass p-3 rounded-[28px] border border-white/10 flex items-center gap-3 focus-within:ring-2 focus-within:ring-rose-500/50 transition-all airbnb-shadow">
                  <button className="p-3 text-zinc-500 hover:text-rose-400 transition-colors">
                    <Image size={22} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type your message..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-grow bg-transparent border-none outline-none text-sm font-semibold p-2"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!msg.trim()}
                    className={`p-4 rounded-2xl transition-all active:scale-95 ${
                      msg.trim() ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 'text-zinc-600'
                    }`}
                  >
                    <Send size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center">
                 <MessageSquare size={32} className="opacity-20" />
              </div>
              <p className="font-bold tracking-tight">Select a student to start a co-living chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;