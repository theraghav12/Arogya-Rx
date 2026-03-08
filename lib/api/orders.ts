import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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
  razorpayPaymentId?: string;
  address: string;
  contact: string;
  hasLabTests?: boolean;
  deliveryOTP?: string;
  orderedAt: string;
  deliveredAt?: string;
  prescriptionVerified?: boolean;
  prescriptionVerificationStatus?: string;
  hasPrescriptionRequired?: boolean;
  prescriptionImages?: string[];
  medicineSubstitutions?: Array<{
    originalMedicine: string;
    substituteMedicine: string;
    reason: string;
  }>;
  deliveryPartner?: {
    _id: string;
    name: string;
    phone: string;
  };
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
  orderId: string;
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
 * Endpoint: POST /api/orders/place-from-cart
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
 * Get all orders with pagination
 * Endpoint: GET /api/orders
 */
export async function getOrders(page = 1, limit = 10): Promise<OrdersResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=${limit}`, {
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
  
  // Only add parameters that have actual values (not empty strings)
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/orders/filter?${queryParams}`;
  console.log('Fetching orders from:', url);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  console.log('API Response:', result);

  if (!response.ok) {
    console.error('API Error:', result);
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
 * Check prescription status for cart items
 * Note: This checks cart items directly since the API endpoint may not exist
 */
export async function checkPrescriptionStatus(cartId: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    // Try the documented endpoint first
    const response = await fetch(`${API_BASE_URL}/orders/prescription-status/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    // If endpoint doesn't exist (404), check cart items directly
    if (response.status === 404) {
      const { getCart } = await import('./cart');
      const cartData = await getCart();
      
      const prescriptionRequiredMedicines = cartData.cart.items.filter(
        (item: any) => item.medicineId?.prescriptionRequired === true
      );
      
      const prescriptionNotRequiredMedicines = cartData.cart.items.filter(
        (item: any) => item.medicineId?.prescriptionRequired !== true
      );
      
      return {
        success: true,
        message: 'Prescription status checked successfully',
        data: {
          cartId: cartId,
          totalAmount: cartData.cart.totalAmount,
          prescriptionStatus: {
            hasPrescriptionRequired: prescriptionRequiredMedicines.length > 0,
            prescriptionRequiredMedicines: prescriptionRequiredMedicines.map((item: any) => ({
              medicineId: item.medicineId._id,
              productName: item.medicineId.productName,
              quantity: item.quantity,
              price: item.medicineId.pricing.sellingPrice,
              prescriptionRequired: true,
              category: item.medicineId.category,
              imageUrl: item.medicineId.images?.[0] || '',
            })),
            prescriptionNotRequiredMedicines: prescriptionNotRequiredMedicines.map((item: any) => ({
              medicineId: item.medicineId._id,
              productName: item.medicineId.productName,
              quantity: item.quantity,
              price: item.medicineId.pricing.sellingPrice,
              prescriptionRequired: false,
              category: item.medicineId.category,
              imageUrl: item.medicineId.images?.[0] || '',
            })),
            prescriptionRequiredCount: prescriptionRequiredMedicines.length,
            prescriptionNotRequiredCount: prescriptionNotRequiredMedicines.length,
            totalItems: cartData.cart.items.length,
          },
          message: prescriptionRequiredMedicines.length > 0
            ? `⚠️ This cart contains ${prescriptionRequiredMedicines.length} prescription medicine(s). You will need a valid prescription to complete the order.`
            : 'No prescription required for items in cart',
        },
      };
    }

    const result = await response.json();
    throw new Error(result.message || result.error || 'Failed to check prescription status');
  } catch (error: any) {
    // If it's a network error or other error, try cart fallback
    if (error.message === 'Failed to check prescription status') {
      throw error;
    }
    
    try {
      const { getCart } = await import('./cart');
      const cartData = await getCart();
      
      const prescriptionRequiredMedicines = cartData.cart.items.filter(
        (item: any) => item.medicineId?.prescriptionRequired === true
      );
      
      return {
        success: true,
        data: {
          prescriptionStatus: {
            hasPrescriptionRequired: prescriptionRequiredMedicines.length > 0,
            prescriptionRequiredCount: prescriptionRequiredMedicines.length,
          },
        },
      };
    } catch (fallbackError) {
      throw error;
    }
  }
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
 * Endpoint: GET /api/orders/statistics
 * Note: This endpoint may not exist on all backends
 */
export async function getOrderStatistics(): Promise<{ success: boolean; message: string; statistics: OrderStatistics }> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If endpoint doesn't exist or returns error, throw to use fallback
      throw new Error('Statistics endpoint not available');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    // Return empty statistics that will be calculated from orders
    throw new Error('Statistics not available');
  }
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
 * Endpoint: GET /api/orders/my-lab-results
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

/**
 * Upload prescription for order
 * Endpoint: POST /api/orders/:orderId/prescription
 */
export async function uploadPrescription(orderId: string, files: File[]): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/prescription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to upload prescription');
  }

  return result;
}

/**
 * Get prescription images for order
 * Endpoint: GET /api/orders/:orderId/prescription
 */
export async function getPrescriptionImages(orderId: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/prescription`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch prescription images');
  }

  return result;
}

/**
 * Delete prescription image
 * Endpoint: DELETE /api/orders/:orderId/prescription/:imageKey
 */
export async function deletePrescriptionImage(orderId: string, imageUrl: string): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // Extract S3 key from URL
  const urlObj = new URL(imageUrl);
  const imageKey = encodeURIComponent(urlObj.pathname.substring(1));

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/prescription/${imageKey}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to delete prescription image');
  }

  return result;
}

// ============================================================================
// LAB TEST ORDER API FUNCTIONS
// ============================================================================

/**
 * Create lab test order (Book directly without cart)
 */
export async function createLabTestOrder(data: {
  tests: Array<{ labTestId: string }>;
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactPhone: string;
  contactEmail?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
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

  // Try the documented endpoint first
  let response = await fetch(`${API_BASE_URL}/lab-test-orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // If 404, try alternative endpoint
  if (response.status === 404) {
    response = await fetch(`${API_BASE_URL}/orders/lab-test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to create lab test order');
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
