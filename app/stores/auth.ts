import type { User } from '~/types/user'

interface AuthResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    token: string
  }
}

interface MeResponse {
  success: boolean
  message?: string
  data?: {
    user: User
  }
}

interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  profilePicture?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // useCookie es SSR-safe (a diferencia de localStorage/sessionStorage),
  // así el token sobrevive un refresh de página tanto en cliente como
  // durante el render del servidor.
  const tokenCookie = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7
  })

  const user = ref<User | null>(null)
  const token = ref<string | null>(tokenCookie.value)
  const loading = ref(false)

  // Cualquier asignación a token.value (desde las acciones de abajo o
  // desde afuera, ej. clearSession) queda sincronizada con la cookie.
  watch(token, (newToken) => {
    tokenCookie.value = newToken
  })

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOrganizer = computed(() => user.value?.role === 'organizer' || isAdmin.value)

  function clearSession() {
    user.value = null
    token.value = null

    // El store de notificaciones es independiente del de auth — si no
    // se limpia acá, las notificaciones del usuario que cerró sesión
    // quedan en memoria y se le atribuyen visualmente al que inicie
    // sesión después en la misma pestaña (defineStore setup-style, sin
    // $reset() automático de Pinia, así que se limpia a mano).
    const notificationsStore = useNotificationsStore()
    notificationsStore.notifications = []
    notificationsStore.unreadCount = 0
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profilePicture?: string
  ) {
    loading.value = true
    try {
      const { apiFetch } = useApi()
      const response = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: profilePicture
          ? { firstName, lastName, email, password, profilePicture }
          : { firstName, lastName, email, password }
      })
      if (response.data) {
        user.value = response.data.user
        token.value = response.data.token
        // El registro también deja la sesión iniciada — sin esto, el
        // badge/página de notificaciones quedarían vacíos hasta el
        // próximo F5 en vez de reflejar al usuario recién registrado.
        // Si esto falla, no debe hacer fallar el registro en sí (mismo
        // criterio que en app/plugins/auth.ts).
        try {
          const notificationsStore = useNotificationsStore()
          await notificationsStore.fetchNotifications()
        } catch {
        }
      }
      return response
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { apiFetch } = useApi()
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      if (response.data) {
        user.value = response.data.user
        token.value = response.data.token
        // Sin esto, un login dentro de la misma pestaña (sin recargar)
        // deja las notificaciones del usuario anterior visibles bajo
        // la sesión nueva — el plugin de auth.ts solo trae
        // notificaciones al montar la app, no en cada login. Si esto
        // falla, no debe hacer fallar el login en sí (mismo criterio
        // que en app/plugins/auth.ts).
        try {
          const notificationsStore = useNotificationsStore()
          await notificationsStore.fetchNotifications()
        } catch {
        }
      }
      return response
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      const { apiFetch } = useApi()
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {
      // Si el logout falla en el backend (token ya vencido, red caída,
      // etc.) igual limpiamos la sesión localmente.
    } finally {
      clearSession()
      loading.value = false
    }
  }

  async function fetchMe() {
    loading.value = true
    try {
      const { apiFetch } = useApi()
      const response = await apiFetch<MeResponse>('/auth/me')
      if (response.data) {
        user.value = response.data.user
      }
      return response
    } finally {
      loading.value = false
    }
  }

  // Autoservicio (PUT /users/me): solo firstName/lastName/profilePicture.
  // A diferencia de admin/users.vue (que gestiona role/isActive de OTROS
  // usuarios vía PUT /users/:id), esto es el propio usuario editando su
  // perfil -- el backend ya ignora role/isActive si vienen colados acá,
  // pero ni siquiera se los mandamos desde este composable.
  async function updateProfile(payload: UpdateProfilePayload) {
    loading.value = true
    try {
      const { apiFetch } = useApi()
      const response = await apiFetch<MeResponse>('/users/me', {
        method: 'PUT',
        body: payload
      })
      if (response.data) {
        user.value = response.data.user
      }
      return response
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isOrganizer,
    clearSession,
    register,
    login,
    logout,
    fetchMe,
    updateProfile
  }
})
