<script setup lang="ts">
import type { Event } from '~/types/event'

definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return navigateTo('/login')
      }
    }
  ]
})

interface EventsResponse {
  success: boolean
  data?: { events: Event[] }
}

const { apiFetch } = useApi()
const authStore = useAuthStore()

const canManageEvents = computed(
  () => authStore.user?.role === 'organizer' || authStore.user?.role === 'admin'
)

const { data, pending } = await useAsyncData(
  'mis-actividades',
  () => {
    if (!canManageEvents.value || !authStore.user) {
      return Promise.resolve(null)
    }
    return apiFetch<EventsResponse>('/events', { query: { organizer: authStore.user._id } })
  },
  { watch: [canManageEvents] }
)

const events = ref<Event[]>([])
watch(
  data,
  (value) => {
    events.value = value?.data?.events ?? []
  },
  { immediate: true }
)

const deletingId = ref<string | null>(null)
const deleteError = ref<string | null>(null)

async function handleDelete(event: Event) {
  const confirmed = confirm(`¿Eliminar la actividad "${event.title}"? Esta acción no se puede deshacer.`)
  if (!confirmed) return

  deleteError.value = null
  deletingId.value = event._id
  try {
    await apiFetch(`/events/${event._id}`, { method: 'DELETE' })
    events.value = events.value.filter((e) => e._id !== event._id)
  } catch (error) {
    deleteError.value = (error as Error).message
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="mis-actividades">
    <div class="header-row">
      <h1>Mis actividades</h1>
      <NuxtLink v-if="canManageEvents" to="/actividades/crear" class="create-link">
        + Crear actividad
      </NuxtLink>
    </div>

    <p v-if="!canManageEvents" class="status">
      Esta sección es para organizadores. Contacta a un administrador si quieres crear
      actividades.
    </p>

    <template v-else>
      <p v-if="pending" class="status">Cargando tus actividades...</p>

      <template v-else>
        <p v-if="events.length === 0" class="status">Todavía no has creado ninguna actividad.</p>

        <div v-else class="grid">
          <EventCard v-for="event in events" :key="event._id" :event="event">
            <template #actions>
              <div class="card-actions">
                <NuxtLink :to="`/actividades/${event._id}/editar`" class="card-actions__link">
                  Editar
                </NuxtLink>
                <button
                  type="button"
                  :disabled="deletingId === event._id"
                  @click="handleDelete(event)"
                >
                  {{ deletingId === event._id ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
            </template>
          </EventCard>
        </div>

        <p v-if="deleteError" class="error">{{ deleteError }}</p>
      </template>
    </template>
  </div>
</template>

<style scoped>
.mis-actividades {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.header-row h1 {
  font-size: 1.75rem;
  color: #111827;
}

.create-link {
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  background-color: #111827;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.create-link:hover {
  background-color: #1f2937;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
  max-width: 60ch;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.card-actions__link {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
}

.card-actions button {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #b91c1c;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.card-actions button:hover:not(:disabled) {
  background-color: #fef2f2;
}

.card-actions button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
