export interface Favorite {
  _id: string
  event: {
    _id: string
    title: string
    date: string
    time: string
    location: string
    maxCapacity?: number
    image?: string | null
    status: string
  }
}
