# User Banner API Documentation

## Overview
This document provides comprehensive API documentation for the user-side banner system. Users can view promotional banners displayed on different pages of the application (home, medicines, lab tests, category products).

**Base URL**: `/api/banners`

---

## Table of Contents
1. [Get All Active Banners](#1-get-all-active-banners)
2. [Get Medicine Page Banners](#2-get-medicine-page-banners)
3. [Get Lab Test Page Banners](#3-get-lab-test-page-banners)
4. [Get Category Products Page Banners](#4-get-category-products-page-banners)
5. [Get Banners by Type](#5-get-banners-by-type)

---

## Authentication
All banner endpoints are **PUBLIC** - no authentication required.

---

## API Endpoints

### 1. Get All Active Banners

Get all active banners across the application.

**Endpoint**: `GET /api/banners`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 8,
  "statistics": {
    "total": 8,
    "active": 8,
    "inactive": 0
  },
  "data": [
    {
      "_id": "64banner123abc",
      "offerName": "50% Off on Vitamins",
      "description": "Get 50% discount on all vitamin supplements this week",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/vitamin-offer.jpg",
        "key": "arogyaRx/banners/vitamin-offer-1234567890.jpg"
      },
      "itemId": "64medicine456def",
      "itemType": "medicine",
      "isActive": true,
      "s3Key": "arogyaRx/banners/vitamin-offer-1234567890.jpg",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-10T10:00:00.000Z"
    },
    {
      "_id": "64banner789xyz",
      "offerName": "Free Home Collection",
      "description": "Book lab tests and get free home sample collection",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/lab-test-offer.jpg",
        "key": "arogyaRx/banners/lab-test-offer-9876543210.jpg"
      },
      "itemId": "64labtest123abc",
      "itemType": "labtest",
      "isActive": true,
      "s3Key": "arogyaRx/banners/lab-test-offer-9876543210.jpg",
      "createdAt": "2026-01-09T14:30:00.000Z",
      "updatedAt": "2026-01-09T14:30:00.000Z"
    }
  ]
}
```

**Field Descriptions**:
- `_id`: Unique banner identifier
- `offerName`: Name/title of the promotional offer
- `description`: Detailed description of the offer
- `image.url`: Full S3 URL of the banner image
- `image.key`: S3 storage key for the image
- `itemId`: ID of the linked item (medicine, lab test, category, or product)
- `itemType`: Type of linked item (`medicine`, `labtest`, `category`, `product`)
- `isActive`: Whether the banner is currently active
- `createdAt`: Banner creation timestamp
- `updatedAt`: Last update timestamp

**Note**: Only active banners (`isActive: true`) are returned in user-side endpoints.

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/banners"
```

---

### 2. Get Medicine Page Banners

Get banners specifically for the medicines page.

**Endpoint**: `GET /api/banners/medicines`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "page": "medicines",
  "data": [
    {
      "_id": "64banner123abc",
      "offerName": "50% Off on Vitamins",
      "description": "Get 50% discount on all vitamin supplements this week",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/vitamin-offer.jpg",
        "key": "arogyaRx/banners/vitamin-offer-1234567890.jpg"
      },
      "itemId": "64medicine456def",
      "itemType": "medicine",
      "isActive": true,
      "s3Key": "arogyaRx/banners/vitamin-offer-1234567890.jpg",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-10T10:00:00.000Z"
    },
    {
      "_id": "64banner456def",
      "offerName": "Buy 2 Get 1 Free",
      "description": "Special offer on pain relief medicines",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/pain-relief-offer.jpg",
        "key": "arogyaRx/banners/pain-relief-offer-1234567891.jpg"
      },
      "itemId": "64medicine789xyz",
      "itemType": "medicine",
      "isActive": true,
      "s3Key": "arogyaRx/banners/pain-relief-offer-1234567891.jpg",
      "createdAt": "2026-01-09T15:00:00.000Z",
      "updatedAt": "2026-01-09T15:00:00.000Z"
    }
  ]
}
```

**Note**: Returns only banners with `itemType: "medicine"` and `isActive: true`.

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/banners/medicines"
```

---

### 3. Get Lab Test Page Banners

Get banners specifically for the lab tests page.

**Endpoint**: `GET /api/banners/labtests`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "page": "labtests",
  "data": [
    {
      "_id": "64banner789xyz",
      "offerName": "Free Home Collection",
      "description": "Book lab tests and get free home sample collection",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/lab-test-offer.jpg",
        "key": "arogyaRx/banners/lab-test-offer-9876543210.jpg"
      },
      "itemId": "64labtest123abc",
      "itemType": "labtest",
      "isActive": true,
      "s3Key": "arogyaRx/banners/lab-test-offer-9876543210.jpg",
      "createdAt": "2026-01-09T14:30:00.000Z",
      "updatedAt": "2026-01-09T14:30:00.000Z"
    },
    {
      "_id": "64banner012ghi",
      "offerName": "Health Checkup Package",
      "description": "Complete health checkup at 30% discount",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/health-checkup.jpg",
        "key": "arogyaRx/banners/health-checkup-1234567892.jpg"
      },
      "itemId": "64labtest456def",
      "itemType": "labtest",
      "isActive": true,
      "s3Key": "arogyaRx/banners/health-checkup-1234567892.jpg",
      "createdAt": "2026-01-08T11:00:00.000Z",
      "updatedAt": "2026-01-08T11:00:00.000Z"
    }
  ]
}
```

**Note**: Returns only banners with `itemType: "labtest"` and `isActive: true`.

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/banners/labtests"
```

---

### 4. Get Category Products Page Banners

Get banners for the category products page (includes both category and product type banners).

**Endpoint**: `GET /api/banners/category-products`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 3,
  "page": "category-products",
  "data": [
    {
      "_id": "64banner345jkl",
      "offerName": "Personal Care Sale",
      "description": "Up to 40% off on personal care products",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/personal-care.jpg",
        "key": "arogyaRx/banners/personal-care-1234567893.jpg"
      },
      "itemId": "64category123abc",
      "itemType": "category",
      "isActive": true,
      "s3Key": "arogyaRx/banners/personal-care-1234567893.jpg",
      "createdAt": "2026-01-07T09:00:00.000Z",
      "updatedAt": "2026-01-07T09:00:00.000Z"
    },
    {
      "_id": "64banner678mno",
      "offerName": "Baby Care Essentials",
      "description": "Special discount on baby care products",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/baby-care.jpg",
        "key": "arogyaRx/banners/baby-care-1234567894.jpg"
      },
      "itemId": "64product456def",
      "itemType": "product",
      "isActive": true,
      "s3Key": "arogyaRx/banners/baby-care-1234567894.jpg",
      "createdAt": "2026-01-06T16:00:00.000Z",
      "updatedAt": "2026-01-06T16:00:00.000Z"
    }
  ]
}
```

**Note**: Returns banners with `itemType: "category"` OR `itemType: "product"` and `isActive: true`.

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/banners/category-products"
```

---

### 5. Get Banners by Type

Get banners for a specific item type (generic endpoint).

**Endpoint**: `GET /api/banners/type/:type`

**Authentication**: Not Required (Public)

**URL Parameters**:
- `type` (string, required): Item type (`medicine`, `labtest`, `category`, `product`)

**Success Response** (200 OK) - Medicine type:
```json
{
  "success": true,
  "count": 3,
  "itemType": "medicine",
  "data": [
    {
      "_id": "64banner123abc",
      "offerName": "50% Off on Vitamins",
      "description": "Get 50% discount on all vitamin supplements this week",
      "image": {
        "url": "https://s3.amazonaws.com/arogyarx/banners/vitamin-offer.jpg",
        "key": "arogyaRx/banners/vitamin-offer-1234567890.jpg"
      },
      "itemId": "64medicine456def",
      "itemType": "medicine",
      "isActive": true,
      "s3Key": "arogyaRx/banners/vitamin-offer-1234567890.jpg",
      "createdAt": "2026-01-10T10:00:00.000Z",
      "updatedAt": "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

**Error Responses**:

**400 Bad Request** - Invalid type:
```json
{
  "success": false,
  "message": "Invalid item type. Allowed types: medicine, labtest, category, product"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Failed to fetch medicine banners",
  "error": "Error details"
}
```

**cURL Examples**:
```bash
# Get medicine banners
curl -X GET "http://localhost:5000/api/banners/type/medicine"

# Get lab test banners
curl -X GET "http://localhost:5000/api/banners/type/labtest"

# Get category banners
curl -X GET "http://localhost:5000/api/banners/type/category"

# Get product banners
curl -X GET "http://localhost:5000/api/banners/type/product"
```

---

## Frontend Integration Examples

### React Component - Banner Carousel

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BannerCarousel = ({ page = 'all' }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [page]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/banners';

      // Determine which endpoint to use based on page
      switch (page) {
        case 'medicines':
          url = 'http://localhost:5000/api/banners/medicines';
          break;
        case 'labtests':
          url = 'http://localhost:5000/api/banners/labtests';
          break;
        case 'category-products':
          url = 'http://localhost:5000/api/banners/category-products';
          break;
        default:
          url = 'http://localhost:5000/api/banners';
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play carousel
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [banners.length, currentIndex]);

  if (loading) return <div>Loading banners...</div>;

  if (banners.length === 0) {
    return <div>No banners available</div>;
  }

  return (
    <div className="banner-carousel">
      <div className="carousel-container">
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            style={{ display: index === currentIndex ? 'block' : 'none' }}
          >
            <img
              src={banner.image.url}
              alt={banner.offerName}
              className="banner-image"
            />
            <div className="banner-content">
              <h2>{banner.offerName}</h2>
              <p>{banner.description}</p>
              {banner.itemId && (
                <button
                  onClick={() => {
                    // Navigate to item details page
                    window.location.href = `/${banner.itemType}/${banner.itemId}`;
                  }}
                  className="view-offer-btn"
                >
                  View Offer
                </button>
              )}
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button className="carousel-btn prev" onClick={prevSlide}>
              &#10094;
            </button>
            <button className="carousel-btn next" onClick={nextSlide}>
              &#10095;
            </button>

            <div className="carousel-dots">
              {banners.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerCarousel;
```

### React Component - Banner Grid

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BannerGrid = ({ itemType }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [itemType]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const url = itemType
        ? `http://localhost:5000/api/banners/type/${itemType}`
        : 'http://localhost:5000/api/banners';

      const response = await axios.get(url);

      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.itemId && banner.itemType) {
      // Navigate to the linked item
      window.location.href = `/${banner.itemType}/${banner.itemId}`;
    }
  };

  if (loading) return <div>Loading banners...</div>;

  if (banners.length === 0) {
    return <div>No promotional offers available at the moment</div>;
  }

  return (
    <div className="banner-grid">
      <h2>Special Offers</h2>
      <div className="grid-container">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="banner-card"
            onClick={() => handleBannerClick(banner)}
            style={{ cursor: banner.itemId ? 'pointer' : 'default' }}
          >
            <img
              src={banner.image.url}
              alt={banner.offerName}
              className="banner-image"
            />
            <div className="banner-info">
              <h3>{banner.offerName}</h3>
              <p>{banner.description}</p>
              {banner.itemId && (
                <span className="view-details">View Details →</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerGrid;
```

### React Component - Page-Specific Banners

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PageBanners = ({ pageName }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageBanners();
  }, [pageName]);

  const fetchPageBanners = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      switch (pageName) {
        case 'medicines':
          endpoint = '/api/banners/medicines';
          break;
        case 'labtests':
          endpoint = '/api/banners/labtests';
          break;
        case 'category-products':
          endpoint = '/api/banners/category-products';
          break;
        default:
          endpoint = '/api/banners';
      }

      const response = await axios.get(`http://localhost:5000${endpoint}`);

      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching page banners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="banner-skeleton">
        <div className="skeleton-banner"></div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="page-banners">
      {banners.map((banner) => (
        <div key={banner._id} className="banner-item">
          <img src={banner.image.url} alt={banner.offerName} />
          <div className="banner-overlay">
            <h3>{banner.offerName}</h3>
            <p>{banner.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PageBanners;
```

---

## Complete Workflow Example

### Scenario: Display Banners on Different Pages

```javascript
// Fetch all banners for home page
const fetchHomeBanners = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/banners');
    
    if (response.data.success) {
      console.log('Total banners:', response.data.count);
      console.log('Active banners:', response.data.statistics.active);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching home banners:', error);
    return [];
  }
};

// Fetch medicine page banners
const fetchMedicineBanners = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/banners/medicines');
    
    if (response.data.success) {
      console.log('Medicine banners:', response.data.count);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching medicine banners:', error);
    return [];
  }
};

// Fetch lab test page banners
const fetchLabTestBanners = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/banners/labtests');
    
    if (response.data.success) {
      console.log('Lab test banners:', response.data.count);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching lab test banners:', error);
    return [];
  }
};

// Fetch category products page banners
const fetchCategoryProductBanners = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/banners/category-products');
    
    if (response.data.success) {
      console.log('Category product banners:', response.data.count);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error fetching category product banners:', error);
    return [];
  }
};

// Fetch banners by specific type
const fetchBannersByType = async (type) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/banners/type/${type}`);
    
    if (response.data.success) {
      console.log(`${type} banners:`, response.data.count);
      return response.data.data;
    }
  } catch (error) {
    console.error(`Error fetching ${type} banners:`, error);
    return [];
  }
};

// Complete workflow for different pages
const bannerWorkflow = async () => {
  try {
    // Home page - show all banners
    const homeBanners = await fetchHomeBanners();
    console.log('Home page banners:', homeBanners);
    
    // Medicine page - show only medicine banners
    const medicineBanners = await fetchMedicineBanners();
    console.log('Medicine page banners:', medicineBanners);
    
    // Lab test page - show only lab test banners
    const labTestBanners = await fetchLabTestBanners();
    console.log('Lab test page banners:', labTestBanners);
    
    // Category products page - show category and product banners
    const categoryBanners = await fetchCategoryProductBanners();
    console.log('Category products page banners:', categoryBanners);
    
    // Generic fetch by type
    const specificBanners = await fetchBannersByType('medicine');
    console.log('Specific type banners:', specificBanners);
    
  } catch (error) {
    console.error('Error in banner workflow:', error);
  }
};
```

---

## Summary

### User-Side Endpoints (5 APIs)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/banners` | GET | Public | Get all active banners |
| `/api/banners/medicines` | GET | Public | Get medicine page banners |
| `/api/banners/labtests` | GET | Public | Get lab test page banners |
| `/api/banners/category-products` | GET | Public | Get category products page banners |
| `/api/banners/type/:type` | GET | Public | Get banners by specific type |

### Key Features
- 🎨 **Promotional Banners**: Display offers and promotions across the app
- 📱 **Page-Specific**: Different banners for different pages (medicines, lab tests, categories)
- 🔗 **Item Linking**: Banners can link to specific items (medicines, lab tests, categories, products)
- 🖼️ **S3 Storage**: Images stored securely on AWS S3
- ✅ **Active Status**: Only active banners are shown to users
- 🔄 **Auto-Sorted**: Banners sorted by creation date (newest first)
- 🚀 **No Auth Required**: All endpoints are public for easy access

### Banner Item Types
- **medicine** - Links to specific medicine products
- **labtest** - Links to specific lab tests
- **category** - Links to product categories
- **product** - Links to specific category products

### Banner Structure
Each banner contains:
- Offer name and description
- High-quality image (S3 hosted)
- Optional link to specific item
- Active/inactive status
- Creation and update timestamps

### Use Cases
1. **Home Page Carousel**: Display all active banners in a rotating carousel
2. **Medicine Page**: Show medicine-specific promotional offers
3. **Lab Test Page**: Display lab test packages and discounts
4. **Category Page**: Show category and product-specific promotions
5. **Targeted Marketing**: Link banners directly to promoted items

### Best Practices
1. **Image Optimization**: Ensure banner images are optimized for web (recommended: 1200x400px)
2. **Caching**: Cache banner responses for better performance
3. **Lazy Loading**: Load banner images lazily to improve page load time
4. **Responsive Design**: Make banners responsive for mobile and desktop
5. **Click Tracking**: Track banner clicks for analytics
6. **Fallback**: Handle cases where no banners are available gracefully

### Integration Tips
```javascript
// Example: Using banners in different pages

// Home Page
<BannerCarousel page="all" />

// Medicine Page
<BannerCarousel page="medicines" />

// Lab Test Page
<PageBanners pageName="labtests" />

// Category Products Page
<BannerGrid itemType="category" />
```

---

**Last Updated**: January 2026
**Version**: 1.0
