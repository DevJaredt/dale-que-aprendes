import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, Vite corre en el puerto 5173 y reenvía /api al servidor Node (3000).
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
})
