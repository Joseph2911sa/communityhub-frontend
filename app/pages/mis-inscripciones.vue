<script setup lang="ts">
import type { Registration } from '~/types/registration'

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

const { apiFetch } = useApi()

const { data, pending } = await useAsyncData('mis-inscripciones', () =>
  apiFetch<RegistrationsResponse>('/users/me/registrations')
)

const registrations = ref<Registration[]>([])
watch(
  data,
  (value) => {
    registrations.value = value?.data?.registrations ?? []
  },
  { immediate: true }
)

const cancelingId = ref<string | null>(null)
const cancelError = ref<string | null>(null)

async function handleCancel(registration: Registration) {
  cancelError.value = null
  cancelingId.value = registration._id
  try {
    await apiFetch(`/events/${registration.event._id}/register`, { method: 'DELETE' })
    registration.status = 'cancelled'
  } catch (error) {
    cancelError.value = (error as Error).message
  } finally {
    cancelingId.value = null
  }
}
</script>

<template>
  <div class="mis-inscripciones">
    <h1>Mis inscripciones</h1>

    <p v-if="pending" class="status">Cargando tus inscripciones...</p>

    <template v-else>
      <p v-if="registrations.length === 0" class="status">
        Todavía no te has inscrito a ninguna actividad.
        <NuxtLink to="/actividades">Explorar actividades</NuxtLink>
      </p>

      <div v-else class="grid">
        <EventCard v-for="registration in registrations" :key="registration._id" :event="registration.event">
          <template #actions>
            <div class="actions">
              <span
                class="badge"
                :class="registration.status === 'confirmed' ? 'badge--confirmed' : 'badge--cancelled'"
              >
                {{ registration.status === 'confirmed' ? 'Confirmada' : 'Cancelada' }}
              </span>

              <button
                v-if="registration.status === 'confirmed'"
                type="button"
                :disabled="cancelingId === registration._id"
                @click="handleCancel(registration)"
              >
                {{ cancelingId === registration._id ? 'Cancelando...' : 'Cancelar inscripción' }}
              </button>
            </div>
          </template>
        </EventCard>
      </div>

      <p v-if="cancelError" class="error">{{ cancelError }}</p>
    </template>
  </div>
</template>

<style scoped>
.mis-inscripciones {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mis-inscripciones h1 {
  font-size: 1.75rem;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.badge--confirmed {
  background-color: #dcfce7;
  color: #166534;
}

.badge--cancelled {
  background-color: #f3f4f6;
  color: #6b7280;
}

.actions button {
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.actions button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.actions button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
