<script setup lang="ts">
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

const notificationsStore = useNotificationsStore()

// Ya se cargaron en app/plugins/auth.ts al iniciar la app (junto con la
// sesión, para que no haya hydration mismatch en el badge). Si por lo
// que sea todavía no hay nada en el store (ej. se navegó directo a esta
// página en un estado raro), las pedimos acá.
const pending = ref(false)
if (notificationsStore.notifications.length === 0) {
  pending.value = true
  await notificationsStore.fetchNotifications()
  pending.value = false
}

// Cada timestamp es un instante real (no una hora "de pared" de
// evento), así que se formatea en la zona horaria local de quien lo ve.
const createdAtFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
})

function formatCreatedAt(dateIso: string): string {
  return createdAtFormatter.format(new Date(dateIso))
}

const markingId = ref<string | null>(null)
const markError = ref<string | null>(null)

async function handleMarkAsRead(id: string) {
  markError.value = null
  markingId.value = id
  try {
    await notificationsStore.markAsRead(id)
  } catch (error) {
    markError.value = (error as Error).message
  } finally {
    markingId.value = null
  }
}
</script>

<template>
  <div class="notificaciones">
    <h1>Notificaciones</h1>

    <p v-if="pending" class="status">Cargando notificaciones...</p>

    <template v-else>
      <p v-if="notificationsStore.notifications.length === 0" class="status">
        No tienes notificaciones todavía.
      </p>

      <ul v-else class="list">
        <li
          v-for="notification in notificationsStore.notifications"
          :key="notification._id"
          class="item"
          :class="{ 'item--unread': !notification.read }"
        >
          <span v-if="!notification.read" class="item__dot" aria-hidden="true" />

          <div class="item__body">
            <p class="item__message">{{ notification.message }}</p>
            <p class="item__meta">{{ formatCreatedAt(notification.createdAt) }}</p>

            <NuxtLink
              v-if="notification.relatedEvent"
              :to="`/actividades/${notification.relatedEvent._id}`"
              class="item__link"
            >
              Ver actividad: {{ notification.relatedEvent.title }}
            </NuxtLink>
          </div>

          <button
            v-if="!notification.read"
            type="button"
            :disabled="markingId === notification._id"
            @click="handleMarkAsRead(notification._id)"
          >
            {{ markingId === notification._id ? 'Marcando...' : 'Marcar como leída' }}
          </button>
        </li>
      </ul>

      <p v-if="markError" class="error">{{ markError }}</p>
    </template>
  </div>
</template>

<style scoped>
.notificaciones {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
}

.notificaciones h1 {
  font-size: 1.75rem;
  color: #111827;
}

.status {
  color: #4b5563;
  font-size: 0.95rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.item--unread {
  background-color: #eff6ff;
  border-color: #bfdbfe;
}

.item__dot {
  flex-shrink: 0;
  margin-top: 0.4rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: #2563eb;
}

.item__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item__message {
  color: #1f2937;
  line-height: 1.5;
}

.item__meta {
  color: #6b7280;
  font-size: 0.85rem;
}

.item__link {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  border-bottom: 1px solid #111827;
  margin-top: 0.25rem;
}

.item__link:hover {
  color: #1f2937;
}

.item button {
  flex-shrink: 0;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.item button:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.item button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.error {
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
