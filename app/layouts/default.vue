<script setup lang="ts">
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()

const canManageEvents = computed(
  () => authStore.user?.role === 'organizer' || authStore.user?.role === 'admin'
)

const notificationsLabel = computed(() => {
  const unread = notificationsStore.unreadCount
  return unread > 0 ? `🔔 Notificaciones (${unread})` : '🔔 Notificaciones'
})

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="layout">
    <OfflineBanner />

    <header class="navbar">
      <NuxtLink to="/" class="navbar__brand">CommunityHub</NuxtLink>

      <nav class="navbar__links">
        <NuxtLink to="/actividades" class="navbar__link">Actividades</NuxtLink>
        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/mis-inscripciones" class="navbar__link">Mis inscripciones</NuxtLink>
          <NuxtLink to="/favoritos" class="navbar__link">Favoritos</NuxtLink>
          <NuxtLink v-if="canManageEvents" to="/mis-actividades" class="navbar__link">
            Mis actividades
          </NuxtLink>
          <NuxtLink to="/perfil" class="navbar__link">Perfil</NuxtLink>
          <NuxtLink to="/notificaciones" class="navbar__link">{{ notificationsLabel }}</NuxtLink>
          <span class="navbar__greeting">Hola, {{ authStore.user?.firstName }}</span>
          <button class="navbar__button" type="button" @click="handleLogout">Cerrar sesión</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="navbar__link">Iniciar sesión</NuxtLink>
          <NuxtLink to="/registro" class="navbar__link navbar__link--primary">Registrarse</NuxtLink>
        </template>
      </nav>
    </header>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #1f2937;
  background-color: #f9fafb;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.navbar__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  text-decoration: none;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__link {
  color: #374151;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.navbar__link:hover {
  background-color: #f3f4f6;
}

.navbar__link--primary {
  background-color: #111827;
  color: #ffffff;
}

.navbar__link--primary:hover {
  background-color: #1f2937;
}

.navbar__greeting {
  font-size: 0.95rem;
  color: #374151;
}

.navbar__button {
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.navbar__button:hover {
  background-color: #f3f4f6;
}

.content {
  flex: 1;
  padding: 2rem;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
}
</style>
