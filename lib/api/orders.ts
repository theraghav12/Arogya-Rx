import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface OrderItem {
  _id: string;
  productType: 'medicine' | 'categoryProduct' | 'labTest';
  quantity: number;
  price: number;
  isHomeCollection?: boolean;
  homeCollectionPrice?: number;
  labTestSampleOTP?: string;
  labTestStatus?: string;
  labTestRecorder?: {
    name: string;
    phone?: string;
    email?: string;
  };
  medicine?: {
    _id: string;
    productName: string;
    price: number;
    image: string;
    category: string;
  };
  categoryProduct?: {
    _id: string;
    productName: string;
    price: number;
    image: string;
  };
  labTest?: {
    _id: string;
    testName: string;
    description: string;
    price: number;
  };
  labTestId?: string;
  labTestPatientDetails?: {
    name: string;
    phone: string;
    gender: string;
    age: number;
    disease?: string;
    email?: string;
    address?: string;
    contact?: string;
  };
}

export interface Order {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  address: string;
  contact: string;
  hasLabTests?: boolean;
  deliveryOTP?: string;
  orderedAt: string;
  deliveredAt?: string;
  prescriptionVerified?: boolean;
  prescriptionVerificationStatus?: string;
  hasPrescriptionRequired?: boolean;
  medicineSubstitutions?: any[];
}

export interface PlaceOrderRequest {
  cartId: string;
  address?: string;
  addressId?: string;
  contact: string;
  name?: string;
  paymentMethod?: 'COD' | 'Online';
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  order: Order;
  prescriptionStatus: {
    hasPrescriptionRequired: boolean;
    prescriptionVerified: boolean;
    prescriptionVerificationStatus: string;
    prescriptionRequiredMedicines: any[];
    prescriptionNotRequiredMedicines: any[];
    prescriptionRequiredCount: number;
    prescriptionNotRequiredCount: number;
    message: string;
    statusMessage: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface OrderStatistics {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface LabTestResult {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  testDetails: {
    _id: string;
    testId: string;
    testName: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
    status: string;
  };
  result: {
    uploadedAt: string;
    fileUrl: string;
    contentType: string;
  };
  patient: {
    name: string;
    phone: string;
    gender: string;
    age: number;
    disease?: string;
    email?: string;
    address?: string;
    contact?: string;
  };
}

export interface LabTestOrder {
  _id: string;
  user: string;
  tests: Array<{
    labTest: string;
    testName: string;
    priceSnapshot: number;
    discountedPriceSnapshot: number;
    _id: string;
  }>;
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactPhone: string;
  contactEmail?: string;
  address: string;
  homeCollection: boolean;
  preferredDate: string;
  preferredSlot: {
    start: string;
    end: string;
  };
  subtotal: number;
  homeCollectionCharge: number;
  discountAmount: number;
  couponCode?: string;
  couponDiscount: number;
  taxAmount: number;
  totalAmount: number;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  status: string;
  results?: {
    reportFiles: Array<{
      s3Key: string;
      url: string;
      contentType: string;
      _id: string;
    }>;
    structured: Array<{
      parameter: string;
      value: string;
      unit: string;
      normalRange: string;
      status: string;
    }>;
    releasedAt?: string;
  };
  metadata?: {
    createdBy: string;
    lastUpdatedBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REGULAR ORDER API FUNCTIONS
// ============================================================================

/**
 * Place order from cart
 */
export async function placeOrder(data: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/place-from-cart`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to place order');
  }

  return result;
}

/**
 * Get all orders with pagination (simple view)
 */
export async function getOrders(page = 1, limit = 10): Promise<OrdersResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/simple?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch orders');
  }

  return result;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<{ success: boolean; message: string; order: Order }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to fetch order');
  }

  return result;
}

/**
 * Get orders with filters
 */
export async function getOrdersWithFilters(filters: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<OrdersResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/orders/filter?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch orders');
  }

  return result;
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string): Promise<{ message: string; order: Order }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to cancel order');
  }

  return result;
}

/**
 * Check prescription status
 */
export async function checkPrescriptionStatus(cartId: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/check-prescription/${cartId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to check prescription status');
  }

  return result;
}

/**
 * Reorder previous order
 */
export async function reorderOrder(orderId: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reorder`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to reorder');
  }

  return result;
}

/**
 * Get order statistics
 */
export async function getOrderStatistics(): Promise<{ success: boolean; message: string; statistics: OrderStatistics }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/stats/overview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch statistics');
  }

  return result;
}

/**
 * Download order invoice
 */
export async function downloadInvoice(orderId: string): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/invoice`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to download invoice');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Get lab test results
 */
export async function getLabTestResults(page = 1, limit = 10, status?: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (status) {
    queryParams.append('status', status);
  }

  const response = await fetch(`${API_BASE_URL}/orders/my-lab-results?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch lab results');
  }

  return result;
}

// ============================================================================
// LAB TEST ORDER API FUNCTIONS
// ============================================================================

/**
 * Create lab test order
 */
export async function createLabTestOrder(data: {
  tests: Array<{ labTestId: string }>;
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactPhone: string;
  contactEmail?: string;
  address: string;
  homeCollection?: boolean;
  preferredDate?: string;
  preferredSlot?: { start: string; end: string };
  couponCode?: string;
  payment?: { method: string };
}): Promise<{ success: boolean; data: LabTestOrder }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/lab-test-orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create lab test order');
  }

  return result;
}

/**
 * Get my lab test orders
 */
export async function getMyLabTestOrders(): Promise<{ success: boolean; count: number; data: LabTestOrder[] }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/lab-test-orders/my-orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch lab test orders');
  }

  return result;
}

/**
 * Get lab test order by ID
 */
export async function getLabTestOrderById(orderId: string): Promise<{ success: boolean; data: LabTestOrder }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/lab-test-orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch lab test order');
  }

  return result;
}

/**
 * Reschedule lab test
 */
export async function rescheduleLabTest(
  orderId: string,
  data: {
    preferredDate: string;
    preferredSlot: { start: string; end: string };
    reason?: string;
  }
): Promise<{ success: boolean; data: LabTestOrder }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/lab-test-orders/${orderId}/reschedule`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to reschedule lab test');
  }

  return result;
}
