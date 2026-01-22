import { API_BASE_URL, getAuthHeaders, handleApiError } from "../api-config"

export interface Medicine {
  _id: string
  itemID?: string
  itemCode?: string
  productName: string
  genericName: string
  brandName: string
  manufacturer: string
  category: string
  prescriptionRequired: boolean
  composition: {
    activeIngredients: Array<{
      name: string
      strength: string
    }> | string[]
    inactiveIngredients?: string[]
  }
  dosage: {
    form: string
    strength: string
    route?: string
    frequency?: string
    recommendedDosage?: string
  }
  pricing: {
    mrp: number
    rate?: number
    sellingPrice: number
    discount: number
    addLess?: number
    gst?: number
  }
  stock: {
    available?: boolean
    quantity: number
    unit?: string
    minOrderQuantity?: number
    maxOrderQuantity?: number
    lowStockThreshold?: number
    inStock?: boolean
  }
  tax?: {
    hsnCode: string
    hsnName: string
    localTax?: number
    sgst: number
    cgst: number
    centralTax?: number
    igst: number
    oldTax?: number
    taxDiff?: number
  }
  packaging: {
    packSize: string
    packType?: string
    expiryDate: string
    storageInstructions?: string
  }
  regulatory?: {
    drugType?: string
    drugLicenseNumber?: string
    scheduleType?: string
    sideEffects?: string[]
    warnings?: string[]
    contraindications?: string[]
    interactions?: string[]
  }
  images: string[]
  description: string
  usageInstructions?: string
  sideEffects?: string
  warnings?: string
  contraindications?: string
  storageConditions?: string
  additionalFeatures?: {
    alternativeMedicines?: any[]
    userReviews?: any[]
    faqs?: any[]
    doctorAdvice?: string
    fastActing?: boolean
    sugarFree?: boolean
    glutenFree?: boolean
  }
  totalSold?: number
  totalViews?: number
  lastSoldAt?: string
  lastViewedAt?: string
  createdAt: string
  updatedAt: string
}

export const medicinesApi = {
  getAll: async (params?: { category?: string; prescriptionRequired?: boolean }) => {
    try {
      const queryString = new URLSearchParams(params as any).toString()
      const response = await fetch(`${API_BASE_URL}/medicines?${queryString}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  getAllWithSort: async (sortBy: string = "newest") => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/public?sortBy=${sortBy}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  getById: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  searchByName: async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/name/${encodeURIComponent(name)}`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  searchByGeneric: async (genericName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/generic/${encodeURIComponent(genericName)}`, {
        headers: getAuthHeaders(),
      })
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  checkPrescription: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/check-prescription/${id}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  getByCategory: async (category: string, params?: { page?: number; limit?: number }) => {
    try {
      const queryString = new URLSearchParams({ category, ...params } as any).toString()
      const response = await fetch(`${API_BASE_URL}/medicines?${queryString}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },
}
