<script lang="ts">
export interface ActivityFormPayload {
  title: string
  description: string
  category: string
  date: string
  time: string
  location: string
  maxCapacity: number
}
</script>

<script setup lang="ts">
import type { Category } from '~/types/category'
import type { Event } from '~/types/event'

const props = defineProps<{
  event?: Event
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  submit: [payload: ActivityFormPayload]
}>()

interface CategoriesResponse {
  success: boolean
  data?: { categories: Category[] }
}

const { apiFetch } = useApi()

const { data: categoriesData } = await useAsyncData('activity-form-categorias', () =>
  apiFetch<CategoriesResponse>('/categories')
)
const categories = computed(() => categoriesData.value?.data?.categories ?? [])

const title = ref(props.event?.title ?? '')
const description = ref(props.event?.description ?? '')
const category = ref(props.event?.category._id ?? '')
const date = ref(props.event ? props.event.date.slice(0, 10) : '')
const time = ref(props.event?.time ?? '')
const location = ref(props.event?.location ?? '')
const maxCapacity = ref(props.event?.maxCapacity ?? 1)

const submitLabel = computed(() => (props.event ? 'Guardar cambios' : 'Crear actividad'))
const loadingLabel = computed(() => (props.event ? 'Guardando...' : 'Creando...'))

interface FieldErrors {
  title?: string
  category?: string
  date?: string
  location?: string
  maxCapacity?: string
}

const fieldErrors = ref<FieldErrors>({})

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function validate(): boolean {
  const errors: FieldErrors = {}

  if (!title.value.trim()) {
    errors.title = 'El título es obligatorio.'
  }
  if (!category.value) {
    errors.category = 'Selecciona una categoría.'
  }
  if (!date.value) {
    errors.date = 'La fecha es obligatoria.'
  } else if (date.value < todayDateString()) {
    errors.date = 'La fecha no puede ser anterior a hoy.'
  }
  if (!location.value.trim()) {
    errors.location = 'La ubicación es obligatoria.'
  }
  if (!Number.isInteger(maxCapacity.value) || maxCapacity.value < 1) {
    errors.maxCapacity = 'La capacidad debe ser un número entero mayor o igual a 1.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) {
    return
  }

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value,
    date: date.value,
    time: time.value,
    location: location.value.trim(),
    maxCapacity: maxCapacity.value
  })
}
</script>

<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="activity-title">Título</label>
      <input id="activity-title" v-model="title" type="text" />
      <p v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</p>
    </div>

    <div class="field">
      <label for="activity-description">Descripción</label>
      <textarea id="activity-description" v-model="description" rows="4" />
    </div>

    <div class="field">
      <label for="activity-category">Categoría</label>
      <select id="activity-category" v-model="category">
        <option value="">Selecciona una categoría</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
      </select>
      <p v-if="fieldErrors.category" class="field-error">{{ fieldErrors.category }}</p>
    </div>

    <div class="field-row">
      <div class="field">
        <label for="activity-date">Fecha</label>
        <input id="activity-date" v-model="date" type="date" />
        <p v-if="fieldErrors.date" class="field-error">{{ fieldErrors.date }}</p>
      </div>

      <div class="field">
        <label for="activity-time">Hora</label>
        <input id="activity-time" v-model="time" type="time" required />
      </div>
    </div>

    <div class="field">
      <label for="activity-location">Ubicación</label>
      <input id="activity-location" v-model="location" type="text" />
      <p v-if="fieldErrors.location" class="field-error">{{ fieldErrors.location }}</p>
    </div>

    <div class="field">
      <label for="activity-capacity">Capacidad máxima</label>
      <input id="activity-capacity" v-model.number="maxCapacity" type="number" min="1" step="1" />
      <p v-if="fieldErrors.maxCapacity" class="field-error">{{ fieldErrors.maxCapacity }}</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button type="submit" :disabled="loading">
      {{ loading ? loadingLabel : submitLabel }}
    </button>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.field-row .field {
  flex: 1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.field input,
.field select,
.field textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: 2px solid #111827;
  outline-offset: 1px;
}

.field-error {
  color: #b91c1c;
  font-size: 0.85rem;
}

.error {
  color: #b91c1c;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
}

button[type='submit'] {
  padding: 0.65rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: var(--color-accent);
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  align-self: flex-start;
}

button[type='submit']:hover:not(:disabled) {
  filter: brightness(0.92);
}

button[type='submit']:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>
