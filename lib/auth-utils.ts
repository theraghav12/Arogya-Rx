export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
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

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true
  
  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Check if token has expired
    return payload.exp && payload.exp < currentTime
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true
  }
}

export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  if (!token) return false
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Clear expired token
    clearAuth()
    return false
  }
  
  return true
}

export const clearAuth = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

