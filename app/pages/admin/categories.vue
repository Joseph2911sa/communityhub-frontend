<script setup lang="ts">
import type { Category } from '~/types/category'

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

interface CategoriesResponse {
  success: boolean
  data?: { categories: Category[] }
}

interface CategoryResponse {
  success: boolean
  message?: string
  data?: { category: Category }
}

const { apiFetch } = useApi()

const { data, pending } = await useAsyncData('admin-categories', () =>
  apiFetch<CategoriesResponse>('/categories')
)

const categories = ref<Category[]>([])
watch(
  data,
  (value) => {
    categories.value = value?.data?.categories ?? []
  },
  { immediate: true }
)

const newName = ref('')
const newDescription = ref('')
const createLoading = ref(false)
const createError = ref<string | null>(null)

async function handleCreate() {
  createError.value = null
  createLoading.value = true
  try {
    const response = await apiFetch<CategoryResponse>('/categories', {
      method: 'POST',
      body: { name: newName.value.trim(), description: newDescription.value.trim() }
    })
    if (response.data) {
      categories.value.push(response.data.category)
    }
    newName.value = ''
    newDescription.value = ''
  } catch (error) {
    createError.value = (error as Error).message
  } finally {
    createLoading.value = false
  }
}

const rowLoadingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const rowErrors = ref<Record<string, string>>({})

function isRowBusy(id: string): boolean {
  return rowLoadingId.value === id || deletingId.value === id
}

async function handleFieldBlur(category: Category, field: 'name' | 'description', event: Event) {
  const input = event.target as HTMLInputElement
  const newValue = input.value
  const originalValue = category[field] ?? ''
  if (newValue === originalValue) return

  delete rowErrors.value[category._id]
  rowLoadingId.value = category._id
  try {
    await apiFetch(`/categories/${category._id}`, {
      method: 'PUT',
      body: { [field]: newValue }
    })
    category[field] = newValue
  } catch (error) {
    // No se toca category[field]: al no cambiar, el :value del input
    // vuelve a mostrar el valor real en el próximo render.
    rowErrors.value[category._id] = (error as Error).message
  } finally {
    rowLoadingId.value = null
  }
}

async function handleDelete(category: Category) {
  const confirmed = confirm(`¿Eliminar la categoría "${category.name}"?`)
  if (!confirmed) return

  delete rowErrors.value[category._id]
  deletingId.value = category._id
  try {
    await apiFetch(`/categories/${category._id}`, { method: 'DELETE' })
    categories.value = categories.value.filter((c) => c._id !== category._id)
  } catch (error) {
    // Incluye el 409 de "tiene actividades asociadas" tal cual lo
    // manda el backend — es información útil, no un fallo genérico.
    rowErrors.value[category._id] = (error as Error).message
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="admin-categories">
    <h1>Categorías</h1>

    <form class="create-form" @submit.prevent="handleCreate">
      <div class="create-form__field">
        <label for="new-category-name">Nombre</label>
        <input id="new-category-name" v-model="newName" type="text" required :disabled="createLoading" />
      </div>
      <div class="create-form__field">
        <label for="new-category-description">Descripción</label>
        <input
          id="new-category-description"
          v-model="newDescription"
          type="text"
          :disabled="createLoading"
        />
      </div>
      <button type="submit" :disabled="createLoading">
        {{ createLoading ? 'Creando...' : 'Crear categoría' }}
      </button>
      <p v-if="createError" class="create-form__error">{{ createError }}</p>
    </form>

    <p v-if="pending" class="status">Cargando categorías...</p>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category._id">
            <td>
              <input
                type="text"
                :value="category.name"
                :disabled="isRowBusy(category._id)"
                @blur="handleFieldBlur(category, 'name', $event)"
              />
            </td>
            <td>
              <input
                type="text"
                :value="category.description ?? ''"
                :disabled="isRowBusy(category._id)"
                @blur="handleFieldBlur(category, 'description', $event)"
              />
            </td>
            <td>
              <button
                type="button"
                :disabled="isRowBusy(category._id)"
                @click="handleDelete(category)"
              >
                {{ deletingId === category._id ? 'Eliminando...' : 'Eliminar' }}
              </button>
              <p v-if="rowErrors[category._id]" class="row-error">{{ rowErrors[category._id] }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-categories {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-categories h1 {
  font-size: 1.75rem;
  color: #111827;
}

.create-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.create-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.create-form__field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.create-form__field input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  min-width: 200px;
}

.create-form button {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: #111827;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.create-form button:hover:not(:disabled) {
  background-color: #1f2937;
}

.create-form button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.create-form__error {
  flex-basis: 100%;
  color: #b91c1c;
  font-size: 0.85rem;
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
}

th {
  color: #6b7280;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

tbody tr:not(:last-child) td {
  border-bottom: 1px solid #f3f4f6;
}

td input {
  width: 100%;
  min-width: 160px;
  padding: 0.4rem 0.6rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: transparent;
}

td input:hover:not(:disabled) {
  border-color: #d1d5db;
}

td input:focus {
  outline: none;
  border-color: #111827;
  background-color: #ffffff;
}

td input:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

td button {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #b91c1c;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

td button:hover:not(:disabled) {
  background-color: #fef2f2;
}

td button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.row-error {
  margin-top: 0.35rem;
  color: #b91c1c;
  font-size: 0.8rem;
  white-space: normal;
  max-width: 260px;
}
</style>
