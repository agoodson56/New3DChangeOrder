import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SECURITY: We deliberately DO NOT inject GEMINI_API_KEY into the client bundle.
// All AI calls go through /api/gemini (Cloudflare Pages Function) which holds
// the key as a server-side env var. See functions/api/gemini.ts.
export default defineConfig(() => ({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    // Code-split the heaviest modules so first paint doesn't ship the
    // entire product DB and AI service in one chunk. The product catalog
    // alone is ~2,500 entries; we want it as a separate lazy chunk that
    // only loads when the user actually opens the change-order view.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/data/products/') || id.includes('/data/productDatabase')) {
            return 'product-db';
          }
          if (id.includes('/services/gemini') || id.includes('/services/pricing') || id.includes('/services/qaAuditor') || id.includes('/services/productSearch')) {
            return 'ai-services';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
    // Raise the warning threshold to a realistic number for this app —
    // the AI services + product DB chunks are big by nature.
    chunkSizeWarningLimit: 600,
  },
}));
