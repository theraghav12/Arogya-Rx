import { API_BASE_URL } from '../api-config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isAI: boolean;
  recommendations?: Recommendation[];
  isError?: boolean;
}

export interface Recommendation {
  type: 'doctor' | 'product';
  data: DoctorRecommendation | ProductRecommendation;
}

export interface DoctorRecommendation {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: string;
  fee: number;
  contact: string;
}

export interface ProductRecommendation {
  _id: string;
  productName: string;
  brandName: string;
  category: string;
  price: number;
  description: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  userId?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    recommendations: Recommendation[];
    timestamp: string;
    sessionId: string;
    userId?: string;
    isAI: boolean;
  };
}

export interface AIHealthResponse {
  status: 'active' | 'inactive';
  type: string;
}

export interface AIInfoResponse {
  success: boolean;
  data: {
    name: string;
    capabilities: string[];
    version: string;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Send message to AI Doctor and get response
 */
export async function sendMessageToAI(data: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/ai-doctor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to send message');
  }

  return result;
}

/**
 * Check AI Doctor service health
 */
export async function checkAIHealth(): Promise<AIHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/ai-doctor/health`);
  return await response.json();
}

/**
 * Get AI Doctor information
 */
export async function getAIInfo(): Promise<AIInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/ai-doctor/info`);
  return await response.json();
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
