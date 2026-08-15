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

const events = computed(() => data.value?.data?.events ?? [])
</script>

<template>
  <div class="mis-actividades">
    <h1>Mis actividades</h1>

    <p v-if="!canManageEvents" class="status">
      Esta sección es para organizadores. Contacta a un administrador si quieres crear
      actividades.
    </p>

    <template v-else>
      <p v-if="pending" class="status">Cargando tus actividades...</p>

      <template v-else>
        <p v-if="events.length === 0" class="status">Todavía no has creado ninguna actividad.</p>

        <div v-else class="grid">
          <EventCard v-for="event in events" :key="event._id" :event="event" />
        </div>
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

.mis-actividades h1 {
  font-size: 1.75rem;
  color: #111827;
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
</style>
