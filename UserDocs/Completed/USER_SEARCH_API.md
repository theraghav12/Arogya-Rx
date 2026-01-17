# User Unified Search API - Complete Guide

## Base URL
```
http://localhost:5000/api/search
```

**Note:** This endpoint is public and does not require authentication.

---

## Table of Contents
1. [Unified Search](#1-unified-search)
2. [Search by Type](#2-search-by-type)
3. [Search Examples](#3-search-examples)

---

## Overview

The unified search API allows you to search across multiple product types simultaneously:
- **Medicines** - Prescription and OTC medicines
- **Lab Tests** - Laboratory tests and diagnostics
- **Category Products** - Personal care, baby care, etc.
- **Categories** - Product categories
- **Doctors** - Healthcare professionals

---

## 1. Unified Search

**Endpoint:** `GET /api/search`

**Description:** Search across all product types (medicines, lab tests, category products, categories, and doctors).

**Headers:**
```
None (Public endpoint)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | String | Yes | Search query string |
| limit | Number | No | Results per category (default: 10) |
| types | String | No | Comma-separated types to search (see below) |

**Available Types:**
- `medicine` - Search medicines only
- `labtest` - Search lab tests only
- `categoryproduct` - Search category products only
- `category` - Search categories only
- `doctor` - Search doctors only

**Example Requests:**
```
GET /api/search?q=paracetamol
GET /api/search?q=blood test&limit=5
GET /api/search?q=soap&types=medicine,categoryproduct
GET /api/search?q=diabetes&types=labtest,doctor
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "query": "paracetamol",
  "totalResults": 15,
  "results": {
    "medicines": {
      "count": 5,
      "data": [
        {
          "id": "64med123abc",
          "type": "medicine",
          "name": "Paracetamol 500mg",
          "genericName": "Paracetamol",
          "brandName": "Crocin",
          "manufacturer": "GSK Pharmaceuticals",
          "description": "Effective pain relief and fever reducer",
          "category": "Pain Relief",
          "images": [
            "https://s3.amazonaws.com/arogyaRx/medicines/image1.jpg"
          ],
          "pricing": {
            "mrp": 50,
            "sellingPrice": 45,
            "discount": 10
          },
          "stock": {
            "available": true,
            "quantity": 100
          },
          "packaging": {
            "packSize": "10 tablets",
            "expiryDate": "2025-12-31T00:00:00.000Z"
          },
          "productType": "medicine"
        }
      ]
    },
    "labTests": {
      "count": 3,
      "data": [
        {
          "id": "64lab789ghi",
          "type": "labTest",
          "name": "Complete Blood Count (CBC)",
          "testCode": "CBC001",
          "category": "Blood Tests",
          "description": "Comprehensive blood analysis",
          "price": 500,
          "discount": 10,
          "discountedPrice": 450,
          "isHomeCollectionAvailable": true,
          "homeCollectionPrice": 100,
          "isPopular": true,
          "isRecommended": false,
          "productType": "labTest"
        }
      ]
    },
    "categoryProducts": {
      "count": 4,
      "data": [
        {
          "id": "64prod456def",
          "type": "categoryProduct",
          "name": "Dove Soap",
          "brandName": "Dove",
          "genericName": "Moisturizing Soap",
          "manufacturer": "Unilever",
          "description": "Gentle moisturizing soap",
          "images": [
            "https://s3.amazonaws.com/arogyaRx/category-products/image1.jpg"
          ],
          "category": {
            "_id": "64cat123abc",
            "name": "Personal Care",
            "slug": "personal-care",
            "image": {
              "url": "https://s3.amazonaws.com/..."
            }
          },
          "pricing": {
            "mrp": 100,
            "sellingPrice": 85,
            "discount": 15
          },
          "stock": {
            "available": true,
            "quantity": 50
          },
          "packaging": {
            "packSize": "100g"
          },
          "productType": "categoryProduct"
        }
      ]
    },
    "categories": {
      "count": 2,
      "data": [
        {
          "id": "64cat123abc",
          "type": "category",
          "name": "Personal Care",
          "description": "Personal care and hygiene products",
          "slug": "personal-care",
          "image": {
            "url": "https://s3.amazonaws.com/arogyaRx/categories/image1.jpg",
            "key": "arogyaRx/categories/image1.jpg"
          },
          "isActive": true,
          "parentCategory": null,
          "sortOrder": 1
        }
      ]
    },
    "doctors": {
      "count": 1,
      "data": [
        {
          "id": "64doc987xyz",
          "type": "doctor",
          "name": "Dr. Rajesh Kumar",
          "email": "dr.rajesh@example.com",
          "contact": "9876543210",
          "specialization": "General Physician",
          "qualification": "MBBS, MD",
          "experience": 10,
          "fee": 500,
          "consultationType": ["In-Person", "Video"],
          "bio": "Experienced general physician with 10 years of practice",
          "profileImage": "https://s3.amazonaws.com/arogyaRx/doctors/profile.jpg",
          "address": {
            "street": "123 Medical Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "postalCode": "400001"
          },
          "isActive": true,
          "isVerified": true
        }
      ]
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Search query is required"
}
```

**Frontend Integration:**
```javascript
const unifiedSearch = async (query, options = {}) => {
  try {
    const queryParams = new URLSearchParams({
      q: query,
      ...options
    });
    
    const response = await fetch(
      `http://localhost:5000/api/search?${queryParams}`
    );

    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

// Usage Examples

// Search all types
const allResults = await unifiedSearch('paracetamol');

// Search with limit
const limitedResults = await unifiedSearch('blood test', { limit: 5 });

// Search specific types only
const medicineResults = await unifiedSearch('aspirin', { 
  types: 'medicine,categoryproduct' 
});

// Search doctors
const doctorResults = await unifiedSearch('cardiologist', { 
  types: 'doctor' 
});
```

---

## 2. Search by Type

### Search Medicines Only

**Request:**
```
GET /api/search?q=paracetamol&types=medicine
```

**Response:**
```json
{
  "success": true,
  "query": "paracetamol",
  "totalResults": 5,
  "results": {
    "medicines": {
      "count": 5,
      "data": [...]
    },
    "labTests": {
      "count": 0,
      "data": []
    },
    "categoryProducts": {
      "count": 0,
      "data": []
    },
    "categories": {
      "count": 0,
      "data": []
    },
    "doctors": {
      "count": 0,
      "data": []
    }
  }
}
```

### Search Lab Tests Only

**Request:**
```
GET /api/search?q=blood&types=labtest
```

**Response:**
```json
{
  "success": true,
  "query": "blood",
  "totalResults": 8,
  "results": {
    "medicines": {
      "count": 0,
      "data": []
    },
    "labTests": {
      "count": 8,
      "data": [
        {
          "id": "64lab789ghi",
          "type": "labTest",
          "name": "Complete Blood Count (CBC)",
          "testCode": "CBC001",
          "category": "Blood Tests",
          "price": 500,
          "discountedPrice": 450,
          "isHomeCollectionAvailable": true
        }
      ]
    },
    "categoryProducts": {
      "count": 0,
      "data": []
    },
    "categories": {
      "count": 0,
      "data": []
    },
    "doctors": {
      "count": 0,
      "data": []
    }
  }
}
```

### Search Category Products Only

**Request:**
```
GET /api/search?q=soap&types=categoryproduct
```

### Search Categories Only

**Request:**
```
GET /api/search?q=personal&types=category
```

### Search Doctors Only

**Request:**
```
GET /api/search?q=cardiologist&types=doctor
```

---

## 3. Search Examples

### React Search Component

```javascript
import React, { useState, useEffect } from 'react';

const UnifiedSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ q: query });
      
      if (selectedTypes.length > 0) {
        queryParams.append('types', selectedTypes.join(','));
      }
      
      const response = await fetch(
        `http://localhost:5000/api/search?${queryParams}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="unified-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search medicines, lab tests, products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        <div className="type-filters">
          <label>
            <input
              type="checkbox"
              checked={selectedTypes.includes('medicine')}
              onChange={() => toggleType('medicine')}
            />
            Medicines
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedTypes.includes('labtest')}
              onChange={() => toggleType('labtest')}
            />
            Lab Tests
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedTypes.includes('categoryproduct')}
              onChange={() => toggleType('categoryproduct')}
            />
            Products
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedTypes.includes('doctor')}
              onChange={() => toggleType('doctor')}
            />
            Doctors
          </label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results && (
        <div className="search-results">
          <h3>Found {
            results.medicines.count + 
            results.labTests.count + 
            results.categoryProducts.count + 
            results.categories.count + 
            results.doctors.count
          } results</h3>

          {/* Medicines */}
          {results.medicines.count > 0 && (
            <div className="result-section">
              <h4>Medicines ({results.medicines.count})</h4>
              {results.medicines.data.map(item => (
                <div key={item.id} className="result-item">
                  <img src={item.images[0]} alt={item.name} />
                  <div>
                    <h5>{item.name}</h5>
                    <p>{item.brandName} - {item.manufacturer}</p>
                    <p className="price">₹{item.pricing.sellingPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lab Tests */}
          {results.labTests.count > 0 && (
            <div className="result-section">
              <h4>Lab Tests ({results.labTests.count})</h4>
              {results.labTests.data.map(item => (
                <div key={item.id} className="result-item">
                  <div>
                    <h5>{item.name}</h5>
                    <p>{item.description}</p>
                    <p className="price">
                      ₹{item.discountedPrice}
                      {item.discount > 0 && (
                        <span className="original">₹{item.price}</span>
                      )}
                    </p>
                    {item.isHomeCollectionAvailable && (
                      <span className="badge">Home Collection Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Category Products */}
          {results.categoryProducts.count > 0 && (
            <div className="result-section">
              <h4>Products ({results.categoryProducts.count})</h4>
              {results.categoryProducts.data.map(item => (
                <div key={item.id} className="result-item">
                  <img src={item.images[0]} alt={item.name} />
                  <div>
                    <h5>{item.name}</h5>
                    <p>{item.brandName}</p>
                    <p className="category">{item.category?.name}</p>
                    <p className="price">₹{item.pricing.sellingPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Doctors */}
          {results.doctors.count > 0 && (
            <div className="result-section">
              <h4>Doctors ({results.doctors.count})</h4>
              {results.doctors.data.map(item => (
                <div key={item.id} className="result-item">
                  <img src={item.profileImage} alt={item.name} />
                  <div>
                    <h5>{item.name}</h5>
                    <p>{item.specialization}</p>
                    <p>{item.qualification}</p>
                    <p>Experience: {item.experience} years</p>
                    <p className="fee">Consultation Fee: ₹{item.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;
```

### Autocomplete Search

```javascript
const AutocompleteSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&limit=5`
        );
        
        const data = await response.json();
        
        if (data.success) {
          // Combine all results for suggestions
          const allSuggestions = [
            ...data.results.medicines.data,
            ...data.results.labTests.data,
            ...data.results.categoryProducts.data
          ];
          
          setSuggestions(allSuggestions);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div className="autocomplete-search">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {loading && <div className="loading">Searching...</div>}
      
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(item => (
            <div key={item.id} className="suggestion-item">
              <span className="type-badge">{item.type}</span>
              <span className="name">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Advanced Search with Filters

```javascript
const AdvancedSearch = () => {
  const [filters, setFilters] = useState({
    query: '',
    types: [],
    limit: 10
  });
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    const queryParams = new URLSearchParams({
      q: filters.query,
      limit: filters.limit
    });
    
    if (filters.types.length > 0) {
      queryParams.append('types', filters.types.join(','));
    }
    
    const response = await fetch(
      `http://localhost:5000/api/search?${queryParams}`
    );
    
    const data = await response.json();
    setResults(data);
  };

  return (
    <div className="advanced-search">
      <input
        type="text"
        value={filters.query}
        onChange={(e) => setFilters({...filters, query: e.target.value})}
        placeholder="Search..."
      />
      
      <select
        multiple
        value={filters.types}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, opt => opt.value);
          setFilters({...filters, types: selected});
        }}
      >
        <option value="medicine">Medicines</option>
        <option value="labtest">Lab Tests</option>
        <option value="categoryproduct">Products</option>
        <option value="category">Categories</option>
        <option value="doctor">Doctors</option>
      </select>
      
      <input
        type="number"
        value={filters.limit}
        onChange={(e) => setFilters({...filters, limit: e.target.value})}
        placeholder="Results per category"
        min="1"
        max="50"
      />
      
      <button onClick={handleSearch}>Search</button>
      
      {results && (
        <div className="results">
          <p>Total Results: {results.totalResults}</p>
          {/* Display results */}
        </div>
      )}
    </div>
  );
};
```

---

## Complete Workflow Example

```javascript
// 1. Simple search across all types
const searchAll = async (query) => {
  const response = await fetch(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`
  );
  return await response.json();
};

// 2. Search specific types
const searchMedicines = async (query) => {
  const response = await fetch(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&types=medicine`
  );
  return await response.json();
};

// 3. Search with limit
const searchWithLimit = async (query, limit) => {
  const response = await fetch(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return await response.json();
};

// 4. Search multiple specific types
const searchMedicinesAndTests = async (query) => {
  const response = await fetch(
    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&types=medicine,labtest`
  );
  return await response.json();
};

// Usage
const results1 = await searchAll('paracetamol');
const results2 = await searchMedicines('aspirin');
const results3 = await searchWithLimit('blood test', 5);
const results4 = await searchMedicinesAndTests('diabetes');

console.log('Total results:', results1.totalResults);
console.log('Medicines found:', results1.results.medicines.count);
console.log('Lab tests found:', results1.results.labTests.count);
```

---

## Summary

### Endpoint:
- `GET /api/search` - Unified search across all product types

### Searchable Fields:

**Medicines:**
- Product name, generic name, brand name
- Description, manufacturer

**Lab Tests:**
- Test name, test code
- Description, category

**Category Products:**
- Product name, brand name, generic name
- Description, manufacturer

**Categories:**
- Name, description, slug

**Doctors:**
- Name, specialization, qualification
- Bio

### Key Features:
✅ Search across multiple product types  
✅ Filter by specific types  
✅ Limit results per category  
✅ Case-insensitive search  
✅ Regex-based matching  
✅ Public endpoint (no authentication required)  
✅ Comprehensive product details  
✅ Category information included  
✅ Stock availability filtering  

### Response Structure:
- Separate sections for each product type
- Count of results per type
- Total results count
- Detailed product information
- Images and pricing included

---

**Last Updated:** January 2025  
**API Version:** 1.0
