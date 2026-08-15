<script setup lang="ts">
import type { UserRole } from '~/types/user'

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

const authStore = useAuthStore()

const roleLabels: Record<UserRole, string> = {
  user: 'Usuario',
  organizer: 'Organizador',
  admin: 'Administrador'
}

// A diferencia de las fechas de evento (que se muestran en UTC porque
// representan una hora "de pared" fija), createdAt es un instante real,
// así que acá sí se formatea en la zona horaria local de quien lo ve.
const registeredAtFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const fullName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName} ${user.lastName}` : ''
})

const roleLabel = computed(() => {
  const role = authStore.user?.role
  return role ? roleLabels[role] : ''
})

const registeredAt = computed(() => {
  const createdAt = authStore.user?.createdAt
  return createdAt ? registeredAtFormatter.format(new Date(createdAt)) : ''
})
</script>

<template>
  <div class="perfil">
    <h1>Mi perfil</h1>

    <dl v-if="authStore.user" class="details">
      <div class="details__row">
        <dt>Nombre</dt>
        <dd>{{ fullName }}</dd>
      </div>
      <div class="details__row">
        <dt>Correo</dt>
        <dd>{{ authStore.user.email }}</dd>
      </div>
      <div class="details__row">
        <dt>Rol</dt>
        <dd>{{ roleLabel }}</dd>
      </div>
      <div class="details__row">
        <dt>Miembro desde</dt>
        <dd>{{ registeredAt }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.perfil {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 480px;
}

.perfil h1 {
  font-size: 1.75rem;
  color: #111827;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.details__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
}

.details__row dt {
  color: #6b7280;
}

.details__row dd {
  margin: 0;
  color: #1f2937;
  font-weight: 600;
}
</style>
