import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CartItem {
  _id: string;
  productType: 'medicine' | 'categoryProduct' | 'labTest';
  medicineId?: {
    _id: string;
    productName: string;
    brandName: string;
    images: string[];
    pricing: {
      mrp: number;
      sellingPrice: number;
      discount: number;
    };
    inventory?: {
      stockQuantity: number;
    };
    stockQuantity?: number; // Fallback if inventory is not nested
    prescriptionRequired: boolean;
  };
  categoryProductId?: {
    _id: string;
    productDetails: {
      productName: string;
      brandName: string;
      images: string[];
      pricing: {
        mrp: number;
        sellingPrice: number;
      };
      stock: {
        available: boolean;
        quantity: number;
      };
    };
  };
  labTestId?: {
    _id: string;
    testName: string;
    price: number;
    discountedPrice: number;
    isHomeCollectionAvailable: boolean;
    homeCollectionPrice: number;
  };
  quantity: number;
  price: number;
  isHomeCollection?: boolean;
  homeCollectionPrice?: number;
  preferredDate?: string;
  preferredSlot?: {
    start: string;
    end: string;
  };
  labTestPatientDetails?: {
    name: string;
    phone: string;
    gender: string;
    age: number;
    disease?: string;
  };
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export interface AddToCartRequest {
  medicineId?: string;
  categoryProductId?: string;
  labTestId?: string;
  quantity: number;
  isHomeCollection?: boolean;
  preferredDate?: string;
  preferredSlot?: {
    start: string;
    end: string;
  };
  labTestPatientDetails?: {
    name: string;
    phone: string;
    gender: string;
    age: number;
    disease?: string;
  };
}

export interface UpdateCartRequest {
  medicineId?: string;
  categoryProductId?: string;
  labTestId?: string;
  quantity: number;
  isHomeCollection?: boolean;
}

export interface RemoveFromCartRequest {
  medicineId?: string;
  categoryProductId?: string;
  labTestId?: string;
  isHomeCollection?: boolean;
}

export interface CartResponse {
  message: string;
  cart: Cart;
  totalItems?: number;
  totalPrice?: number;
  addedItem?: any;
  updatedItem?: any;
  removedItem?: any;
  clearedItemsCount?: number;
  clearedItems?: any[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Add item to cart (medicine, category product, or lab test)
 */
export async function addToCart(data: AddToCartRequest): Promise<CartResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/cart/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to add item to cart');
  }

  return result;
}

/**
 * Get user's cart with all items and populated product details
 */
export async function getCart(): Promise<CartResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      // Cart is empty
      return {
        message: 'Cart is empty',
        cart: {
          _id: '',
          userId: '',
          items: [],
          totalPrice: 0,
        },
        totalItems: 0,
        totalPrice: 0,
      };
    }
    throw new Error(result.message || 'Failed to fetch cart');
  }

  return result;
}

/**
 * Update item quantity in cart
 */
export async function updateCartQuantity(data: UpdateCartRequest): Promise<CartResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/cart/update-quantity`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Update cart endpoint not available. Using fallback method.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update quantity');
  }

  return result;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(data: RemoveFromCartRequest): Promise<CartResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/cart/remove`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Check if response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned invalid response. Please try again.');
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to remove item');
  }

  return result;
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<CartResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/cart/clear`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to clear cart');
  }

  return result;
}
