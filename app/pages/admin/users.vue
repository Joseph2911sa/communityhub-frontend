<script setup lang="ts">
import type { User, UserRole } from '~/types/user'

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

interface UsersResponse {
  success: boolean
  data?: { users: User[] }
}

const { apiFetch } = useApi()
const authStore = useAuthStore()

const { data, pending } = await useAsyncData('admin-users', () => apiFetch<UsersResponse>('/users'))

const users = ref<User[]>([])
watch(
  data,
  (value) => {
    users.value = value?.data?.users ?? []
  },
  { immediate: true }
)

const roleLabels: Record<UserRole, string> = {
  user: 'Usuario',
  organizer: 'Organizador',
  admin: 'Administrador'
}

const registeredAtFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

function isSelf(user: User): boolean {
  return user._id === authStore.user?._id
}

const roleLoadingId = ref<string | null>(null)
const statusLoadingId = ref<string | null>(null)
const rowErrors = ref<Record<string, string>>({})

async function handleRoleChange(user: User, event: Event) {
  const select = event.target as HTMLSelectElement
  const newRole = select.value as UserRole

  delete rowErrors.value[user._id]
  roleLoadingId.value = user._id
  try {
    await apiFetch(`/users/${user._id}`, { method: 'PUT', body: { role: newRole } })
    user.role = newRole
  } catch (error) {
    // No se toca user.role: al no cambiar, el :value del select vuelve
    // a mostrar el valor real en el próximo render (revierte solo).
    rowErrors.value[user._id] = (error as Error).message
  } finally {
    roleLoadingId.value = null
  }
}

async function handleToggleActive(user: User) {
  if (user.isActive) {
    const confirmed = confirm(`¿Desactivar la cuenta de ${user.firstName} ${user.lastName}?`)
    if (!confirmed) return
  }

  const newActive = !user.isActive
  delete rowErrors.value[user._id]
  statusLoadingId.value = user._id
  try {
    await apiFetch(`/users/${user._id}`, { method: 'PUT', body: { isActive: newActive } })
    user.isActive = newActive
  } catch (error) {
    rowErrors.value[user._id] = (error as Error).message
  } finally {
    statusLoadingId.value = null
  }
}
</script>

<template>
  <div class="admin-users">
    <h1>Usuarios</h1>

    <p v-if="pending" class="status">Cargando usuarios...</p>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>
              {{ user.firstName }} {{ user.lastName }}
              <span v-if="isSelf(user)" class="self-note">(Tu cuenta)</span>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span v-if="isSelf(user)">{{ roleLabels[user.role] }}</span>
              <select
                v-else
                :value="user.role"
                :disabled="roleLoadingId === user._id"
                @change="handleRoleChange(user, $event)"
              >
                <option value="user">Usuario</option>
                <option value="organizer">Organizador</option>
                <option value="admin">Administrador</option>
              </select>
            </td>
            <td>
              <span class="badge" :class="user.isActive ? 'badge--active' : 'badge--inactive'">
                {{ user.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>{{ registeredAtFormatter.format(new Date(user.createdAt)) }}</td>
            <td>
              <button
                v-if="!isSelf(user)"
                type="button"
                :disabled="statusLoadingId === user._id"
                @click="handleToggleActive(user)"
              >
                {{ user.isActive ? 'Desactivar' : 'Activar' }}
              </button>
              <p v-if="rowErrors[user._id]" class="row-error">{{ rowErrors[user._id] }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-users {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-users h1 {
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

.self-note {
  color: #6b7280;
  font-size: 0.8rem;
}

select {
  padding: 0.35rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

select:disabled {
  color: #9ca3af;
  cursor: not-allowed;
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

.badge--inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

td button {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

td button:hover:not(:disabled) {
  background-color: #f3f4f6;
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
  max-width: 220px;
}
</style>
