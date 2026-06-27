import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Honra la variable PORT si está definida (p. ej. herramientas de preview);
  // por defecto usa el 5173 habitual de Vite.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
