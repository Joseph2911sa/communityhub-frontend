<script setup lang="ts">
import type { Event } from '~/types/event'
import type { ActivityFormPayload } from '~/components/ActivityForm.vue'

definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated || authStore.user?.role === 'user') {
        return navigateTo('/mis-actividades')
      }
    }
  ]
})

interface EventDetailResponse {
  success: boolean
  data?: { event: Event; confirmedCount: number; spotsLeft: number }
}

interface UpdateEventResponse {
  success: boolean
  message?: string
  data?: { event: { _id: string } }
}

const route = useRoute()
const router = useRouter()
const eventId = route.params.id as string

const { apiFetch } = useApi()
const authStore = useAuthStore()

const {
  data: eventData,
  pending,
  error
} = await useAsyncData(`editar-actividad-${eventId}`, () =>
  apiFetch<EventDetailResponse>(`/events/${eventId}`)
)

const event = computed(() => eventData.value?.data?.event ?? null)

// El backend ya bloquearía esto con 403, pero es mejor no mostrarle
// siquiera el formulario a quien no es dueño de la actividad.
const canEdit = computed(() => {
  if (!event.value || !authStore.user) return false
  return event.value.organizer._id === authStore.user._id || authStore.user.role === 'admin'
})

const submitLoading = ref(false)
const submitError = ref<string | null>(null)

async function handleSubmit(payload: ActivityFormPayload) {
  submitError.value = null
  submitLoading.value = true
  try {
    await apiFetch<UpdateEventResponse>(`/events/${eventId}`, {
      method: 'PUT',
      body: payload
    })
    router.push(`/actividades/${eventId}`)
  } catch (err) {
    submitError.value = (err as Error).message
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <div class="editar">
    <h1>Editar actividad</h1>

    <p v-if="pending" class="status">Cargando actividad...</p>

    <div v-else-if="error || !event" class="not-found">
      <p>Esta actividad no existe o fue eliminada.</p>
      <NuxtLink to="/mis-actividades">Volver a mis actividades</NuxtLink>
    </div>

    <p v-else-if="!canEdit" class="status">
      No puedes editar una actividad de otro organizador.
    </p>

    <ActivityForm
      v-else
      :event="event"
      :loading="submitLoading"
      :error="submitError"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.editar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editar h1 {
  font-size: 1.75rem;
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
</style>
