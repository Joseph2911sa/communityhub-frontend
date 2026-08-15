<script setup lang="ts">
import type { Category } from '~/types/category'
import type { Event } from '~/types/event'

interface CategoriesResponse {
  success: boolean
  data?: { categories: Category[] }
}

interface EventsResponse {
  success: boolean
  data?: { events: Event[] }
}

const { apiFetch } = useApi()

const selectedCategory = ref('')
const searchText = ref('')
const onlyAvailable = ref(false)

const { data: categoriesData } = await useAsyncData('actividades-categorias', () =>
  apiFetch<CategoriesResponse>('/categories')
)
const categories = computed(() => categoriesData.value?.data?.categories ?? [])

const { data: eventsData, pending } = await useAsyncData(
  'actividades-eventos',
  () =>
    apiFetch<EventsResponse>('/events', {
      query: {
        category: selectedCategory.value || undefined,
        q: searchText.value.trim() || undefined,
        available: onlyAvailable.value ? true : undefined
      }
    }),
  { watch: [selectedCategory, searchText, onlyAvailable] }
)
const events = computed(() => eventsData.value?.data?.events ?? [])
</script>

<template>
  <div class="actividades">
    <h1>Actividades</h1>

    <div class="filters">
      <div class="filters__field">
        <label for="filter-category">Categoría</label>
        <select id="filter-category" v-model="selectedCategory">
          <option value="">Todas</option>
          <option v-for="category in categories" :key="category._id" :value="category._id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="filters__field">
        <label for="filter-search">Buscar</label>
        <input
          id="filter-search"
          v-model="searchText"
          type="text"
          placeholder="Buscar por título..."
        />
      </div>

      <label class="filters__checkbox">
        <input v-model="onlyAvailable" type="checkbox" />
        Solo actividades disponibles
      </label>
    </div>

    <p v-if="pending" class="status">Cargando actividades...</p>

    <template v-else>
      <p v-if="events.length === 0" class="status">
        No se encontraron actividades con esos filtros.
      </p>

      <div v-else class="grid">
        <EventCard v-for="event in events" :key="event._id" :event="event" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.actividades {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actividades h1 {
  font-size: 1.75rem;
  color: #111827;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.25rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filters__field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.filters__field select,
.filters__field input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  min-width: 200px;
}

.filters__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  padding-bottom: 0.4rem;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
</style>
