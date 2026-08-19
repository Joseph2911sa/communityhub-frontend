<script setup lang="ts">
definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        return navigateTo('/')
      }
    }
  ]
})

const authStore = useAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

interface FieldErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
}

const fieldErrors = ref<FieldErrors>({})
const errorMessage = ref<string | null>(null)

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const profilePicturePreview = ref<string | null>(null)
const profilePictureError = ref<string | null>(null)
let profilePictureFile: File | null = null

function handleProfilePictureChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  profilePictureError.value = null

  if (!file) {
    profilePictureFile = null
    profilePicturePreview.value = null
    return
  }

  const validationError = validateProfilePictureFile(file)
  if (validationError) {
    profilePictureError.value = validationError
    profilePictureFile = null
    profilePicturePreview.value = null
    input.value = ''
    return
  }

  profilePictureFile = file
  profilePicturePreview.value = URL.createObjectURL(file)
}

// Validación en el cliente antes de gastar una llamada al backend.
function validate(): boolean {
  const errors: FieldErrors = {}

  if (!firstName.value.trim()) {
    errors.firstName = 'El nombre es obligatorio.'
  }
  if (!lastName.value.trim()) {
    errors.lastName = 'El apellido es obligatorio.'
  }
  if (!EMAIL_REGEX.test(email.value.trim())) {
    errors.email = 'Ingresa un email válido.'
  }
  if (password.value.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  errorMessage.value = null

  if (!validate()) {
    return
  }

  try {
    // Si el usuario eligió una foto, se convierte a base64 recién acá
    // (no antes) -- así no se gasta tiempo convirtiendo un archivo que
    // después no se llega a enviar por otro error de validación.
    const profilePicture = profilePictureFile
      ? await fileToBase64(profilePictureFile)
      : undefined

    // El registro ya deja la sesión iniciada según responde el backend.
    await authStore.register(
      firstName.value,
      lastName.value,
      email.value,
      password.value,
      profilePicture
    )
    router.push('/')
  } catch (error) {
    errorMessage.value = (error as Error).message
  }
}
</script>

<template>
  <div class="registro">
    <h1>Crear cuenta</h1>

    <form class="form" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="firstName">Nombre</label>
        <input id="firstName" v-model="firstName" type="text" autocomplete="given-name" />
        <p v-if="fieldErrors.firstName" class="field-error">{{ fieldErrors.firstName }}</p>
      </div>

      <div class="field">
        <label for="lastName">Apellido</label>
        <input id="lastName" v-model="lastName" type="text" autocomplete="family-name" />
        <p v-if="fieldErrors.lastName" class="field-error">{{ fieldErrors.lastName }}</p>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" autocomplete="email" />
        <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input id="password" v-model="password" type="password" autocomplete="new-password" />
        <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
      </div>

      <div class="field">
        <label for="profilePicture">Foto de perfil (opcional)</label>
        <img v-if="profilePicturePreview" :src="profilePicturePreview" alt="Vista previa" class="avatar-preview" />
        <input
          id="profilePicture"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          @change="handleProfilePictureChange"
        />
        <p v-if="profilePictureError" class="field-error">{{ profilePictureError }}</p>
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Creando cuenta...' : 'Crear cuenta' }}
      </button>
    </form>

    <p class="switch">
      ¿Ya tienes cuenta?
      <NuxtLink to="/login">Inicia sesión</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.registro {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.registro h1 {
  font-size: 1.5rem;
  color: #111827;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.field input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}

.field input:focus {
  outline: 2px solid #111827;
  outline-offset: 1px;
}

.field-error {
  color: #b91c1c;
  font-size: 0.85rem;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  align-self: flex-start;
  border: 1px solid #e5e7eb;
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
  background-color: #111827;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #1f2937;
}

button[type='submit']:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.switch {
  text-align: center;
  font-size: 0.9rem;
  color: #4b5563;
}
</style>
