import { API_BASE_URL } from '../api-config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Prescription {
  _id: string;
  patientId: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  imageUrl: string;
  imageKey: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  dateIssued?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionAPIResponse {
  success: boolean;
  message: string;
  data: {
    _id: string,
    patientId: string,
    imageUrl: string,
    status: string,
    dateIssued: string,
    createdAt: string,
    updatedAt: string
  }
}

export interface PrescriptionsResponse {
  success: boolean;
  count: number;
  data: Prescription[];
}

export interface PrescriptionResponse {
  success: boolean;
  message: string;
  data: Prescription;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Upload a new prescription
 * Endpoint: POST /api/prescriptions
 */
export async function uploadPrescription(file: File): Promise<Prescription> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/prescriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  // NEW: Check success field instead of response.ok
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.message || 'Failed to upload prescription');
  }
}

/**
 * Get all my prescriptions
 * Endpoint: GET /api/prescriptions/my-prescriptions
 */
export async function getMyPrescriptions(): Promise<Prescription[]> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // NEW: Updated endpoint
  const response = await fetch(`${API_BASE_URL}/prescriptions/my-prescriptions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  // NEW: Check success field and return data array
  if (result.success) {
    return result.data || [];
  } else {
    throw new Error(result.message || 'Failed to fetch prescriptions');
  }
}

/**
 * Get prescription by ID
 * Endpoint: GET /api/prescriptions/:id
 */
export async function getPrescriptionById(prescriptionId: string): Promise<Prescription> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/prescriptions/${prescriptionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  // NEW: Check success field
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.message || 'Failed to fetch prescription');
  }
}

/**
 * Delete my prescription
 * Endpoint: DELETE /api/prescriptions/me/:id
 */
export async function deletePrescription(prescriptionId: string): Promise<void> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // NEW: Updated endpoint path
  const response = await fetch(`${API_BASE_URL}/prescriptions/me/${prescriptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();

  // NEW: Check success field
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete prescription');
  }
}
