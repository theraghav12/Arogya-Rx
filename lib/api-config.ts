export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const handleApiError = (error: any) => {
  console.error("[v0] API Error:", error)
  if (error.status === 401) {
    // Token expired or invalid
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }
  throw error
}
