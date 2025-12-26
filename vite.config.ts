import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 🔒 SECURITY SETTINGS
  build: {
    // 1. Disable Source Maps: Prevents browser from seeing original code structure
    sourcemap: false, 
    
    // 2. Minification: Uses Terser to squash code into garbled one-liners
    minify: 'terser',
    
    // 3. Obfuscation Settings
    terserOptions: {
      compress: {
        // Remove all console.logs so competitors can't see your debug trails
        drop_console: true, 
        drop_debugger: true,
      },
      format: {
        comments: false, // Remove all developer comments
      },
    },
    // 4. Chunking: Splits code into small pieces to make analysis annoying
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'mapbox-gl'],
          ui: ['lucide-react', '@radix-ui/react-slot'],
        },
      },
    },
  },
});
