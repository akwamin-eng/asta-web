import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Camera, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FieldReportModalProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FieldReportModal({ propertyId, propertyTitle, onClose, onSuccess }: FieldReportModalProps) {
  const [status, setStatus] = useState<'active' | 'vacant' | 'construction'>('active');
  const [condition, setCondition] = useState(3); // 1-5 Scale
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Submit Report
    const { error } = await supabase.from('field_reports').insert({
      user_id: user.id,
      property_id: propertyId,
      property_name: propertyTitle,
      status_verified: status,
      condition_rating: condition,
      notes: notes
    });

    if (!error) {
      // 2. Play Success Animation (Wait 1s)
      setTimeout(() => {
        onSuccess(); // Triggers parent refresh of Reputation Score
        onClose();
      }, 1000);
    } else {
      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#111] border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      >
        {/* HEADER */}
        <div className="bg-emerald-900/20 p-4 border-b border-white/10 flex justify-between items-center">
          <div>
             <h3 className="text-white font-bold flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-500" />
               Field Report Protocol
             </h3>
             <p className="text-[10px] text-emerald-400 font-mono mt-1">TARGET: {propertyTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* 1. OCCUPANCY STATUS */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Visual Status</label>
            <div className="grid grid-cols-3 gap-2">
              {['active', 'vacant', 'construction'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setStatus(opt as any)}
                  className={`py-2 rounded border text-xs font-bold uppercase transition-all ${
                    status === opt 
                    ? 'bg-emerald-500 text-black border-emerald-500' 
                    : 'bg-black border-white/10 text-gray-500 hover:border-white/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CONDITION SLIDER */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
              <span>Asset Condition</span>
              <span className="text-emerald-400">{condition}/5</span>
            </div>
            <input 
              type="range" min="1" max="5" 
              value={condition} 
              onChange={(e) => setCondition(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-gray-600 font-mono uppercase">
              <span>Dilapidated</span>
              <span>Pristine</span>
            </div>
          </div>

          {/* 3. NOTES */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Field Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observation details (e.g. 'Roof repairs needed', 'Tenant moving in')..."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 min-h-[80px]"
            />
          </div>

          {/* 4. PHOTO UPLOAD (Mock) */}
          <button className="w-full py-3 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/40 transition-colors">
            <Camera size={16} /> <span className="text-xs uppercase">Attach Surveillance Img</span>
          </button>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 bg-black/40">
           <button 
             onClick={handleSubmit}
             disabled={submitting}
             className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
           >
             {submitting ? (
               <span className="animate-pulse">Encrypted Upload...</span>
             ) : (
               <>Submit Report (+15 Rep) <CheckCircle2 size={16} /></>
             )}
           </button>
        </div>

      </motion.div>
    </div>
  );
}
