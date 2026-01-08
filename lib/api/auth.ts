import { API_BASE_URL, handleApiError } from "../api-config"

export interface RegisterData {
  name: string
  email: string
  password: string
  role: "patient"
  age?: number
  gender?: string
  contact?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export interface LoginData {
  email: string
  password: string
}

export interface PhoneAuthData {
  idToken: string
  name?: string
  email?: string
  role?: "patient"
  age?: number
  gender?: string
  address?: any
}

export const authApi = {
  register: async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (response.ok && result.token) {
        localStorage.setItem("authToken", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
        return { success: true, ...result }
      }

      return { success: false, ...result }
    } catch (error) {
      return handleApiError(error)
    }
  },

  login: async (data: LoginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (response.ok && result.token) {
        localStorage.setItem("authToken", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
        return { success: true, ...result }
      }

      return { success: false, ...result }
    } catch (error) {
      return handleApiError(error)
    }
  },

  phoneVerifyAndLogin: async (idToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/phone-auth/verify-and-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })
      const result = await response.json()

      if (response.ok && result.success) {
        localStorage.setItem("authToken", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      return result
    } catch (error) {
      return handleApiError(error)
    }
  },

  phoneRegister: async (data: PhoneAuthData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/phone-auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      return result
    } catch (error) {
      return handleApiError(error)
    }
  },

  verifyToken: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify/token`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  logout: () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    window.location.href = "/login"
  },
}
