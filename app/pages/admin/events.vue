<script setup lang="ts">
import type { Event } from '~/types/event'

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

interface EventsResponse {
  success: boolean
  data?: { events: Event[] }
}

const { apiFetch } = useApi()

const { data, pending } = await useAsyncData('admin-events', () => apiFetch<EventsResponse>('/events'))

const events = ref<Event[]>([])
watch(
  data,
  (value) => {
    events.value = value?.data?.events ?? []
  },
  { immediate: true }
)

const statusLabels: Record<Event['status'], string> = {
  active: 'Activa',
  cancelled: 'Cancelada',
  finished: 'Finalizada'
}

const rowLoadingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const rowErrors = ref<Record<string, string>>({})

function isRowBusy(id: string): boolean {
  return rowLoadingId.value === id || deletingId.value === id
}

async function handleToggleStatus(event: Event) {
  const newStatus = event.status === 'active' ? 'cancelled' : 'active'

  delete rowErrors.value[event._id]
  rowLoadingId.value = event._id
  try {
    await apiFetch(`/events/${event._id}`, { method: 'PUT', body: { status: newStatus } })
    event.status = newStatus
  } catch (error) {
    rowErrors.value[event._id] = (error as Error).message
  } finally {
    rowLoadingId.value = null
  }
}

async function handleDelete(event: Event) {
  const confirmed = confirm(
    `¿Eliminar la actividad "${event.title}"? Esta acción no se puede deshacer.`
  )
  if (!confirmed) return

  delete rowErrors.value[event._id]
  deletingId.value = event._id
  try {
    await apiFetch(`/events/${event._id}`, { method: 'DELETE' })
    events.value = events.value.filter((e) => e._id !== event._id)
  } catch (error) {
    rowErrors.value[event._id] = (error as Error).message
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="admin-events">
    <h1>Actividades</h1>

    <p v-if="pending" class="status">Cargando actividades...</p>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Organizador</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Capacidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event._id">
            <td>{{ event.title }}</td>
            <td>{{ event.organizer.firstName }} {{ event.organizer.lastName }}</td>
            <td>{{ event.category.name }}</td>
            <td>{{ formatEventDateTime(event.date, event.time) }}</td>
            <td>{{ event.maxCapacity }}</td>
            <td>
              <span class="badge" :class="`badge--${event.status}`">
                {{ statusLabels[event.status] }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button
                  v-if="event.status === 'active'"
                  type="button"
                  :disabled="isRowBusy(event._id)"
                  @click="handleToggleStatus(event)"
                >
                  {{ rowLoadingId === event._id ? 'Procesando...' : 'Cancelar' }}
                </button>
                <button
                  v-else-if="event.status === 'cancelled'"
                  type="button"
                  :disabled="isRowBusy(event._id)"
                  @click="handleToggleStatus(event)"
                >
                  {{ rowLoadingId === event._id ? 'Procesando...' : 'Reactivar' }}
                </button>
                <button
                  type="button"
                  class="row-actions__delete"
                  :disabled="isRowBusy(event._id)"
                  @click="handleDelete(event)"
                >
                  {{ deletingId === event._id ? 'Eliminando...' : 'Eliminar' }}
                </button>
              </div>
              <p v-if="rowErrors[event._id]" class="row-error">{{ rowErrors[event._id] }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-events {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-events h1 {
  font-size: 1.75rem;
  color: #111827;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.table-wrapper {
  overflow-x: auto;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  white-space: nowrap;
}

th {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:not(:last-child) td {
  border-bottom: 1px solid #f3f4f6;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.badge--active {
  background-color: #dcfce7;
  color: #166534;
}

.badge--cancelled {
  background-color: #fef2f2;
  color: #b91c1c;
}

.badge--finished {
  background-color: #f3f4f6;
  color: #6b7280;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
}

.row-actions button {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.row-actions button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.row-actions button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.row-actions__delete {
  color: #b91c1c;
}

.row-actions__delete:hover:not(:disabled) {
  background-color: #fef2f2;
}

.row-error {
  margin-top: 0.35rem;
  color: #b91c1c;
  font-size: 0.8rem;
  white-space: normal;
  max-width: 220px;
}
</style>
