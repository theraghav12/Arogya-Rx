import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export interface CreateOrderPaymentRequest {
  cartId: string;
  address?: string;
  addressId?: string;
  contact: string;
}

export interface CreateOrderPaymentResponse {
  success: boolean;
  message: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
}

export interface CreateAppointmentPaymentRequest {
  appointmentId: string;
}

export interface CreateAppointmentPaymentResponse {
  success: boolean;
  message: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  appointmentId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  order?: any;
  appointment?: any;
}

export interface PaymentFailureRequest {
  razorpay_order_id: string;
  error_description: string;
}

/**
 * Create payment order for cart items
 */
export async function createOrderPayment(data: CreateOrderPaymentRequest): Promise<CreateOrderPaymentResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to create payment order');
  }

  return result;
}

/**
 * Create payment order for appointment
 */
export async function createAppointmentPayment(data: CreateAppointmentPaymentRequest): Promise<CreateAppointmentPaymentResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/payment/create-appointment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to create appointment payment');
  }

  return result;
}

/**
 * Verify payment signature
 */
export async function verifyPayment(data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Payment verification failed');
  }

  return result;
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(data: PaymentFailureRequest): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/payment/failure`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || 'Failed to handle payment failure');
  }

  return result;
}

/**
 * Load Razorpay script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initialize Razorpay payment
 */
export async function initiateRazorpayPayment(
  paymentData: CreateOrderPaymentResponse | CreateAppointmentPaymentResponse,
  userDetails: { name: string; email: string; contact: string },
  onSuccess: () => void,
  onFailure: (error: string) => void
): Promise<void> {
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded) {
    onFailure('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const options = {
    key: paymentData.razorpayKeyId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    name: 'ArogyaRx',
    description: 'orderNumber' in paymentData ? `Order ${paymentData.orderNumber}` : 'Appointment Booking',
    order_id: paymentData.razorpayOrderId,
    handler: async function (response: any) {
      try {
        // Verify payment
        const verifyResult = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyResult.success) {
          onSuccess();
        } else {
          onFailure('Payment verification failed');
        }
      } catch (error: any) {
        onFailure(error.message || 'Payment verification failed');
      }
    },
    modal: {
      ondismiss: async function () {
        try {
          // Handle payment cancellation
          await handlePaymentFailure({
            razorpay_order_id: paymentData.razorpayOrderId,
            error_description: 'Payment cancelled by user',
          });
          onFailure('Payment cancelled');
        } catch (error) {
          console.error('Error handling payment cancellation:', error);
        }
      },
    },
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.contact,
    },
    theme: {
      color: '#0ea5e9', // Primary color
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}
