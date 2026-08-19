<script setup lang="ts">
import type { Registration } from '~/types/registration'
import type { Favorite } from '~/types/favorite'
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

interface RegistrationsResponse {
  success: boolean
  data?: { registrations: Registration[] }
}

interface FavoritesResponse {
  success: boolean
  data?: { favorites: Favorite[] }
}

interface EventsResponse {
  success: boolean
  data?: { events: Event[] }
}

interface StatisticsResponse {
  success: boolean
  data?: {
    totalUsers: number
    totalOrganizers: number
    totalActivities: number
    totalRegistrations: number
    activeActivities: number
    finishedActivities: number
    cancelledActivities: number
  }
}

const { apiFetch } = useApi()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const { data: registrationsData, pending: registrationsPending } = await useAsyncData(
  'dashboard-registrations',
  () => apiFetch<RegistrationsResponse>('/users/me/registrations')
)
const registrations = computed(() => registrationsData.value?.data?.registrations ?? [])

const { data: favoritesData, pending: favoritesPending } = await useAsyncData(
  'dashboard-favorites',
  () => apiFetch<FavoritesResponse>('/users/me/favorites')
)
const favorites = computed(() => favoritesData.value?.data?.favorites ?? [])

const upcomingEvents = computed(() =>
  registrations.value
    .filter((r) => r.status === 'confirmed' && !isEventFinished(r.event.date, r.event.time))
    .slice(0, 5)
    .map((r) => r.event)
)

const favoritesPreview = computed(() => favorites.value.slice(0, 3).map((f) => f.event))

const historyCount = computed(
  () =>
    registrations.value.filter(
      (r) => r.status === 'cancelled' || isEventFinished(r.event.date, r.event.time)
    ).length
)

// --- Organizer (además de lo de arriba, no en vez de) ---
const { data: myEventsData, pending: myEventsPending } = await useAsyncData(
  'dashboard-my-events',
  () => {
    if (!authStore.isOrganizer || !authStore.user) {
      return Promise.resolve(null)
    }
    return apiFetch<EventsResponse>('/events', { query: { organizer: authStore.user._id } })
  },
  { watch: [() => authStore.isOrganizer] }
)
const myEvents = computed(() => myEventsData.value?.data?.events ?? [])
const myActiveEvents = computed(() => myEvents.value.filter((e) => e.status !== 'cancelled'))
const myCancelledEvents = computed(() => myEvents.value.filter((e) => e.status === 'cancelled'))

// --- Admin (además de lo de arriba) ---
const { data: statisticsData, pending: statisticsPending } = await useAsyncData(
  'dashboard-statistics',
  () => {
    if (!authStore.isAdmin) {
      return Promise.resolve(null)
    }
    return apiFetch<StatisticsResponse>('/admin/statistics')
  },
  { watch: [() => authStore.isAdmin] }
)
const statistics = computed(() => statisticsData.value?.data ?? null)
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <section class="dashboard-section">
      <div class="dashboard-section__header">
        <h2>Próximas actividades</h2>
        <NuxtLink to="/mis-inscripciones">Ver todas</NuxtLink>
      </div>
      <p v-if="registrationsPending" class="status">Cargando...</p>
      <p v-else-if="upcomingEvents.length === 0" class="status">
        No tienes próximas actividades. <NuxtLink to="/actividades">Explorar actividades</NuxtLink>
      </p>
      <div v-else class="grid">
        <EventCard v-for="event in upcomingEvents" :key="event._id" :event="event" />
      </div>
    </section>

    <section class="dashboard-section">
      <div class="dashboard-section__header">
        <h2>Favoritos ({{ favorites.length }})</h2>
        <NuxtLink to="/favoritos">Ver todos</NuxtLink>
      </div>
      <p v-if="favoritesPending" class="status">Cargando...</p>
      <p v-else-if="favoritesPreview.length === 0" class="status">
        Todavía no tienes actividades favoritas.
      </p>
      <div v-else class="grid">
        <EventCard v-for="event in favoritesPreview" :key="event._id" :event="event" />
      </div>
    </section>

    <section class="dashboard-section">
      <div class="stat-row">
        <NuxtLink to="/mis-inscripciones" class="stat-tile">
          <p class="stat-tile__value">{{ historyCount }}</p>
          <p class="stat-tile__label">En tu historial</p>
        </NuxtLink>
        <NuxtLink to="/notificaciones" class="stat-tile">
          <p class="stat-tile__value">{{ notificationsStore.unreadCount }}</p>
          <p class="stat-tile__label">Notificaciones sin leer</p>
        </NuxtLink>
      </div>
    </section>

    <section v-if="authStore.isOrganizer" class="dashboard-section">
      <h2>Actividades creadas</h2>

      <p v-if="myEventsPending" class="status">Cargando...</p>
      <template v-else>
        <div class="organizer-group">
          <h3>Activas ({{ myActiveEvents.length }})</h3>
          <p v-if="myActiveEvents.length === 0" class="status">
            No tienes actividades activas.
          </p>
          <ul v-else class="organizer-list">
            <li v-for="event in myActiveEvents" :key="event._id">
              <span class="organizer-list__title">{{ event.title }}</span>
              <span class="organizer-list__meta">
                {{ event.confirmedCount ?? 0 }}/{{ event.maxCapacity }} inscritos ·
                {{ formatEventDateTime(event.date, event.time) }}
              </span>
            </li>
          </ul>
        </div>

        <div class="organizer-group">
          <h3>Canceladas ({{ myCancelledEvents.length }})</h3>
          <p v-if="myCancelledEvents.length === 0" class="status">
            No tienes actividades canceladas.
          </p>
          <ul v-else class="organizer-list">
            <li v-for="event in myCancelledEvents" :key="event._id">
              <span class="organizer-list__title">{{ event.title }}</span>
              <span class="organizer-list__meta">
                {{ event.confirmedCount ?? 0 }}/{{ event.maxCapacity }} inscritos ·
                {{ formatEventDateTime(event.date, event.time) }}
              </span>
            </li>
          </ul>
        </div>
      </template>
    </section>

    <section v-if="authStore.isAdmin" class="dashboard-section">
      <div class="dashboard-section__header">
        <h2>Estadísticas generales</h2>
        <NuxtLink to="/admin">Ir al panel de administración</NuxtLink>
      </div>

      <p v-if="statisticsPending" class="status">Cargando...</p>
      <div v-else-if="statistics" class="stats-grid">
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.totalUsers }}</p>
          <p class="stat-tile__label">Usuarios registrados</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.totalOrganizers }}</p>
          <p class="stat-tile__label">Organizadores</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.totalActivities }}</p>
          <p class="stat-tile__label">Actividades totales</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.totalRegistrations }}</p>
          <p class="stat-tile__label">Inscripciones totales</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.activeActivities }}</p>
          <p class="stat-tile__label">Actividades activas</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.finishedActivities }}</p>
          <p class="stat-tile__label">Actividades finalizadas</p>
        </div>
        <div class="stat-tile stat-tile--static">
          <p class="stat-tile__value">{{ statistics.cancelledActivities }}</p>
          <p class="stat-tile__label">Actividades canceladas</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard > h1 {
  font-size: 1.75rem;
  color: #111827;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-section__header h2 {
  font-size: 1.2rem;
  color: #111827;
}

.dashboard-section__header a {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
}

.dashboard-section > h2 {
  font-size: 1.2rem;
  color: #111827;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.status a {
  color: #111827;
  font-weight: 600;
  margin-left: 0.35rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.stat-tile {
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.15s ease;
}

.stat-tile:not(.stat-tile--static):hover {
  border-color: #111827;
}

.stat-tile--static {
  cursor: default;
}

.stat-tile__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.stat-tile__label {
  font-size: 0.85rem;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.organizer-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.organizer-group h3 {
  font-size: 0.95rem;
  color: #374151;
}

.organizer-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.organizer-list li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.organizer-list__title {
  font-weight: 600;
  color: #111827;
}

.organizer-list__meta {
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
