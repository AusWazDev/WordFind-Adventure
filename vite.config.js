import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!env.VITE_SENTRY_DSN) {
    console.warn('\n⚠️  WARNING: VITE_SENTRY_DSN is not set — Sentry crash reporting will be DISABLED in this build.')
    console.warn('   Add VITE_SENTRY_DSN to .env.local (local builds) or the platform environment variables (Vercel/Electron/Capacitor).\n')
  }
  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Precache the app shell (JS, CSS, HTML, icon)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

        // Runtime cache for ElevenLabs audio — CacheFirst so once a file is
        // fetched on WiFi it is served from cache offline indefinitely.
        runtimeCaching: [
          {
            urlPattern: /^\/audio\/.+\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'soundfind-audio-v1',
              expiration: {
                maxEntries: 5000,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SoundFind',
        short_name: 'SoundFind',
        description: 'Hear it. Find it.',
        id: '/',
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0f0e1a',
        background_color: '#0f0e1a',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
  }
})
