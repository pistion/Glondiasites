import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // In dev, proxy /api to the local NestJS backend so CORS is never an issue.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise the warning threshold slightly — Bootstrap alone is ~150 kB.
    chunkSizeWarningLimit: 600,
  },
})
