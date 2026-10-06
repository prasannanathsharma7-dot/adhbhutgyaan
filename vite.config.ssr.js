import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Server build of the app (see src/entry-server.jsx). Output is Node-only and never shipped.
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/entry-server.jsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: { output: { format: 'esm', entryFileNames: 'entry-server.mjs', chunkFileNames: 'assets/[name]-[hash].mjs' } },
  },
});
