<script setup lang="ts">
definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return navigateTo('/login')
      }
      if (!authStore.isAdmin) {
        return navigateTo('/actividades')
      }
    }
  ]
})

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

const { data, pending } = await useAsyncData('admin-statistics', () =>
  apiFetch<StatisticsResponse>('/admin/statistics')
)
const statistics = computed(() => data.value?.data ?? null)
</script>

<template>
  <div class="admin-statistics">
    <h1>Estadísticas</h1>

    <p v-if="pending" class="status">Cargando estadísticas...</p>

    <template v-else-if="statistics">
      <section class="stats-section">
        <h2>Comunidad</h2>
        <div class="stats-grid">
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.totalUsers }}</p>
            <p class="stat-tile__label">Usuarios registrados</p>
          </div>
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.totalOrganizers }}</p>
            <p class="stat-tile__label">Organizadores</p>
          </div>
        </div>
      </section>

      <section class="stats-section">
        <h2>Actividades</h2>
        <div class="stats-grid">
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.totalActivities }}</p>
            <p class="stat-tile__label">Actividades totales</p>
          </div>
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.activeActivities }}</p>
            <p class="stat-tile__label">Activas</p>
          </div>
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.finishedActivities }}</p>
            <p class="stat-tile__label">Finalizadas</p>
          </div>
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.cancelledActivities }}</p>
            <p class="stat-tile__label">Canceladas</p>
          </div>
          <div class="stat-tile">
            <p class="stat-tile__value">{{ statistics.totalRegistrations }}</p>
            <p class="stat-tile__label">Inscripciones totales</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.admin-statistics {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-statistics > h1 {
  font-size: 1.75rem;
  color: #111827;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats-section h2 {
  font-size: 1.2rem;
  color: #111827;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.stat-tile {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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
</style>
