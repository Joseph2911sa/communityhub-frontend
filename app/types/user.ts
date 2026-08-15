export type UserRole = 'user' | 'organizer' | 'admin'

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  profilePicture: string | null
  isActive: boolean
}
