import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallbackDenylist: [/^\/sitemap\.xml$/],
      },
      manifest: {
        name: 'Padukuhan Piji',
        short_name: 'Piji',
        theme_color: '#15803d',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/bambu.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/bambu.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})
