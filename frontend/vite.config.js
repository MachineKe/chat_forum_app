import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./components', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./hooks', import.meta.url)),
      '@pages': fileURLToPath(new URL('./pages', import.meta.url)),
      '@utils': fileURLToPath(new URL('./utils', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./layouts', import.meta.url)),
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  server: {
    allowedHosts: ['forum.beyondsoftwares.com', 'chat-forum-app.vercel.app'],
    // Uncomment and adjust proxy if needed:
    // proxy: {
    //   '/api': 'http://localhost:5050',
    //   '/uploads': 'http://localhost:5050',
    // },
  },
})
