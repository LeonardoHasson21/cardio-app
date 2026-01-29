import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true, // Esto permite que escuche en todos los puertos (vital para la nube)
    allowedHosts: ['cozy-consideration-production.up.railway.app'] // <--- ¡AQUÍ ESTÁ LA CLAVE!
  }
})
