export interface Registration {
  _id: string
  event: {
    _id: string
    title: string
    date: string
    time: string
    location: string
    image?: string | null
    status: string
  }
  status: 'confirmed' | 'cancelled'
}
