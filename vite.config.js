import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le serveur accepte l'hôte de l'aperçu de développement (*.e2b.app) et reste lié à 0.0.0.0.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
});
