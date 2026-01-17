import { API_BASE_URL } from '../api-config';

export interface Banner {
  _id: string;
  offerName: string;
  description: string;
  image: {
    url: string;
    key: string;
  };
  itemId?: string;
  itemType: 'medicine' | 'labtest' | 'category' | 'product';
  isActive: boolean;
  s3Key: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  count: number;
  statistics?: {
    total: number;
    active: number;
    inactive: number;
  };
  page?: string;
  itemType?: string;
  data: Banner[];
}

/**
 * Get all active banners
 */
export async function getAllBanners(): Promise<BannersResponse> {
  const response = await fetch(`${API_BASE_URL}/banners`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch banners');
  }

  return response.json();
}

/**
 * Get medicine page banners
 */
export async function getMedicineBanners(): Promise<BannersResponse> {
  const response = await fetch(`${API_BASE_URL}/banners/medicines`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch medicine banners');
  }

  return response.json();
}

/**
 * Get lab test page banners
 */
export async function getLabTestBanners(): Promise<BannersResponse> {
  const response = await fetch(`${API_BASE_URL}/banners/labtests`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch lab test banners');
  }

  return response.json();
}

/**
 * Get category products page banners
 */
export async function getCategoryProductBanners(): Promise<BannersResponse> {
  const response = await fetch(`${API_BASE_URL}/banners/category-products`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch category product banners');
  }

  return response.json();
}

/**
 * Get banners by type
 */
export async function getBannersByType(type: 'medicine' | 'labtest' | 'category' | 'product'): Promise<BannersResponse> {
  const response = await fetch(`${API_BASE_URL}/banners/type/${type}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} banners`);
  }

  return response.json();
}
