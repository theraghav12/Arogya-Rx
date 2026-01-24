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

export interface AlphabetIndexItem {
  letter: string
  count: number
  hasData: boolean
}

export interface MedicinesResponse {
  success: boolean
  message?: string
  count: number
  totalMedicines: number
  totalPages: number
  currentPage: number
  letter?: string
  search?: string
  data: Medicine[]
}

export interface UnifiedSearchResponse {
  success: boolean
  message: string
  query: string
  stats: {
    exactNameMatch: number
    partialNameMatch: number
    formulaMatch: number
    genericMatch: number
  }
  categorizedResults: {
    exactNameMatch: Medicine[]
    partialNameMatch: Medicine[]
    formulaMatch: Medicine[]
    genericMatch: Medicine[]
  }
  allResults: Medicine[]
  pagination: {
    currentPage: number
    totalPages: number
    totalResults: number
    resultsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface FormulaSearchResponse {
  success: boolean
  message: string
  formula: string
  data: Medicine[]
  metadata: {
    totalMedicines: number
    manufacturers: string[]
    manufacturerCount: number
    priceRange: {
      min: number
      max: number
      average: string
    }
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalResults: number
    resultsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface FormulasListResponse {
  success: boolean
  message: string
  data: Array<{
    name: string
    medicineCount: number
  }>
  totalFormulas: number
}

export const medicinesApi = {
  // Get alphabet index with counts
  getAlphabetIndex: async (): Promise<{ success: boolean; data: AlphabetIndexItem[]; totalLetters: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/alphabet-index`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Unified search - Search by name OR formula in single API
  unifiedSearch: async (params: {
    query: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    category?: string
    prescriptionRequired?: boolean
    inStock?: boolean
  }): Promise<UnifiedSearchResponse> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('query', params.query)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params.category) queryParams.append('category', params.category)
      if (params.prescriptionRequired !== undefined) queryParams.append('prescriptionRequired', params.prescriptionRequired.toString())
      if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString())

      const response = await fetch(`${API_BASE_URL}/medicines/search/unified?${queryParams.toString()}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Search by formula/salt
  searchByFormula: async (params: {
    formula: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<FormulaSearchResponse> => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('formula', params.formula)
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      const response = await fetch(`${API_BASE_URL}/medicines/search/by-formula?${queryParams.toString()}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get all available formulas/salts
  getFormulas: async (params?: {
    search?: string
    limit?: number
  }): Promise<FormulasListResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.search) queryParams.append('search', params.search)
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await fetch(`${API_BASE_URL}/medicines/search/formulas?${queryParams.toString()}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get medicines with pagination and filters
  getMedicines: async (params?: {
    page?: number
    limit?: number
    letter?: string
    search?: string
    category?: string
    prescriptionRequired?: boolean
  }): Promise<MedicinesResponse> => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.letter && params.letter !== 'all') queryParams.append('letter', params.letter)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.category) queryParams.append('category', params.category)
      if (params?.prescriptionRequired !== undefined) queryParams.append('prescriptionRequired', params.prescriptionRequired.toString())

      const response = await fetch(`${API_BASE_URL}/medicines?${queryParams.toString()}`)
      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },

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
