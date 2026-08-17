interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  // `object` en vez de `Record<string, unknown>`: así se puede pasar
  // directamente una interfaz nombrada (ej. ActivityFormPayload) sin
  // necesitar un cast en cada call site — un Record<string, unknown>
  // exige firma de índice, que las interfaces nombradas no tienen.
  body?: object
  query?: Record<string, unknown>
  headers?: Record<string, string>
}

interface ApiErrorPayload {
  success: false
  message: string
}

// Reescribe el .message del error de $fetch con el mensaje que manda el
// backend (data.message), para no tener que rebuscar en error.data en
// cada componente que consuma la API.
function normalizeApiError(error: unknown): Error {
  if (error instanceof Error && 'data' in error) {
    const data = (error as { data?: ApiErrorPayload }).data
    if (data?.message) {
      error.message = data.message
    }
  }
  return error as Error
}

// Distingue un error HTTP real (el backend respondió, ej. 404/403) de
// una falla de red (offline, timeout, DNS...).
//
// OJO: `.statusCode` NO sirve para esto — confirmado con evidencia real
// (DEBUG error shape en consola): cuando useAsyncData de Nuxt envuelve
// el error, le estampa statusCode: 500 por defecto aunque ofetch nunca
// haya recibido una Response (el propio .message lo confirma con el
// literal "<no response>" que ofetch agrega cuando ctx.response nunca
// se asignó). Lo confiable es el texto del mensaje: ofetch siempre
// incluye "<no response>" en ese caso, y el navegador agrega
// "Failed to fetch" para el TypeError subyacente. Se expone acá para
// no duplicar este chequeo en cada página que necesite diferenciar
// "no existe" de "no se pudo cargar sin conexión".
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return error.message.includes('<no response>') || error.message.includes('Failed to fetch')
}

// Wrapper delgado sobre $fetch: resuelve la baseURL desde runtimeConfig,
// agrega el header Authorization si hay un token de sesión, y normaliza
// los errores del backend.
export function useApi() {
  const config = useRuntimeConfig()

  async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
    // Se importa el store dentro de la función (no a nivel de módulo)
    // para evitar el ciclo de dependencia con app/stores/auth.ts, que a
    // su vez usa este composable para hacer sus llamadas a la API.
    const authStore = useAuthStore()

    try {
      return await $fetch<T>(url, {
        baseURL: config.public.apiBase,
        method: options.method,
        body: options.body,
        query: options.query,
        headers: {
          ...options.headers,
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {})
        },
        timeout: 8000, // 8s: generoso para red lenta real, pero acota
                       // el caso offline en vez de colgarse
        retry: 0 // el retry automático de ofetch (1 GET extra por
                  // llamada fallida) no ayuda offline, solo duplica
                  // la espera
      })
    } catch (error) {
      throw normalizeApiError(error)
    }
  }

  return { apiFetch }
}
