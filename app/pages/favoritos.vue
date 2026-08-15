<script setup lang="ts">
import type { Favorite } from '~/types/favorite'

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

interface FavoritesResponse {
  success: boolean
  data?: { favorites: Favorite[] }
}

const { apiFetch } = useApi()

const { data, pending } = await useAsyncData('favoritos', () =>
  apiFetch<FavoritesResponse>('/users/me/favorites')
)

const favorites = ref<Favorite[]>([])
watch(
  data,
  (value) => {
    favorites.value = value?.data?.favorites ?? []
  },
  { immediate: true }
)

const removingId = ref<string | null>(null)
const removeError = ref<string | null>(null)

async function handleRemove(favorite: Favorite) {
  removeError.value = null
  removingId.value = favorite._id
  try {
    await apiFetch(`/events/${favorite.event._id}/favorite`, { method: 'DELETE' })
    favorites.value = favorites.value.filter((f) => f._id !== favorite._id)
  } catch (error) {
    removeError.value = (error as Error).message
  } finally {
    removingId.value = null
  }
}
</script>

<template>
  <div class="favoritos">
    <h1>Favoritos</h1>

    <p v-if="pending" class="status">Cargando tus favoritos...</p>

    <template v-else>
      <p v-if="favorites.length === 0" class="status">
        Todavía no tienes actividades favoritas.
        <NuxtLink to="/actividades">Explorar actividades</NuxtLink>
      </p>

      <div v-else class="grid">
        <EventCard v-for="favorite in favorites" :key="favorite._id" :event="favorite.event">
          <template #actions>
            <button
              type="button"
              :disabled="removingId === favorite._id"
              @click="handleRemove(favorite)"
            >
              {{ removingId === favorite._id ? 'Quitando...' : '★ Quitar de favoritos' }}
            </button>
          </template>
        </EventCard>
      </div>

      <p v-if="removeError" class="error">{{ removeError }}</p>
    </template>
  </div>
</template>

<style scoped>
.favoritos {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.favoritos h1 {
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

.grid button {
  padding: 0.5rem 0.9rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.grid button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.grid button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
