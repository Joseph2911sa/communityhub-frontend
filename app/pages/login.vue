<script setup lang="ts">
definePageMeta({
  // Si ya hay sesión activa, no tiene sentido mostrar el formulario.
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

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)

async function handleSubmit() {
  errorMessage.value = null
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    errorMessage.value = (error as Error).message
  }
}
</script>

<template>
  <div class="login">
    <h1>Iniciar sesión</h1>

    <form class="form" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" />
      </div>

      <div class="field">
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
      </button>
    </form>

    <p class="switch">
      ¿No tienes cuenta?
      <NuxtLink to="/registro">Regístrate</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login h1 {
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
