import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, Fingerprint, Activity, Radio, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OnboardingProps {
  currentName: string;
  onComplete: () => void;
}

export default function OnboardingModule({ currentName, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'signal' | 'identity' | 'briefing'>('signal');
  const [codename, setCodename] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // STEP 1: SIGNAL INTERCEPT (Auto-advance after 3s)
  React.useEffect(() => {
    if (step === 'signal') {
      const timer = setTimeout(() => setStep('identity'), 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // HANDLE NAME SAVE
  const handleIdentityConfirm = async () => {
    if (!codename.trim()) return;
    setIsSaving(true);
    
    // Update Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ 
        full_name: codename,
        rank_title: 'Field Agent' // Give them a starter rank
      }).eq('id', user.id);
    }

    setIsSaving(false);
    setStep('briefing');
  };

  return (
    <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-white font-sans p-6">
      
      <AnimatePresence mode="wait">
        
        {/* --- STAGE 1: SIGNAL INTERCEPT --- */}
        {step === 'signal' && (
          <motion.div 
            key="signal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full border border-emerald-500/30 flex items-center justify-center relative">
               <div className="absolute inset-0 border border-emerald-500 rounded-full animate-ping opacity-20" />
               <Radio size={48} className="text-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-tighter uppercase text-emerald-500">Incoming Transmission</h2>
            <div className="font-mono text-xs text-emerald-500/70 space-y-1">
               <p>ENCRYPTION: AES-256... <span className="text-emerald-400">VERIFIED</span></p>
               <p>SOURCE: CENTRAL COMMAND... <span className="text-emerald-400">CONNECTED</span></p>
               <p>HANDSHAKE PROTOCOL... <span className="text-emerald-400">COMPLETE</span></p>
            </div>
          </motion.div>
        )}

        {/* --- STAGE 2: IDENTITY ASSIGNMENT --- */}
        {step === 'identity' && (
          <motion.div 
             key="identity"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
             className="max-w-md w-full bg-[#111] border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
             <Fingerprint size={32} className="text-emerald-500 mb-4" />
             
             <h2 className="text-xl font-bold text-white mb-2">Identify Yourself</h2>
             <p className="text-sm text-gray-400 mb-6 leading-relaxed">
               The network has detected a new signal signature. To proceed with dossier creation, please confirm your field codename.
             </p>

             <div className="space-y-4">
               <div className="relative">
                 <input 
                   type="text" 
                   value={codename}
                   onChange={(e) => setCodename(e.target.value)}
                   placeholder="Enter Codename (e.g. Agent Wolf)"
                   className="w-full bg-black border border-white/20 rounded-lg py-3 px-4 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                   autoFocus
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono">
                   REQUIRED
                 </div>
               </div>

               <button 
                 onClick={handleIdentityConfirm}
                 disabled={!codename || isSaving}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSaving ? 'Encrypting Identity...' : <>Confirm Protocol <ChevronRight size={16} /></>}
               </button>
             </div>
          </motion.div>
        )}

        {/* --- STAGE 3: BRIEFING --- */}
        {step === 'briefing' && (
          <motion.div 
             key="briefing"
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
             className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6"
          >
             <div className="col-span-full text-center mb-8">
               <h2 className="text-2xl font-bold text-white mb-2">Welcome, {codename}</h2>
               <p className="text-gray-400">Your Unified Command Center is ready. Here are your tools:</p>
             </div>

             {/* Card 1 */}
             <div className="bg-[#111] border border-white/10 p-6 rounded-xl hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 text-blue-400 group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-white mb-2">Live Map</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Scout real-time assets. Click <span className="text-white">"Watch"</span> to track yields, or <span className="text-white">"Verify"</span> to submit field reports.
                </p>
             </div>

             {/* Card 2 */}
             <div className="bg-[#111] border border-white/10 p-6 rounded-xl hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500 text-amber-400 group-hover:text-white transition-all">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold text-white mb-2">Hunter Config</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Set your <span className="text-white">Buy Box</span> (Budget & Zones). Our algorithms will auto-scan for deals matching your criteria.
                </p>
             </div>

             {/* Card 3 */}
             <div className="bg-[#111] border border-white/10 p-6 rounded-xl hover:border-emerald-500/50 transition-colors group">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-white transition-all">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-white mb-2">Reputation</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Earn points by verifying data. Higher reputation unlocks <span className="text-white">Off-Market Deals</span> and <span className="text-white">Scout Tiers</span>.
                </p>
             </div>

             <div className="col-span-full flex justify-center mt-8">
               <button 
                 onClick={onComplete}
                 className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
               >
                 Launch Command Center
               </button>
             </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
