import { API_BASE_URL, getAuthHeaders, handleApiError } from '../api-config'

// Types based on actual API response
export interface ReturnItem {
  productType: 'medicine' | 'categoryProduct'
  medicineId?: string
  categoryProductId?: string
  batchNumber: string
  returnQuantity: number
  unitBilled?: string
  unitConversion?: number
  returnReason: string
}

export interface CreateReturnRequest {
  originalOrderId: string
  items: ReturnItem[]
}

export interface SalesReturn {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone: string
  }
  originalOrderId: {
    _id: string
    orderNumber: string
    orderedAt: string
    totalAmount: number
    items?: Array<{
      medicineId?: string
      categoryProductId?: string
      price: number
      quantity: number
      cgstAmount: number
      sgstAmount: number
      igstAmount: number
    }>
  }
  returnNumber: string
  items: Array<{
    productType: string
    medicineId?: {
      _id: string
      productName: string
      itemCode: string
      manufacturer?: string
      category?: string
    }
    categoryProductId?: {
      _id: string
      productName: string
      itemCode: string
    }
    batchNumber: string
    returnQuantity: number
    unitBilled: string
    unitConversion: number
    returnReason: string
    unitPriceAtSale: number
    taxAmountAtSale: number
    _id?: string
  }>
  totalReturnAmount: number
  status: 'Requested' | 'In Transit' | 'Received' | 'QC Completed' | 'Rejected'
  qcStatus: 'Pending' | 'Passed (Restockable)' | 'Failed (Scrap)' | 'Rejected'
  creditNoteIssued: boolean
  creditNoteId?: string
  approvalRemarks?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface ReturnsResponse {
  success: boolean
  total: number
  totalPages: number
  currentPage: number
  data: SalesReturn[]
}

export interface SingleReturnResponse {
  success: boolean
  data: SalesReturn
}

export interface CreateReturnResponse {
  success: boolean
  message: string
  data: SalesReturn
}

export const returnsApi = {
  // Create a new sales return
  async createReturn(data: CreateReturnRequest): Promise<CreateReturnResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/returns/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to create return')
      }

      return result
    } catch (error) {
      handleApiError(error)
      throw error
    }
  },

  // Get user's sales returns with filters
  async getReturns(filters: {
    status?: string
    qcStatus?: string
    fromDate?: string
    toDate?: string
    page?: number
    limit?: number
  } = {}): Promise<ReturnsResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })

      const url = `${API_BASE_URL}/returns/sales${queryParams.toString() ? `?${queryParams}` : ''}`
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch returns')
      }

      return result
    } catch (error) {
      handleApiError(error)
      throw error
    }
  },

  // Get single return details
  async getReturnById(returnId: string): Promise<SingleReturnResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/returns/sales/${returnId}`, {
        headers: getAuthHeaders(),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to fetch return details')
      }

      return result
    } catch (error) {
      handleApiError(error)
      throw error
    }
  }
}

// Utility functions
export const returnUtils = {
  // Check if order is eligible for return (within 48 hours)
  isReturnEligible(orderDate: string): boolean {
    const orderTime = new Date(orderDate).getTime()
    const currentTime = new Date().getTime()
    const timeDiff = currentTime - orderTime
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    return hoursDiff <= 48
  },

  // Check if order can be returned (completed status + within time limit)
  canReturnOrder(orderStatus: string, deliveryStatus: string, orderDate: string): boolean {
    const isCompleted = orderStatus === 'Delivered' || deliveryStatus === 'Delivered'
    const isWithinTimeLimit = this.isReturnEligible(orderDate)
    
    return isCompleted && isWithinTimeLimit
  },

  // Get return status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'Requested':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Received':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'QC Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  },

  // Get QC status color
  getQcStatusColor(qcStatus: string): string {
    switch (qcStatus) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Passed (Restockable)':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Failed (Scrap)':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  },

  // Format return reasons for display
  formatReturnReason(reason: string): string {
    switch (reason) {
      case 'Expired':
        return 'Product Expired'
      case 'Damaged':
        return 'Product Damaged'
      case 'Wrong Item':
        return 'Wrong Item Delivered'
      case 'Customer Refusal':
        return 'Customer Refused'
      default:
        return reason
    }
  }
}