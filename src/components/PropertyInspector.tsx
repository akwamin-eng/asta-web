import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Send,
  User,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../lib/supabase';

// --- IMPORTS FOR GATEKEEPER & TOASTS ---
import AuthOverlay from './AuthOverlay';
import Toast from './ui/Toast';
import FieldReportModal from "./dossier/FieldReportModal";

import IntelligenceCard from "./dossier/modules/IntelligenceCard";
import SaveButton from "./SaveButton";
import TrustScorecard from "./intel/TrustScorecard"; 
import MarketPulse from "./intel/MarketPulse";
import TrueCostCalculator from "./intel/TrueCostCalculator";

interface PropertyInspectorProps {
  property: any;
  onClose: () => void;
  onVerify?: () => void; // Kept for backward compat, but we'll use internal state mostly
}

// --- INTERNAL COMPONENT: INTELLIGENCE TOOLTIP ---
const IntelTooltip = ({ children, title, desc }: { children: React.ReactNode; title: string; desc: string }) => (
  <div className="group relative w-full">
    {children}
    <div className="absolute left-0 -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 w-full">
      <div className="bg-black/90 backdrop-blur-md border border-white/20 text-white text-[10px] p-2 rounded-lg shadow-xl flex flex-col gap-0.5">
        <span className="font-bold text-emerald-400 uppercase tracking-wider">{title}</span>
        <span className="text-gray-400 leading-tight">{desc}</span>
      </div>
      <div className="w-2 h-2 bg-white/20 rotate-45 absolute left-8 -bottom-1 transform translate-y-1/2"></div>
    </div>
  </div>
);

export default function PropertyInspector({
  property,
  onClose,
  onVerify,
}: PropertyInspectorProps) {
  // State for Currency Toggle
  const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
  // State for Cinematic Image Mode
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  // State for Image Carousel Navigation
  const [photoIndex, setPhotoIndex] = useState(0);

  // --- AUTH & GATEKEEPER STATE ---
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  
  // --- VERIFICATION & TOAST STATE ---
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- CONTACT FORM STATE ---
  const [isContactOpen, setContactOpen] = useState(false);
  const [inquirer, setInquirer] = useState({ name: "", phone: "", message: "" });

  // Alias 'property' to 'data'
  const data = property;

  // 1. CHECK AUTH ON MOUNT
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // 2. GATEKEEPER FUNCTION (Generic)
  const handleGatekeptAction = (action: () => void) => {
    if (user) {
      action();
    } else {
      setShowAuth(true);
    }
  };

  // Safety: If no data, don't render
  if (!data) return null;

  // --- IMAGE GALLERY LOGIC ---
  const galleryImages = useMemo(() => {
    const images: string[] = [];
    if (data.cover_image_url) images.push(data.cover_image_url);
    const extraImages = data.images || data.property_images;
    if (Array.isArray(extraImages)) {
      extraImages.forEach((img: any) => {
        const url = typeof img === "string" ? img : img.url;
        if (url && url !== data.cover_image_url) images.push(url);
      });
    }
    if (images.length === 0) {
      images.push("https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80");
    }
    return images;
  }, [data]);

  useEffect(() => {
    if (!isImageExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPhoto(e as any);
      if (e.key === "ArrowLeft") prevPhoto(e as any);
      if (e.key === "Escape") setIsImageExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isImageExpanded, photoIndex]);

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // --- ACTIONS ---
  
  const handleOpenContact = () => {
    setInquirer({
      name: "",
      phone: "",
      message: `Hello, I am interested in ${data.title} (${data.location_name}). Is it available for viewing?`
    });
    setContactOpen(true);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Construct the Payload
    const fullMessage = `*New Lead via Asta*\n\n*Property:* ${data.title}\n*Price:* ${displayPrice}\n\n*Inquirer:* ${inquirer.name}\n*Phone:* ${inquirer.phone}\n\n*Message:* ${inquirer.message}`;

    // 2. Try to find a valid contact
    const contact = data.phone || data.contact || data.metadata?.phone || "233540000000"; 
    
    if (contact) {
      const number = contact.toString().replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(fullMessage);
      window.open(`https://wa.me/${number}?text=${encodedMsg}`, '_blank');
    } else {
      alert(`ASTA SECURE INBOX\n\nMessage queued for encryption.\n\nFrom: ${inquirer.name}\nTo: Owner of "${data.title}"`);
    }
    
    setContactOpen(false);
  };

  const getSafeFeatures = () => {
    try {
      if (!data.vibe_features) return [];
      if (Array.isArray(data.vibe_features)) return data.vibe_features;
      return JSON.parse(data.vibe_features) || [];
    } catch (e) {
      return [];
    }
  };

  const exchangeRate = 15.5;
  const displayPrice =
    currency === "GHS"
      ? `₵${data.price?.toLocaleString()}`
      : `$${(data.price / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      
  const numericPrice = currency === "GHS" ? data.price : (data.price / exchangeRate);

  const widgetHoverEffect = "transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]";

  return (
    <>
      {/* AUTH OVERLAY (GATEKEEPER) */}
      <AnimatePresence>
        {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
      </AnimatePresence>

      {/* VERIFY MODAL (INTERNAL) */}
      <AnimatePresence>
        {showVerifyModal && (
          <FieldReportModal 
            propertyId={data.id} 
            propertyName={data.title}
            onClose={() => setShowVerifyModal(false)}
            onSuccess={() => setToastMessage("Field Report Transmitted: Reputation Increased")}
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <Toast 
            message={toastMessage} 
            onClose={() => setToastMessage(null)} 
            type="success"
          />
        )}
      </AnimatePresence>

      {/* CINEMATIC OVERLAY */}
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setIsImageExpanded(false)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/20 p-2 rounded-full z-50"><X size={32} /></button>
            {galleryImages.length > 1 && (
              <>
                <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/20 p-3 rounded-full z-50"><ChevronLeft size={40} /></button>
                <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-black/20 p-3 rounded-full z-50"><ChevronRight size={40} /></button>
              </>
            )}
            <motion.img
              key={photoIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              src={galleryImages[photoIndex]}
              className="max-w-full max-h-full rounded-lg shadow-2xl object-contain pointer-events-none"
            />
            <div className="absolute bottom-10 text-center w-full">
              <p className="text-white text-lg font-bold">{data.title}</p>
              <p className="text-emerald-400 font-mono text-sm mt-1">Image {photoIndex + 1} of {galleryImages.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSPECTOR PANEL */}
      <motion.div
        key="property-inspector"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 overflow-y-auto custom-scrollbar"
      >
        {/* HEADER IMAGE */}
        <div className="relative h-64 bg-gray-900 group cursor-zoom-in" onClick={() => { setPhotoIndex(0); setIsImageExpanded(true); }}>
          <img src={data.cover_image_url || galleryImages[0]} alt={data.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs flex items-center gap-2 shadow-xl"><Maximize2 size={12} /> View Photos ({galleryImages.length})</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm z-10 hover:rotate-90 transition-transform"><X size={20} /></button>
          <div className="absolute bottom-4 left-6 right-6 pointer-events-none">
            <h2 className="text-2xl font-bold text-white leading-tight mb-1">{data.title}</h2>
            <div className="flex items-center text-gray-400 text-sm"><MapPin size={14} className="mr-1" />{data.location_name}</div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 p-4 md:p-6 border-b border-white/10">
          <div className="flex-1 cursor-pointer group" onClick={() => setCurrency((c) => (c === "GHS" ? "USD" : "GHS"))}>
            <p className="text-gray-400 text-xs uppercase font-bold mb-1 flex items-center gap-1 group-hover:text-emerald-400">Price ({currency}) <ChevronDown size={10} /></p>
            <p className="text-2xl font-mono text-emerald-400">{displayPrice}</p>
          </div>
          
          {/* GATED: SAVE/WATCH BUTTON */}
          <div 
             className="contents" // Ensure wrapper doesn't break Flex layout
             onClickCapture={(e) => {
               if (!user) {
                 e.stopPropagation();
                 e.preventDefault();
                 setShowAuth(true);
               }
             }}
          >
             <SaveButton propertyId={data.id} className="h-10 px-4" />
          </div>
          
          {/* GATED: VERIFY BUTTON */}
          <button 
            onClick={() => handleGatekeptAction(() => setShowVerifyModal(true))} 
            className="flex items-center justify-center w-12 h-10 rounded-lg bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-500 transition-colors" 
            title="Verify Asset"
          >
            <ShieldCheck size={20} />
          </button>
          
          <button 
            onClick={handleOpenContact}
            className="bg-white text-black font-bold py-2.5 px-4 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 flex-grow transition-colors"
          >
            <MessageSquare size={18} />
            <span className="text-xs uppercase tracking-wide">Contact</span>
          </button>
        </div>

        {/* MAIN CONTENT STACK */}
        <div className="p-4 md:p-6 space-y-6">
          
          {/* CONTACT FORM OVERLAY */}
          <AnimatePresence>
            {isContactOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <form onSubmit={handleSendInquiry} className="bg-white/5 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                   <div className="flex justify-between items-center mb-2">
                      <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Secure Inquiry</h4>
                      <button type="button" onClick={() => setContactOpen(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                   </div>
                   
                   <div className="space-y-2">
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-2.5 text-gray-500" />
                        <input 
                          type="text" 
                          required 
                          placeholder="Your Name"
                          value={inquirer.name}
                          onChange={(e) => setInquirer({...inquirer, name: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                        />
                      </div>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-2.5 text-gray-500" />
                        <input 
                          type="tel" 
                          required 
                          placeholder="Phone Number"
                          value={inquirer.phone}
                          onChange={(e) => setInquirer({...inquirer, phone: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                        />
                      </div>
                      <textarea 
                        required
                        rows={3}
                        value={inquirer.message}
                        onChange={(e) => setInquirer({...inquirer, message: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                      />
                   </div>
                   
                   <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Send size={16} /> Send Request
                   </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. DESCRIPTION & VIBE */}
          <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">The Brief</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{data.description_enriched || data.description || "No description provided."}</p>
              </div>
              
              {data.vibe_features && (
                <div className="flex flex-wrap gap-2">
                  {getSafeFeatures().map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 uppercase tracking-wide">{tag}</span>
                  ))}
                </div>
              )}
          </div>

          {/* 2. INTELLIGENCE STACK (With Tooltips) */}
          <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} /> Field Intelligence
              </h3>
              
              <div className={widgetHoverEffect}>
                <IntelTooltip title="Trust Score" desc="AI-verified analysis of ownership data, litigation history, and land commission records.">
                  <TrustScorecard property={data} owner={data.owner} />
                </IntelTooltip>
              </div>

              <div className={widgetHoverEffect}>
                <IntelTooltip title="Market Pulse" desc="Real-time price comparison against similar assets in this specific neighborhood.">
                  <MarketPulse property={data} />
                </IntelTooltip>
              </div>

              <div className={widgetHoverEffect}>
                <IntelTooltip title="True Cost" desc="Calculates the hidden costs: service charges, taxes, and maintenance fees over 12 months.">
                  <TrueCostCalculator 
                    price={numericPrice} 
                    currency={currency} 
                    bedrooms={data.details?.bedrooms || 1} 
                    type={data.type}
                  />
                </IntelTooltip>
              </div>
          </div>

          {/* 3. LEGACY ADVISORS */}
          <div className="space-y-4">
              <IntelligenceCard key={data.id} propertyId={data.id} locationName={data.location_name} />
              
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                <h3 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Asta Advisor
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {data.type === "rent" ? "Standard practice: 1-2 years rent in advance. Demand a contract." : "Critical: Verify Land Title Certificate at Lands Commission."}
                </p>
              </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button onClick={onClose} className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-bold uppercase tracking-widest">
              <ArrowLeft size={16} /> Close Inspector
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
