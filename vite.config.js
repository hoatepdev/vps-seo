import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Base path for absolute URLs (change if deploying to subdirectory)
  base: '/',

  // Build options
  build: {
    // Disable sourcemaps in production for security
    sourcemap: false,

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'seo-vendor': ['react-helmet-async'],
        },
      },
    },

    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },

  // Server options for development
  server: {
    port: 5173,
    host: true,
  },

  // Preview server options
  preview: {
    port: 4173,
    host: true,
  },
});
