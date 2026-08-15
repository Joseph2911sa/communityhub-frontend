import type { Notification } from '~/types/notification'

interface NotificationsResponse {
  success: boolean
  data?: {
    notifications: Notification[]
    unreadCount: number
  }
}

interface MarkAsReadResponse {
  success: boolean
  message?: string
  data?: {
    notification: Notification
  }
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)

  async function fetchNotifications() {
    const { apiFetch } = useApi()
    const response = await apiFetch<NotificationsResponse>('/users/me/notifications')
    if (response.data) {
      notifications.value = response.data.notifications
      unreadCount.value = response.data.unreadCount
    }
    return response
  }

  async function markAsRead(id: string) {
    const { apiFetch } = useApi()
    const response = await apiFetch<MarkAsReadResponse>(`/users/me/notifications/${id}/read`, {
      method: 'PATCH'
    })

    // Se actualiza localmente en vez de volver a pedir toda la lista.
    const notification = notifications.value.find((n) => n._id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    return response
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead
  }
})
