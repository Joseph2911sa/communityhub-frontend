export interface Notification {
  _id: string
  message: string
  type: 'reminder' | 'update' | 'system'
  read: boolean
  relatedEvent: { _id: string; title: string; date: string; time: string; location: string } | null
  createdAt: string
}
