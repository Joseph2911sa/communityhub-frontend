// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
    typeCheck: false   // false para no ralentizar el dev server; el
                        // chequeo se corre manualmente con npm run typecheck
  }
})
