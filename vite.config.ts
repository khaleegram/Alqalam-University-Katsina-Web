import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'assets/avater.png'],
      manifest: {
        name: "Al-Qalam Timetable Generator",
        short_name: "ATG",
        description: "A progressive web app for the Al-Qalam Timetable Generator.",
        theme_color: '#1a202c',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'assets/avater.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/avater.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      }
    }),
  ],
  server: {
    https: false,
    host: "0.0.0.0",
    allowedHosts: ['.ngrok-free.app'], // 👈 move this here
  },
  preview: {
    host: "0.0.0.0",
  }
});