import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from 'framer-motion';

// Initialize Supabase Client (Locally for Auth)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white">Welcome to Asta</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to save your favorite homes.</p>
        </div>

        {/* The Magic Auth Form */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#10b981', // Emerald Green
                  brandAccent: '#059669',
                  inputBackground: '#2a2a2a',
                  inputText: 'white',
                  inputBorder: '#333',
                  inputLabelText: '#9ca3af',
                }
              }
            }
          }}
          providers={['google']} 
          theme="dark"
          showLinks={false} // Hides "Forgot Password" since we use Magic Links
          magicLink={true}   // 🪄 The Secret Sauce
        />
      </motion.div>
    </div>
  );
}
