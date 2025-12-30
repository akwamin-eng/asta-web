import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, X, RefreshCw, Twitter, Linkedin, Instagram } from 'lucide-react';

interface HypeManProps {
  property: any;
  onClose: () => void;
}

export default function HypeManModal({ property, onClose }: HypeManProps) {
  const [step, setStep] = useState<'analyzing' | 'generating' | 'done'>('analyzing');
  const [copyIndex, setCopyIndex] = useState<number | null>(null);

  // Mock AI Generation Logic
  const generateCopy = () => {
    const price = property.currency === 'USD' 
      ? `$${(property.price).toLocaleString()}` 
      : `₵${property.price?.toLocaleString()}`;
    
    const loc = property.location_name || 'Prime Accra';
    const beds = property.details?.bedrooms || 'Luxury';
    const title = property.title || 'Exclusive Listing';

    return [
      {
        platform: 'twitter',
        icon: Twitter,
        label: 'The "FOMO" Tweet',
        text: `🚨 JUST LISTED in ${loc}!\n\n${title}.\n${beds} Bedrooms. Pure vibes.\n\nAsking: ${price}\n\nThis won't last the weekend. DM me ASAP to secure your viewing. 📲\n\n#AccraRealEstate #GhanaLuxury #${loc.replace(/\s/g, '')}`
      },
      {
        platform: 'instagram',
        icon: Instagram,
        label: 'The "Aesthetic" Caption',
        text: `Living art. ✨\n\nStep inside this ${beds}-bed masterpiece in the heart of ${loc}.\n\n💰 ${price}\n📍 ${loc}\n\nSeamless design, unmatched comfort, and waiting for you.\n\n👇 Tag someone who belongs here.\n\n#DreamHome #InteriorDesign #GhanaProperties #RealEstate`
      },
      {
        platform: 'linkedin',
        icon: Linkedin,
        label: 'The "Investor" Pitch',
        text: `New Asset Alert: Prime ${loc} Opportunity.\n\nWe are pleased to present ${title}, a high-yield asset positioned perfectly for capital appreciation.\n\nStats:\n▪️ ${beds} Beds\n▪️ ${loc} Enclave\n▪️ ${price}\n\nIdeal for diaspora investors seeking secure ROI. Contact us for the investment memo.\n\n#Investment #RealEstate #Ghana #AfricaRising`
      }
    ];
  };

  const [variations, setVariations] = useState<any[]>([]);

  useEffect(() => {
    // Sequence the "AI" loading states
    setTimeout(() => setStep('generating'), 1500);
    setTimeout(() => {
      setVariations(generateCopy());
      setStep('done');
    }, 3000);
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopyIndex(index);
    setTimeout(() => setCopyIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
              <Sparkles size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">HypeMan AI</h3>
              <p className="text-purple-400 text-xs font-mono uppercase tracking-wider">Marketing Generator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[300px]">
          
          <AnimatePresence mode="wait">
            {step === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
              >
                <RefreshCw size={40} className="text-purple-500 animate-spin mb-4" />
                <h4 className="text-white font-bold mb-2">Analyzing Asset Data...</h4>
                <p className="text-gray-500 text-xs font-mono">
                  Scanning features: {property.title}<br/>
                  Location data: {property.location_name}<br/>
                  Price point: {property.price}
                </p>
              </motion.div>
            )}

            {step === 'generating' && (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
              >
                <Sparkles size={40} className="text-white animate-pulse mb-4" />
                <h4 className="text-white font-bold mb-2">Synthesizing Campaigns...</h4>
                <p className="text-gray-500 text-xs font-mono">
                  Drafting viral hooks...<br/>
                  Optimizing hashtags...<br/>
                  Calibrating tone...
                </p>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {variations.map((v, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <v.icon size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{v.label}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(v.text, i)}
                        className="text-gray-500 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copyIndex === i ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="bg-black/50 rounded-lg p-3 border border-white/5">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {v.text}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer */}
        {step === 'done' && (
          <div className="p-4 border-t border-white/5 bg-black/40">
            <button 
              onClick={() => { setStep('analyzing'); setTimeout(() => { setVariations(generateCopy()); setStep('done') }, 2000); }}
              className="w-full py-3 bg-white hover:bg-gray-200 text-black font-bold rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-colors"
            >
              <RefreshCw size={14} /> Regenerate Concepts
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
