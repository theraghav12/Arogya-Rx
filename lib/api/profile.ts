import { API_BASE_URL, getAuthHeaders, handleApiError } from "../api-config"

export interface Address {
  _id: string
  type: "home" | "work" | "other"
  label: string
  fullName: string
  phoneNumber: string
  street: string
  landmark?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
  deliveryInstructions?: string
  createdAt: string
}

export const profileApi = {
  get: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  update: async (data: {
    firstName?: string
    lastName?: string
    dob?: string
    email?: string
    contact?: string
    gender?: string
    address?: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  getAddresses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  addAddress: async (data: {
    type: string
    label: string
    fullName: string
    phoneNumber: string
    street: string
    landmark?: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault?: boolean
    deliveryInstructions?: string
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  updateAddress: async (addressId: string, data: Partial<any>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  deleteAddress: async (addressId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  setDefaultAddress: async (addressId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}/default`, {
        method: "PUT",
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  getDefaultAddress: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/default`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  uploadProfileImage: async (imageFile: File) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      const formData = new FormData()
      formData.append("profileImage", imageFile)

      const response = await fetch(`${API_BASE_URL}/profile/image`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  deleteProfileImage: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/image`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },
}
