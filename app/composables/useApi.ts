interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, unknown>
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
        }
      })
    } catch (error) {
      throw normalizeApiError(error)
    }
  }

  return { apiFetch }
}
