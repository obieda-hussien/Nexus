import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Nexus/',
  build: {
    // Enable source maps for production debugging
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/firestore'],
          'ui-vendor': ['framer-motion', 'aos', 'lucide-react'],
          'payment-vendor': ['@paypal/paypal-js', '@stripe/stripe-js'],
          'utils-vendor': ['axios', 'date-fns', 'uuid'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // Use esbuild for faster minification (removes console automatically in production)
    minify: 'esbuild',
  },
})
