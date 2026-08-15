export interface Event {
  _id: string
  title: string
  description?: string
  category: { _id: string; name: string } // populado por el backend
  date: string // ISO string
  time: string
  location: string
  maxCapacity: number
  image?: string | null
  organizer: { _id: string; firstName: string; lastName: string; email: string }
  status: 'active' | 'cancelled' | 'finished'
  // Solo vienen poblados en la respuesta de GET /events/:id (detalle),
  // el listado (GET /events) no los incluye.
  confirmedCount?: number
  spotsLeft?: number
}
