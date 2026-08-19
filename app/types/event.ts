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
  // Vienen poblados en GET /events/:id (detalle) y en GET /events con
  // ?organizer=<id> (confirmado contra el backend real). El listado
  // general sin filtrar por organizador no los incluye, de ahí que
  // sigan siendo opcionales acá.
  confirmedCount?: number
  spotsLeft?: number
}
