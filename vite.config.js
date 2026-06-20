// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',   // The software updates automatically
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],

      // Workbox Strategy: Cache Everything the App Needs
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],

        // Runtime Caching for Google Fonts (Inter)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },

      manifest: {
        name: 'Zeitwerk',
        short_name: 'Zeitwerk',
        description: 'Personal Time Tracking',
        theme_color: '#01696f',
        background_color: '#f7f6f2',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            url: '/#/dashboard',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Monthly Overview',
            short_name: 'Overview',
            url: '/#/month-overview',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Calendar',
            short_name: 'Calendar',
            url: '/#/calendar',
            icons: [{ src: 'icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
