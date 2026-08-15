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
}
