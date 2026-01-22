export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

export const getUser = (): any | null => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user: any) => {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export const updateUserProfile = (updates: any) => {
  if (typeof window === "undefined") return
  const user = getUser()
  if (user) {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
  }
}

export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

export const clearAuth = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("authToken")
  localStorage.removeItem("user")
}
