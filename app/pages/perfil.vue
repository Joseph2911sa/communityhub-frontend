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

const showPictureInput = ref(false)
const picturePreview = ref<string | null>(null)
const pictureError = ref<string | null>(null)
const pictureLoading = ref(false)

async function handleProfilePictureChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return

  pictureError.value = null

  const validationError = validateProfilePictureFile(file)
  if (validationError) {
    pictureError.value = validationError
    input.value = ''
    return
  }

  picturePreview.value = URL.createObjectURL(file)
  pictureLoading.value = true
  try {
    const profilePicture = await fileToBase64(file)
    // authStore.user se actualiza dentro de updateProfile() si tiene
    // éxito -- no hace falta releer/recargar la página para reflejarlo.
    await authStore.updateProfile({ profilePicture })
    showPictureInput.value = false
  } catch (error) {
    // Cubre tanto el 400 (validación del backend, ej. si por algún
    // motivo pasó la validación de cliente pero no la de allá) como
    // cualquier otro error de la petición.
    pictureError.value = (error as Error).message
  } finally {
    pictureLoading.value = false
    picturePreview.value = null
    input.value = ''
  }
}
</script>

<template>
  <div class="perfil">
    <h1>Mi perfil</h1>

    <div v-if="authStore.user" class="avatar-section">
      <UserAvatar
        :profile-picture="picturePreview ?? authStore.user.profilePicture"
        :full-name="fullName"
        :size="80"
      />
      <div class="avatar-section__actions">
        <button type="button" :disabled="pictureLoading" @click="showPictureInput = !showPictureInput">
          {{ pictureLoading ? 'Guardando...' : 'Cambiar foto' }}
        </button>
        <input
          v-if="showPictureInput"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          :disabled="pictureLoading"
          @change="handleProfilePictureChange"
        />
        <p v-if="pictureError" class="field-error">{{ pictureError }}</p>
      </div>
    </div>

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

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.avatar-section__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-section__actions button {
  align-self: flex-start;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.avatar-section__actions button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.avatar-section__actions button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.field-error {
  color: #b91c1c;
  font-size: 0.85rem;
  max-width: 260px;
}
</style>
