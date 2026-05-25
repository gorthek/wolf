import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Le build output est dans "dist" par défaut — Vercel le détecte automatiquement.
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    // En développement local, le proxy redirige /api vers le bot local.
    // En production sur Vercel, VITE_API_URL remplace ce proxy.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
