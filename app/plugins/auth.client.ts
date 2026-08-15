// Al cargar la app en el cliente: si hay un token guardado (cookie)
// pero todavía no tenemos el user en el store (ej. recién recargó la
// página), confirmamos que la sesión sigue siendo válida contra el
// backend. Si el token está vencido o inválido, lo limpiamos.
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
