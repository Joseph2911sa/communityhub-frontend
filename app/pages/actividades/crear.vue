<script setup lang="ts">
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

interface CreateEventResponse {
  success: boolean
  message?: string
  data?: { event: { _id: string } }
}

const { apiFetch } = useApi()
const router = useRouter()

const submitLoading = ref(false)
const submitError = ref<string | null>(null)

async function handleSubmit(payload: ActivityFormPayload) {
  submitError.value = null
  submitLoading.value = true
  try {
    const response = await apiFetch<CreateEventResponse>('/events', {
      method: 'POST',
      body: payload
    })
    const id = response.data?.event._id
    if (id) {
      router.push(`/actividades/${id}`)
    }
  } catch (error) {
    submitError.value = (error as Error).message
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <div class="crear">
    <h1>Crear actividad</h1>
    <ActivityForm :loading="submitLoading" :error="submitError" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.crear {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.crear h1 {
  font-size: 1.75rem;
  color: #111827;
}
</style>
