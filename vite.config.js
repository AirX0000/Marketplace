import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Autohouse Premium',
        short_name: 'Autohouse',
        description: 'Elite Marketplace for Cars and Real Estate in Uzbekistan.',
        theme_color: '#13111C',
        background_color: '#13111C',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        navigateFallbackDenylist: [/^\/assets\//, /\.(js|css|png|jpg|jpeg|svg|gif|ico|webp|woff|woff2)$/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^\/(api|uploads)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }

    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-core';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            if (id.includes('leaflet')) {
              return 'vendor-maps';
            }
            return 'vendor';
          }
          if (id.includes('/src/pages/')) {
            const name = id.split('/src/pages/')[1].split('.')[0].toLowerCase();
            return `page-${name}`;
          }
        }
      }
    }
  }
})
