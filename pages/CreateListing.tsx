
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Info,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { AMENITIES } from '../constants';
import { supabase } from '../lib/supabase';

const CreateListing = ({ user }: { user: UserProfile }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    roomType: 'private',
    startDate: '',
    endDate: '',
    description: '',
    amenities: [] as string[]
  });

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: formData.title,
          location: formData.location,
          price: parseInt(formData.price),
          start_date: formData.startDate,
          end_date: formData.endDate,
          room_type: formData.roomType,
          amenities: formData.amenities,
          description: formData.description,
          photo_urls: ['https://picsum.photos/seed/' + Math.random() + '/800/600'] // Mock photo for now
        });
      
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error("Publishing error:", err);
      alert("Failed to publish listing. Please check the console.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={18} />
        Cancel
      </button>

      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 flex-grow rounded-full transition-all duration-500 ${
                i <= step ? 'bg-rose-500' : 'bg-zinc-800'
              }`} 
            />
          ))}
        </div>
        <h1 className="text-3xl font-black">
          {step === 1 ? 'Basic Details' : step === 2 ? 'The Space' : 'Photos & Finalize'}
        </h1>
        <p className="text-zinc-500 font-medium">Tell the student community about your space.</p>
      </div>

      <div className="glass p-8 rounded-[32px] border border-white/10 shadow-2xl">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">Listing Title</label>
              <input 
                type="text" 
                placeholder="e.g. Modern Loft near Stanford Campus" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none font-semibold"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Address or neighborhood" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none font-semibold"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Monthly Rent ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="number" 
                    placeholder="1200" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none font-semibold"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Room Type</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none appearance-none font-semibold cursor-pointer"
                  value={formData.roomType}
                  onChange={e => setFormData({...formData, roomType: e.target.value})}
                >
                  <option value="private">Private Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="studio">Entire Studio</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">Start Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none font-semibold"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-300">End Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none font-semibold"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">Description</label>
              <textarea 
                rows={4}
                placeholder="Describe your house habits, proximity to library, etc..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-rose-500/50 outline-none resize-none font-semibold"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-4 text-zinc-300">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-rose-500/50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} />
              </div>
              <h3 className="font-black mb-2">Upload Room Photos</h3>
              <p className="text-zinc-500 text-sm">Drag and drop photos or click to browse</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex gap-4">
              <Info className="text-rose-400 shrink-0" size={20} />
              <p className="text-sm text-zinc-300 font-medium">
                Our Roomeo AI engine will scan your listing details to match you with compatible student tenants based on university, habits, and cleanliness levels.
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <button 
              onClick={handlePrev}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-black hover:bg-white/10 transition-all"
            >
              Back
            </button>
          )}
          <button 
            disabled={loading}
            onClick={step === 3 ? handlePublish : handleNext}
            className="flex-grow py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {step === 3 ? 'Publish Sublet' : 'Continue'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
