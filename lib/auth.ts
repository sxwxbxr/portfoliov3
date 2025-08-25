export interface User {
  id: string
  email: string
  name: string
  role: "admin"
  avatar: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Simple authentication functions (in production, use proper auth service)
const ADMIN_USER = {
  id: "1",
  email: "admin@seyaweber.com",
  password: "admin123", // In production, use a secure auth service
  name: "Seya Weber",
  role: "admin" as const,
  avatar: "/professional-headshot.png",
}

export const authenticateUser = (email: string, password: string): User | null => {
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    const { password: _pw, ...user } = ADMIN_USER
    return user
  }
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("currentUser")
  return userStr ? JSON.parse(userStr) : null
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

export const logout = (): void => {
  setCurrentUser(null)
}

export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}
