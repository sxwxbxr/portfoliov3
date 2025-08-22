import { users } from "../src/config"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  avatar: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Simple authentication functions (in production, use proper auth service)
export const authenticateUser = (email: string, password: string): User | null => {
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    }
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
