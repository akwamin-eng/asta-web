import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    // ⚡ Magic Link Logic
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Redirect back to the dashboard after clicking the email link
        emailRedirectTo: window.location.origin, 
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Decorative Top Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  {sent ? <CheckCircle className="text-emerald-500" /> : <ShieldCheck className="text-emerald-500" />}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {sent ? 'Check your email' : 'Access the Terminal'}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  {sent 
                    ? `We sent a magic link to ${email}`
                    : 'Sign in to save searches, track properties, and view market intelligence.'}
                </p>
              </div>

              {/* Form */}
              {!sent ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="investor@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                      {error}
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        Send Magic Link <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[10px] text-center text-gray-600 mt-4">
                    By accessing Asta, you agree to our Market Data Terms.
                    <br/>Secure, passwordless entry via Supabase.
                  </p>
                </form>
              ) : (
                <div className="text-center">
                  <button 
                    onClick={onClose}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-all"
                  >
                    Close
                  </button>
                  <p className="text-xs text-gray-500 mt-4 cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setSent(false)}>
                    Use a different email?
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
