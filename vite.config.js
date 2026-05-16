import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const hostPresets = {
  development: '127.0.0.1',
  production: '127.0.0.1',
  localhost: '127.0.0.1',
  global: '0.0.0.0',
  session: '0.0.0.0',
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const host = env.VITE_HOST || hostPresets[mode] || hostPresets.development
  const port = Number(env.VITE_PORT || 5173)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173)

  return {
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: true,
    },
    preview: {
      host,
      port: previewPort,
      strictPort: true,
    },
  }
})
