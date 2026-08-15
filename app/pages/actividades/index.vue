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
        <article v-for="event in events" :key="event._id" class="card">
          <h2 class="card__title">{{ event.title }}</h2>
          <p class="card__category">{{ event.category.name }}</p>

          <dl class="card__details">
            <div class="card__row">
              <dt>Fecha</dt>
              <dd>{{ formatEventDateTime(event.date) }}</dd>
            </div>
            <div class="card__row">
              <dt>Lugar</dt>
              <dd>{{ event.location }}</dd>
            </div>
            <div class="card__row">
              <dt>Capacidad</dt>
              <dd>{{ event.maxCapacity }} personas</dd>
            </div>
            <div class="card__row">
              <dt>Organiza</dt>
              <dd>{{ event.organizer.firstName }} {{ event.organizer.lastName }}</dd>
            </div>
          </dl>

          <NuxtLink :to="`/actividades/${event._id}`" class="card__link">Ver detalle</NuxtLink>
        </article>
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

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.card__title {
  font-size: 1.15rem;
  color: #111827;
}

.card__category {
  display: inline-block;
  align-self: flex-start;
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
  background-color: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.card__details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
}

.card__row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.card__row dt {
  color: #6b7280;
}

.card__row dd {
  margin: 0;
  color: #1f2937;
  text-align: right;
}

.card__link {
  margin-top: auto;
  align-self: flex-start;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
}

.card__link:hover {
  color: #1f2937;
}
</style>
