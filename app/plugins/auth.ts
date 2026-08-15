// Plugin universal (server + client): si hay un token guardado (cookie)
// pero todavía no tenemos el user en el store (ej. recién recargó la
// página), confirmamos que la sesión sigue siendo válida contra el
// backend. Si el token está vencido o inválido, lo limpiamos.
//
// Corre en el servidor a propósito (sin sufijo .client): así el HTML
// que genera el SSR ya incluye el nombre del usuario, y el cliente no
// hidrata con un estado distinto al que el servidor mandó (evita el
// hydration mismatch del saludo en la navbar/inicio).
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      authStore.clearSession()
    }
  }
})
