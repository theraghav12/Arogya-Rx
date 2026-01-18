# User Categories & Products APIs - Complete Guide

## Base URL
```
http://localhost:5000/api
```

**Note:** All endpoints are public unless specified otherwise.

---

## Table of Contents

### Categories APIs
1. [Get All Categories](#1-get-all-categories)
2. [Get Category by ID](#2-get-category-by-id)
3. [Get Categories with Product Counts](#3-get-categories-with-product-counts)

### Category Products APIs
4. [Get All Category Products](#4-get-all-category-products)
5. [Get Products by Category](#5-get-products-by-category)
6. [Get Product by ID in Category](#6-get-product-by-id-in-category)
7. [Search Products by Name](#7-search-products-by-name)

---

## Categories APIs

### 1. Get All Categories

**Endpoint:** `GET /api/categories`

**Description:** Get all active categories sorted by sort order and name.

**Headers:**
```
None (Public endpoint)
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64cat123abc",
      "name": "Personal Care",
      "description": "Personal care and hygiene products",
      "slug": "personal-care",
      "image": {
        "url": "https://s3.amazonaws.com/arogyaRx/categories/image1.jpg",
        "key": "arogyaRx/categories/image1.jpg"
      },
      "parentCategory": null,
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "64cat456def",
      "name": "Baby Care",
      "description": "Products for babies and toddlers",
      "slug": "baby-care",
      "image": {
        "url": "https://s3.amazonaws.com/arogyaRx/categories/image2.jpg",
        "key": "arogyaRx/categories/image2.jpg"
      },
      "parentCategory": null,
      "sortOrder": 2,
      "isActive": true,
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  ]
}
```

**Frontend Integration:**
```javascript
const getAllCategories = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/categories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Usage
const categories = await getAllCategories();
console.log(`Found ${categories.count} categories`);
```

**React Component Example:**
```javascript
import React, { useState, useEffect } from 'react';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="category-list">
      <h2>Shop by Category</h2>
      <div className="category-grid">
        {categories.map(category => (
          <div key={category._id} className="category-card">
            <img 
              src={category.image.url} 
              alt={category.name}
            />
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <button onClick={() => window.location.href = `/categories/${category._id}`}>
              Browse Products
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
```

---

### 2. Get Category by ID

**Endpoint:** `GET /api/categories/:id`

**Description:** Get detailed information about a specific category.

**Headers:**
```
None (Public endpoint)
```

**URL Parameters:**
- `id`: Category's MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "64cat123abc",
    "name": "Personal Care",
    "description": "Personal care and hygiene products including soaps, shampoos, and more",
    "slug": "personal-care",
    "image": {
      "url": "https://s3.amazonaws.com/arogyaRx/categories/image1.jpg",
      "key": "arogyaRx/categories/image1.jpg"
    },
    "parentCategory": null,
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Frontend Integration:**
```javascript
const getCategoryById = async (categoryId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/categories/${categoryId}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Usage
const category = await getCategoryById('64cat123abc');
console.log('Category:', category.data.name);
```

---

### 3. Get Categories with Product Counts

**Endpoint:** `GET /api/category-products/categories`

**Description:** Get all active categories with the count of available products in each category.

**Headers:**
```
None (Public endpoint)
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "64cat123abc",
      "name": "Personal Care",
      "description": "Personal care and hygiene products",
      "image": {
        "url": "https://s3.amazonaws.com/arogyaRx/categories/image1.jpg",
        "key": "arogyaRx/categories/image1.jpg"
      },
      "slug": "personal-care",
      "productCount": 45
    },
    {
      "id": "64cat456def",
      "name": "Baby Care",
      "description": "Products for babies and toddlers",
      "image": {
        "url": "https://s3.amazonaws.com/arogyaRx/categories/image2.jpg",
        "key": "arogyaRx/categories/image2.jpg"
      },
      "slug": "baby-care",
      "productCount": 32
    }
  ]
}
```

**Frontend Integration:**
```javascript
const getCategoriesWithCounts = async () => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/category-products/categories'
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Usage
const categoriesWithCounts = await getCategoriesWithCounts();
categoriesWithCounts.data.forEach(cat => {
  console.log(`${cat.name}: ${cat.productCount} products`);
});
```

---

## Category Products APIs

### 4. Get All Category Products

**Endpoint:** `GET /api/category-products/category/category-products`

**Description:** Get all category products with advanced filtering, sorting, and pagination.

**Headers:**
```
None (Public endpoint)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 20) |
| search | String | No | Search in product name, brand, generic name |
| categoryId | String | No | Filter by category ID |
| manufacturer | String | No | Filter by manufacturer name |
| prescriptionRequired | Boolean | No | Filter by prescription requirement |
| inStock | Boolean | No | Filter by stock availability |
| minPrice | Number | No | Minimum price filter |
| maxPrice | Number | No | Maximum price filter |
| productCategory | String | No | Filter by product category (OTC, Prescription, etc.) |
| sortBy | String | No | Sort field (price, stock, name, sortOrder) |
| sortOrder | String | No | Sort order (asc, desc) |

**Example Requests:**
```
GET /api/category-products/category/category-products
GET /api/category-products/category/category-products?page=1&limit=20
GET /api/category-products/category/category-products?search=soap
GET /api/category-products/category/category-products?categoryId=64cat123abc
GET /api/category-products/category/category-products?minPrice=100&maxPrice=500
GET /api/category-products/category/category-products?sortBy=price&sortOrder=asc
GET /api/category-products/category/category-products?inStock=true&prescriptionRequired=false
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "64prod123abc",
      "productName": "Dove Soap",
      "brandName": "Dove",
      "genericName": "Moisturizing Soap",
      "manufacturer": "Unilever",
      "images": [
        "https://s3.amazonaws.com/arogyaRx/category-products/image1.jpg",
        "https://s3.amazonaws.com/arogyaRx/category-products/image2.jpg"
      ],
      "description": "Gentle moisturizing soap for all skin types",
      "pricing": {
        "mrp": 100,
        "sellingPrice": 85,
        "discount": 15
      },
      "stock": {
        "available": true,
        "quantity": 150
      },
      "packaging": {
        "packSize": "100g",
        "expiryDate": "2025-12-31T00:00:00.000Z",
        "storageInstructions": "Store in a cool, dry place"
      },
      "category": {
        "_id": "64cat123abc",
        "name": "Personal Care",
        "slug": "personal-care",
        "image": {
          "url": "https://s3.amazonaws.com/..."
        }
      },
      "productCategory": "OTC",
      "prescriptionRequired": false,
      "sortOrder": 1,
      "productType": "categoryProduct",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 95,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "search": null,
    "categoryId": null,
    "manufacturer": null,
    "prescriptionRequired": null,
    "inStock": null,
    "minPrice": null,
    "maxPrice": null,
    "productCategory": null
  },
  "sort": {
    "sortBy": "sortOrder",
    "sortOrder": "asc"
  }
}
```

**Frontend Integration:**
```javascript
const getAllCategoryProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const response = await fetch(
      `http://localhost:5000/api/category-products/category/category-products?${queryParams}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Usage Examples
// Get all products
const allProducts = await getAllCategoryProducts();

// Search products
const searchResults = await getAllCategoryProducts({ search: 'soap' });

// Filter by category
const categoryProducts = await getAllCategoryProducts({ 
  categoryId: '64cat123abc' 
});

// Filter by price range
const affordableProducts = await getAllCategoryProducts({ 
  minPrice: 50, 
  maxPrice: 200 
});

// Sort by price
const cheapestFirst = await getAllCategoryProducts({ 
  sortBy: 'price', 
  sortOrder: 'asc' 
});

// Multiple filters
const filteredProducts = await getAllCategoryProducts({
  categoryId: '64cat123abc',
  inStock: true,
  minPrice: 100,
  maxPrice: 500,
  sortBy: 'price',
  sortOrder: 'asc',
  page: 1,
  limit: 20
});
```

---

### 5. Get Products by Category

**Endpoint:** `GET /api/category-products/category/:categoryId/products`

**Description:** Get all products in a specific category with pagination and sorting.

**Headers:**
```
None (Public endpoint)
```

**URL Parameters:**
- `categoryId`: Category's MongoDB ObjectId

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 20) |
| sortBy | String | No | Sort option (sortOrder, name, price-low, price-high, newest) |

**Example Requests:**
```
GET /api/category-products/category/64cat123abc/products
GET /api/category-products/category/64cat123abc/products?page=1&limit=20
GET /api/category-products/category/64cat123abc/products?sortBy=price-low
GET /api/category-products/category/64cat123abc/products?sortBy=name
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "category": {
    "id": "64cat123abc",
    "name": "Personal Care",
    "description": "Personal care and hygiene products"
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalProducts": 45,
    "hasNext": true,
    "hasPrev": false
  },
  "count": 20,
  "data": [
    {
      "id": "64prod123abc",
      "productName": "Dove Soap",
      "brandName": "Dove",
      "genericName": "Moisturizing Soap",
      "manufacturer": "Unilever",
      "images": [
        "https://s3.amazonaws.com/arogyaRx/category-products/image1.jpg"
      ],
      "description": "Gentle moisturizing soap",
      "pricing": {
        "mrp": 100,
        "sellingPrice": 85,
        "discount": 15
      },
      "stock": {
        "available": true,
        "quantity": 150
      },
      "category": "OTC",
      "prescriptionRequired": false,
      "sortOrder": 1
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**Frontend Integration:**
```javascript
const getProductsByCategory = async (categoryId, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.sortBy) queryParams.append('sortBy', options.sortBy);
    
    const response = await fetch(
      `http://localhost:5000/api/category-products/category/${categoryId}/products?${queryParams}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Usage
const products = await getProductsByCategory('64cat123abc', {
  page: 1,
  limit: 20,
  sortBy: 'price-low'
});
```

---

### 6. Get Product by ID in Category

**Endpoint:** `GET /api/category-products/categories/:categoryId/products/:productId`

**Description:** Get detailed information about a specific product within a category.

**Headers:**
```
None (Public endpoint)
```

**URL Parameters:**
- `categoryId`: Category's MongoDB ObjectId
- `productId`: Product's MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "64prod123abc",
    "category": {
      "_id": "64cat123abc",
      "name": "Personal Care"
    },
    "productDetails": {
      "productName": "Dove Soap",
      "brandName": "Dove",
      "genericName": "Moisturizing Soap",
      "manufacturer": "Unilever",
      "description": "Gentle moisturizing soap for all skin types. Enriched with 1/4 moisturizing cream.",
      "images": [
        "https://s3.amazonaws.com/arogyaRx/category-products/image1.jpg",
        "https://s3.amazonaws.com/arogyaRx/category-products/image2.jpg"
      ],
      "pricing": {
        "mrp": 100,
        "sellingPrice": 85,
        "discount": 15
      },
      "stock": {
        "available": true,
        "quantity": 150
      },
      "packaging": {
        "packSize": "100g",
        "expiryDate": "2025-12-31T00:00:00.000Z",
        "storageInstructions": "Store in a cool, dry place"
      },
      "category": "OTC",
      "prescriptionRequired": false
    },
    "sortOrder": 1,
    "isActive": true
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Product not found in this category"
}
```

**Frontend Integration:**
```javascript
const getProductDetails = async (categoryId, productId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/category-products/categories/${categoryId}/products/${productId}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// Usage
const product = await getProductDetails('64cat123abc', '64prod123abc');
console.log('Product:', product.data.productDetails.productName);
```

---

### 7. Search Products by Name

**Endpoint:** `GET /api/category-products/search`

**Description:** Search for products by name across all categories or within a specific category.

**Headers:**
```
None (Public endpoint)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | Yes | Search term (product name) |
| categoryId | String | No | Limit search to specific category |

**Example Requests:**
```
GET /api/category-products/search?name=soap
GET /api/category-products/search?name=dove
GET /api/category-products/search?name=soap&categoryId=64cat123abc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64prod123abc",
      "category": {
        "_id": "64cat123abc",
        "name": "Personal Care"
      },
      "productDetails": {
        "productName": "Dove Soap",
        "brandName": "Dove",
        "genericName": "Moisturizing Soap",
        "manufacturer": "Unilever",
        "images": [
          "https://s3.amazonaws.com/arogyaRx/category-products/image1.jpg"
        ],
        "pricing": {
          "mrp": 100,
          "sellingPrice": 85,
          "discount": 15
        },
        "stock": {
          "available": true,
          "quantity": 150
        }
      },
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Search query (name) is required"
}
```

**Frontend Integration:**
```javascript
const searchProducts = async (searchTerm, categoryId = null) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }
    
    const queryParams = new URLSearchParams({ name: searchTerm });
    if (categoryId) {
      queryParams.append('categoryId', categoryId);
    }
    
    const response = await fetch(
      `http://localhost:5000/api/category-products/search?${queryParams}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Usage
// Search all products
const allResults = await searchProducts('soap');

// Search within specific category
const categoryResults = await searchProducts('soap', '64cat123abc');
```

**React Search Component:**
```javascript
import React, { useState } from 'react';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/category-products/search?name=${encodeURIComponent(searchTerm)}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setResults([]);
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="search-results">
          <h3>Found {results.length} products</h3>
          {results.map(item => (
            <div key={item._id} className="result-item">
              <img 
                src={item.productDetails.images[0]} 
                alt={item.productDetails.productName} 
              />
              <div>
                <h4>{item.productDetails.productName}</h4>
                <p>{item.productDetails.brandName}</p>
                <p className="price">
                  ₹{item.productDetails.pricing.sellingPrice}
                </p>
                <p className="category">{item.category.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
```

---

## Complete Workflow Examples

### Browse Categories and Products
```javascript
// 1. Get all categories with product counts
const categories = await fetch(
  'http://localhost:5000/api/category-products/categories'
).then(r => r.json());

console.log('Categories:', categories.data);

// 2. Select a category and get its products
const categoryId = categories.data[0].id;
const products = await fetch(
  `http://localhost:5000/api/category-products/category/${categoryId}/products?sortBy=price-low`
).then(r => r.json());

console.log(`${products.count} products in ${products.category.name}`);

// 3. Get product details
const productId = products.data[0].id;
const productDetails = await fetch(
  `http://localhost:5000/api/category-products/categories/${categoryId}/products/${productId}`
).then(r => r.json());

console.log('Product details:', productDetails.data.productDetails);
```

### Advanced Product Filtering
```javascript
// Filter products with multiple criteria
const queryParams = new URLSearchParams({
  categoryId: '64cat123abc',
  inStock: 'true',
  minPrice: '50',
  maxPrice: '200',
  prescriptionRequired: 'false',
  sortBy: 'price',
  sortOrder: 'asc',
  page: '1',
  limit: '20'
});

const filteredProducts = await fetch(
  `http://localhost:5000/api/category-products/category/category-products?${queryParams}`
).then(r => r.json());

console.log('Filtered products:', filteredProducts.data);
console.log('Total pages:', filteredProducts.pagination.totalPages);
```

### Search and Filter Flow
```javascript
// 1. Search for products
const searchResults = await fetch(
  'http://localhost:5000/api/category-products/search?name=soap'
).then(r => r.json());

console.log(`Found ${searchResults.count} products matching "soap"`);

// 2. Get all products with advanced filters
const allProducts = await fetch(
  'http://localhost:5000/api/category-products/category/category-products?search=moisturizing&inStock=true&sortBy=price&sortOrder=asc'
).then(r => r.json());

console.log('Filtered search results:', allProducts.data);
```

---

## Summary

### Categories Endpoints:
- `GET /api/categories` - Get all active categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/category-products/categories` - Get categories with product counts

### Category Products Endpoints:
- `GET /api/category-products/category/category-products` - Get all products with advanced filtering
- `GET /api/category-products/category/:categoryId/products` - Get products by category
- `GET /api/category-products/categories/:categoryId/products/:productId` - Get product details
- `GET /api/category-products/search` - Search products by name

### Key Features:
✅ Browse categories with images  
✅ View product counts per category  
✅ Advanced product filtering (price, stock, prescription, manufacturer)  
✅ Multiple sorting options (price, name, newest)  
✅ Pagination support  
✅ Search by product name  
✅ Category-specific product browsing  
✅ Detailed product information  
✅ Stock availability checking  

---

**Last Updated:** January 2025  
**API Version:** 1.0
