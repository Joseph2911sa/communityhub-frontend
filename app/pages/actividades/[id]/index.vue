<script setup lang="ts">
import type { Event } from '~/types/event'
import type { Registration } from '~/types/registration'
import type { Favorite } from '~/types/favorite'

interface EventDetailResponse {
  success: boolean
  message?: string
  data?: {
    event: Event
    confirmedCount: number
    spotsLeft: number
  }
}

interface RegistrationsResponse {
  success: boolean
  data?: { registrations: Registration[] }
}

interface FavoritesResponse {
  success: boolean
  data?: { favorites: Favorite[] }
}

interface Membership {
  isRegistered: boolean
  isFavorite: boolean
}

const route = useRoute()
const eventId = route.params.id as string

const { apiFetch } = useApi()
const authStore = useAuthStore()

const {
  data: eventData,
  pending,
  error
} = await useAsyncData(`actividad-${eventId}`, () => apiFetch<EventDetailResponse>(`/events/${eventId}`))

const event = computed(() => eventData.value?.data?.event ?? null)

const canEditEvent = computed(() => {
  if (!event.value || !authStore.user) return false
  return event.value.organizer._id === authStore.user._id || authStore.user.role === 'admin'
})

// Copia local de cupos disponibles: arranca con el valor del backend y
// se ajusta al inscribirse/cancelar sin tener que recargar la página.
const spotsLeft = ref<number | null>(null)
watch(
  eventData,
  (value) => {
    if (value?.data) {
      spotsLeft.value = value.data.spotsLeft
    }
  },
  { immediate: true }
)

// Estado de inscripción/favorito: solo se consulta si hay sesión (si no,
// las llamadas fallarían con 401 de todos modos).
const { data: membershipData } = await useAsyncData<Membership>(
  `actividad-membresia-${eventId}`,
  async () => {
    if (!authStore.isAuthenticated) {
      return { isRegistered: false, isFavorite: false }
    }

    const [registrationsRes, favoritesRes] = await Promise.all([
      apiFetch<RegistrationsResponse>('/users/me/registrations'),
      apiFetch<FavoritesResponse>('/users/me/favorites')
    ])

    const registrations = registrationsRes.data?.registrations ?? []
    const favorites = favoritesRes.data?.favorites ?? []

    return {
      isRegistered: registrations.some((r) => r.event._id === eventId && r.status === 'confirmed'),
      isFavorite: favorites.some((f) => f.event._id === eventId)
    }
  },
  { watch: [() => authStore.isAuthenticated] }
)

const isRegistered = ref(false)
const isFavorite = ref(false)
watch(
  membershipData,
  (value) => {
    if (value) {
      isRegistered.value = value.isRegistered
      isFavorite.value = value.isFavorite
    }
  },
  { immediate: true }
)

const registerLoading = ref(false)
const registerError = ref<string | null>(null)

const registerButtonLabel = computed(() => {
  if (registerLoading.value) return 'Procesando...'
  if (isRegistered.value) return 'Cancelar inscripción'
  if ((spotsLeft.value ?? 0) <= 0) return 'Sin cupo disponible'
  return 'Inscribirme'
})

const registerButtonDisabled = computed(() => {
  if (registerLoading.value) return true
  if (!isRegistered.value && (spotsLeft.value ?? 0) <= 0) return true
  return false
})

async function handleToggleRegister() {
  registerError.value = null
  registerLoading.value = true
  try {
    if (isRegistered.value) {
      await apiFetch(`/events/${eventId}/register`, { method: 'DELETE' })
      isRegistered.value = false
      if (spotsLeft.value !== null) spotsLeft.value += 1
    } else {
      await apiFetch(`/events/${eventId}/register`, { method: 'POST' })
      isRegistered.value = true
      if (spotsLeft.value !== null) spotsLeft.value -= 1
    }
  } catch (err) {
    registerError.value = (err as Error).message
  } finally {
    registerLoading.value = false
  }
}

const favoriteLoading = ref(false)
const favoriteError = ref<string | null>(null)

const favoriteButtonLabel = computed(() => {
  if (favoriteLoading.value) return isFavorite.value ? 'Quitando...' : 'Agregando...'
  return isFavorite.value ? '★ Quitar de favoritos' : '☆ Marcar como favorito'
})

async function handleToggleFavorite() {
  favoriteError.value = null
  favoriteLoading.value = true
  try {
    if (isFavorite.value) {
      await apiFetch(`/events/${eventId}/favorite`, { method: 'DELETE' })
      isFavorite.value = false
    } else {
      await apiFetch(`/events/${eventId}/favorite`, { method: 'POST' })
      isFavorite.value = true
    }
  } catch (err) {
    favoriteError.value = (err as Error).message
  } finally {
    favoriteLoading.value = false
  }
}
</script>

<template>
  <div class="actividad">
    <NuxtLink to="/actividades" class="back-link">← Volver a actividades</NuxtLink>

    <p v-if="pending" class="status">Cargando actividad...</p>

    <div v-else-if="error || !event" class="not-found">
      <p>Esta actividad no existe o fue eliminada.</p>
      <NuxtLink to="/actividades">Volver a actividades</NuxtLink>
    </div>

    <template v-else>
      <header class="header">
        <p class="header__category">{{ event.category.name }}</p>
        <h1>{{ event.title }}</h1>
        <NuxtLink v-if="canEditEvent" :to="`/actividades/${eventId}/editar`" class="edit-link">
          Editar esta actividad
        </NuxtLink>
      </header>

      <p v-if="event.description" class="description">{{ event.description }}</p>

      <dl class="details">
        <div class="details__row">
          <dt>Fecha</dt>
          <dd>{{ formatEventDateTime(event.date, event.time) }}</dd>
        </div>
        <div class="details__row">
          <dt>Lugar</dt>
          <dd>{{ event.location }}</dd>
        </div>
        <div class="details__row">
          <dt>Capacidad máxima</dt>
          <dd>{{ event.maxCapacity }} personas</dd>
        </div>
        <div class="details__row">
          <dt>Cupos disponibles</dt>
          <dd>{{ spotsLeft }}</dd>
        </div>
        <div class="details__row">
          <dt>Organiza</dt>
          <dd>{{ event.organizer.firstName }} {{ event.organizer.lastName }} ({{ event.organizer.email }})</dd>
        </div>
      </dl>

      <div v-if="authStore.isAuthenticated" class="actions">
        <div class="actions__group">
          <button type="button" :disabled="registerButtonDisabled" @click="handleToggleRegister">
            {{ registerButtonLabel }}
          </button>
          <p v-if="registerError" class="error">{{ registerError }}</p>
        </div>

        <div class="actions__group">
          <button type="button" :disabled="favoriteLoading" @click="handleToggleFavorite">
            {{ favoriteButtonLabel }}
          </button>
          <p v-if="favoriteError" class="error">{{ favoriteError }}</p>
        </div>
      </div>

      <div v-else class="guest-notice">
        <p>Inicia sesión para inscribirte o marcar como favorito.</p>
        <div class="guest-notice__links">
          <NuxtLink to="/login">Iniciar sesión</NuxtLink>
          <NuxtLink to="/registro">Registrarse</NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.actividad {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
}

.back-link {
  align-self: flex-start;
  font-size: 0.9rem;
  color: #374151;
  text-decoration: none;
}

.back-link:hover {
  color: #111827;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.not-found {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
}

.not-found a {
  color: #b91c1c;
  font-weight: 600;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.header__category {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
  background-color: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.header h1 {
  font-size: 1.75rem;
  color: #111827;
}

.edit-link {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
}

.edit-link:hover {
  color: #1f2937;
}

.description {
  color: #374151;
  line-height: 1.6;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.details__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
}

.details__row dt {
  color: #6b7280;
}

.details__row dd {
  margin: 0;
  color: #1f2937;
  text-align: right;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.actions__group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.actions__group button {
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #111827;
  background-color: #111827;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.actions__group button:hover:not(:disabled) {
  background-color: #1f2937;
}

.actions__group button:disabled {
  background-color: #ffffff;
  color: #9ca3af;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.85rem;
  max-width: 320px;
}

.guest-notice {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.25rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
}

.guest-notice__links {
  display: flex;
  gap: 1rem;
  font-weight: 600;
}

.guest-notice__links a {
  color: #111827;
}
</style>
