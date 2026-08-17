// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api'
    }
  },
  typescript: {
    strict: true,
    typeCheck: false   // false para no ralentizar el dev server; el
                        // chequeo se corre manualmente con npm run typecheck
  },
  pwa: {
    registerType: 'autoUpdate',
    devOptions: { enabled: true }, // para poder probar el SW en dev,
                                    // sin necesitar build de producción
    manifest: {
      name: 'CommunityHub',
      short_name: 'CommunityHub',
      description: 'Plataforma comunitaria de actividades y eventos',
      start_url: '/',
      display: 'standalone',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      // OJO: @vite-pwa/nuxt reinyecta navigateFallback: '/' por su
      // cuenta si la clave está ausente (ver configurePWAOptions en
      // node_modules/@vite-pwa/nuxt/dist/shared/nuxt.*.mjs) — omitir
      // la propiedad NO alcanza para desactivarlo. Poniéndola en
      // `undefined` explícito, la clave existe (`'navigateFallback'
      // in options.workbox` da true) y el módulo no la pisa. En SSR
      // no hay un shell estático real que precachear
      // (createHandlerBoundToURL('/') no tiene nada válido que
      // servir) — cacheamos las páginas REALMENTE visitadas vía
      // runtime caching en su lugar (primera entrada abajo).
      navigateFallback: undefined,
      // Un SW nuevo toma control de las pestañas ya abiertas de
      // inmediato al activarse, en vez de esperar a que el usuario
      // cierre y reabra — reduce ventanas de tiempo sin ningún SW
      // controlando la página en actualizaciones futuras.
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          // Cualquier navegación (carga de página completa / F5) que
          // ya se haya visitado con conexión queda en 'pages-cache' y
          // se puede volver a servir offline. Una URL nunca visitada
          // sigue sin tener nada que cachear — ahí es correcto que el
          // navegador muestre su error nativo.
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          // Los archivos bajo /_nuxt/ llevan hash de contenido en el
          // nombre (confirmado: mismo código -> mismo hash siempre;
          // cambia el código -> cambia el nombre del archivo). Al ser
          // inmutables, CacheFirst es seguro: una vez cacheados no
          // hace falta volver a pedirlos por red.
          urlPattern: ({ url }) => url.pathname.startsWith('/_nuxt/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/events'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-events-cache',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/categories'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-categories-cache',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ]
    }
  }
})
