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
  }
}));
