import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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

  console.log('Creating order payment with data:', data);

  const response = await fetch(`${API_BASE_URL}/payments/orders/create-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  console.log('Create payment response:', {
    status: response.status,
    ok: response.ok,
    result
  });

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

  const response = await fetch(`${API_BASE_URL}/payments/create-appointment`, {
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

  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
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

  const response = await fetch(`${API_BASE_URL}/payments/failure`, {
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
      console.log('Razorpay already loaded');
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      console.log('Razorpay script tag exists, waiting for load...');
      // Wait a bit for it to load
      setTimeout(() => {
        if ((window as any).Razorpay) {
          console.log('Razorpay loaded from existing script');
          resolve(true);
        } else {
          console.error('Razorpay script exists but not loaded');
          resolve(false);
        }
      }, 1000);
      return;
    }

    console.log('Loading Razorpay script...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Razorpay script:', error);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initialize Razorpay payment
 */
export async function initiateRazorpayPayment(
  paymentData: CreateOrderPaymentResponse | CreateAppointmentPaymentResponse,
  userDetails: { name: string; email: string; contact: string },
  onSuccess: (verifyResult: VerifyPaymentResponse) => void,
  onFailure: (error: string) => void
): Promise<void> {
  console.log('Initiating Razorpay payment with data:', paymentData);
  
  const scriptLoaded = await loadRazorpayScript();

  if (!scriptLoaded) {
    console.error('Razorpay script failed to load');
    onFailure('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  console.log('Razorpay script loaded successfully');

  // Check if Razorpay is available
  if (typeof window === 'undefined' || !(window as any).Razorpay) {
    console.error('Razorpay not available on window object');
    onFailure('Razorpay SDK not available. Please refresh the page.');
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
      console.log('Razorpay payment successful:', response);
      try {
        // Verify payment
        const verifyResult = await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        console.log('Payment verification result:', verifyResult);

        if (verifyResult.success) {
          onSuccess(verifyResult);
        } else {
          onFailure('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        onFailure(error.message || 'Payment verification failed');
      }
    },
    modal: {
      ondismiss: async function () {
        console.log('Razorpay modal dismissed by user');
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

  console.log('Opening Razorpay modal with options:', options);

  try {
    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
    console.log('Razorpay modal opened successfully');
  } catch (error) {
    console.error('Error opening Razorpay modal:', error);
    onFailure('Failed to open payment modal. Please try again.');
  }
}
