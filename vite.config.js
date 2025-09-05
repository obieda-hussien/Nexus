import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Nexus/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-hot-toast', 'aos'],
          // Dashboard components in separate chunks
          'dashboard': [
            './src/pages/StudentDashboard',
            './src/pages/InstructorDashboard', 
            './src/pages/AdminDashboard'
          ]
        }
      }
    },
    // Reduce chunk size warning threshold
    chunkSizeWarningLimit: 600
  }
})
