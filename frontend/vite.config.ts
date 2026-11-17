import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // While developing, send every /api request to the NestJS backend on port 3000.
    // On the Ubuntu server, Nginx does the same job (see nginx/cbl-frontend.conf).
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
})
