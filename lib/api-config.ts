import { isTokenExpired, clearAuth } from "./auth-utils"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  
  // Check if token is expired before using it
  if (token && isTokenExpired(token)) {
    // Clear expired token and dispatch event
    clearAuth()
    
    if (typeof window !== "undefined") {
      const logoutEvent = new CustomEvent("token-expired", {
        detail: { 
          message: "Your session has expired. Please login again.",
          reason: "token_expired_on_request"
        }
      })
      window.dispatchEvent(logoutEvent)
    }
    
    return {
      "Content-Type": "application/json",
    }
  }
  
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const handleApiError = (error: any) => {
  console.error("[API Error]:", error)
  
  // Check if it's an authentication error (token expired or invalid)
  if (error?.status === 401 || error?.response?.status === 401) {
    // Clear auth data
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Dispatch custom event for logout
      const logoutEvent = new CustomEvent("token-expired", {
        detail: { 
          message: "Your session has expired. Please login again.",
          reason: "token_expired"
        }
      })
      window.dispatchEvent(logoutEvent)
    }
  }
  
  throw error
}

