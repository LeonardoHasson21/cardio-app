import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- CONFIGURACIÓN PARA RAILWAY (VITE 6) ---
  server: {
    host: true,       // Escuchar en todas las interfaces (0.0.0.0)
    allowedHosts: true // Permitir cualquier dominio (soluciona el error Blocked request)
  },
  preview: {
    host: true,       // Escuchar en todas las interfaces en modo preview
    port: 4173,       // Puerto estándar de preview
    allowedHosts: true // Permitir el dominio de Railway en producción
  }
})