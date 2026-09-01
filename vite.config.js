import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, infrequently-changing third-party vendor code into its
        // own cacheable chunks, separate from app code (which changes on
        // every deploy) and from each other (so a change in one doesn't
        // invalidate the browser cache for the others).
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
            return 'react-vendor';
          }
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          if (id.includes('astronomy-engine')) {
            return 'astro-vendor';
          }
        },
      },
    },
  },
});
