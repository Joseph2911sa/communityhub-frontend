// Plugin universal (server + client): si hay un token guardado (cookie)
// pero todavía no tenemos el user en el store (ej. recién recargó la
// página), confirmamos que la sesión sigue siendo válida contra el
// backend. Si el token está vencido o inválido, lo limpiamos.
//
// Corre en el servidor a propósito (sin sufijo .client): así el HTML
// que genera el SSR ya incluye el nombre del usuario, y el cliente no
// hidrata con un estado distinto al que el servidor mandó (evita el
// hydration mismatch del saludo en la navbar/inicio). Por la misma
// razón, las notificaciones (badge en la navbar) también se cargan acá
// y no en un fetch solo-cliente: si no, el servidor renderizaría el
// badge sin conteo y el cliente lo actualizaría después, causando el
// mismo tipo de mismatch.
export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      authStore.clearSession()
      return
    }

    try {
      const notificationsStore = useNotificationsStore()
      await notificationsStore.fetchNotifications()
    } catch {
      // Si falla la carga de notificaciones no invalidamos la sesión
      // (el login sigue siendo válido) — simplemente el badge queda
      // vacío hasta el próximo intento.
    }
  }
})
