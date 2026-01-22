# User Medicine APIs - Complete Guide

## Base URL
```
http://localhost:5000/api/medicines
```

**Note:** Some endpoints require authentication with Bearer token.

---

## Table of Contents
1. [Get All Medicines](#1-get-all-medicines)
2. [Get Medicines with Sorting](#2-get-medicines-with-sorting)
3. [Get Medicine by ID](#3-get-medicine-by-id)
4. [Search Medicine by Name](#4-search-medicine-by-name)
5. [Search Medicine by Generic Name](#5-search-medicine-by-generic-name)
6. [Check Prescription Requirement](#6-check-prescription-requirement)

---

## 1. Get All Medicines

**Endpoint:** `GET /api/medicines`

**Description:** Get all available medicines with optional filtering by category and prescription requirement.

**Headers:**
```
None (Public endpoint)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | String | No | Filter by medicine category |
| prescriptionRequired | Boolean | No | Filter by prescription requirement (true/false) |

**Example Requests:**
```
GET /api/medicines
GET /api/medicines?category=Antibiotics
GET /api/medicines?prescriptionRequired=true
GET /api/medicines?category=Pain Relief&prescriptionRequired=false
```

**Success Response (200 OK):**
```json
[
  {
    "_id": "64med123abc",
    "itemID": "MED001",
    "itemCode": "PAR500",
    "productName": "Paracetamol 500mg",
    "genericName": "Paracetamol",
    "brandName": "Crocin",
    "manufacturer": "GSK Pharmaceuticals",
    "category": "Pain Relief",
    "prescriptionRequired": false,
    "composition": {
      "activeIngredients": ["Paracetamol"],
      "inactiveIngredients": ["Starch", "Magnesium Stearate"]
    },
    "dosage": {
      "form": "Tablet",
      "strength": "500mg",
      "recommendedDosage": "1-2 tablets every 4-6 hours"
    },
    "pricing": {
      "mrp": 50,
      "rate": 40,
      "sellingPrice": 45,
      "discount": 10,
      "addLess": 0
    },
    "stock": {
      "available": true,
      "quantity": 500,
      "minOrderQuantity": 1,
      "maxOrderQuantity": 10
    },
    "tax": {
      "hsnCode": "30049099",
      "hsnName": "Medicaments",
      "localTax": 0,
      "sgst": 6,
      "cgst": 6,
      "centralTax": 0,
      "igst": 12,
      "oldTax": 10,
      "taxDiff": 2
    },
    "packaging": {
      "packSize": "10 tablets",
      "expiryDate": "2025-12-31T00:00:00.000Z",
      "storageInstructions": "Store below 25°C"
    },
    "regulatory": {
      "drugType": "Allopathic",
      "sideEffects": ["Rare: nausea", "allergic reactions"],
      "warnings": ["Do not exceed 8 tablets in 24 hours"],
      "contraindications": ["Severe liver disease"],
      "interactions": ["Alcohol"]
    },
    "images": [
      "https://s3.amazonaws.com/arogyaRx/medicines/image1.jpg",
      "https://s3.amazonaws.com/arogyaRx/medicines/image2.jpg"
    ],
    "description": "Effective pain relief and fever reducer",
    "totalSold": 1250,
    "totalViews": 5600,
    "lastSoldAt": "2024-01-20T10:00:00.000Z",
    "lastViewedAt": "2024-01-22T08:30:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Frontend Integration:**
```javascript
const getAllMedicines = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.prescriptionRequired !== undefined) {
      queryParams.append('prescriptionRequired', filters.prescriptionRequired);
    }
    
    const response = await fetch(
      `http://localhost:5000/api/medicines?${queryParams}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }
};

// Usage
const allMedicines = await getAllMedicines();
const antibiotics = await getAllMedicines({ category: 'Antibiotics' });
const nonPrescription = await getAllMedicines({ prescriptionRequired: false });
```

**React Component Example:**
```javascript
import React, { useState, useEffect } from 'react';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    prescriptionRequired: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, [filters]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.prescriptionRequired !== '') {
        queryParams.append('prescriptionRequired', filters.prescriptionRequired);
      }

      const response = await fetch(
        `http://localhost:5000/api/medicines?${queryParams}`
      );
      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading medicines...</div>;

  return (
    <div className="medicine-list">
      <h2>Medicines</h2>
      
      {/* Filters */}
      <div className="filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="Pain Relief">Pain Relief</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Vitamins">Vitamins</option>
        </select>

        <select
          value={filters.prescriptionRequired}
          onChange={(e) => setFilters({...filters, prescriptionRequired: e.target.value})}
        >
          <option value="">All Medicines</option>
          <option value="false">No Prescription Required</option>
          <option value="true">Prescription Required</option>
        </select>
      </div>

      {/* Medicine Grid */}
      <div className="medicine-grid">
        {medicines.map(medicine => (
          <div key={medicine._id} className="medicine-card">
            <img 
              src={medicine.images[0] || '/placeholder.png'} 
              alt={medicine.productName}
            />
            <h3>{medicine.productName}</h3>
            <p className="brand">{medicine.brandName}</p>
            <p className="price">
              ₹{medicine.pricing.sellingPrice}
              {medicine.pricing.discount > 0 && (
                <span className="mrp">₹{medicine.pricing.mrp}</span>
              )}
            </p>
            {medicine.prescriptionRequired && (
              <span className="prescription-badge">Rx Required</span>
            )}
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineList;
```

---

## 2. Get Medicines with Sorting

**Endpoint:** `GET /api/medicines/public`

**Description:** Get all medicines with sorting options (public endpoint, no authentication required).

**Headers:**
```
None (Public endpoint)
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sortBy | String | No | Sort option (see below) |

**Sort Options:**
- `newest` - Newest first (default)
- `a-z` - Alphabetical A-Z
- `z-a` - Alphabetical Z-A
- `low-high` - Price low to high
- `high-low` - Price high to low
- `low-stock` - Low stock first
- `high-stock` - High stock first

**Example Requests:**
```
GET /api/medicines/public
GET /api/medicines/public?sortBy=a-z
GET /api/medicines/public?sortBy=low-high
GET /api/medicines/public?sortBy=newest
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 150,
  "sortBy": "low-high",
  "data": [
    {
      "_id": "64med123abc",
      "itemID": "MED001",
      "itemCode": "PAR500",
      "productName": "Paracetamol 500mg",
      "genericName": "Paracetamol",
      "brandName": "Crocin",
      "manufacturer": "GSK Pharmaceuticals",
      "pricing": {
        "mrp": 50,
        "rate": 40,
        "sellingPrice": 45,
        "discount": 10,
        "addLess": 0
      },
      "stock": {
        "available": true,
        "quantity": 500
      },
      "tax": {
        "hsnCode": "30049099",
        "hsnName": "Medicaments",
        "sgst": 6,
        "cgst": 6,
        "igst": 12
      },
      "images": ["https://s3.amazonaws.com/..."],
      "prescriptionRequired": false
    }
  ]
}
```

**Frontend Integration:**
```javascript
const getMedicinesWithSort = async (sortBy = 'newest') => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/medicines/public?sortBy=${sortBy}`
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }
};

// Usage
const newestMedicines = await getMedicinesWithSort('newest');
const cheapestFirst = await getMedicinesWithSort('low-high');
const alphabetical = await getMedicinesWithSort('a-z');
```

---

## 3. Get Medicine by ID

**Endpoint:** `GET /api/medicines/:id`

**Description:** Get detailed information about a specific medicine.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Medicine's MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "_id": "64med123abc",
  "itemID": "MED001",
  "itemCode": "PAR500",
  "productName": "Paracetamol 500mg",
  "genericName": "Paracetamol",
  "brandName": "Crocin",
  "manufacturer": "GSK Pharmaceuticals",
  "category": "Pain Relief",
  "prescriptionRequired": false,
  "composition": {
    "activeIngredients": ["Paracetamol"],
    "inactiveIngredients": ["Starch", "Magnesium Stearate"]
  },
  "dosage": {
    "form": "Tablet",
    "strength": "500mg",
    "recommendedDosage": "Every 4-6 hours as needed"
  },
  "pricing": {
    "mrp": 50,
    "rate": 40,
    "sellingPrice": 45,
    "discount": 10,
    "addLess": 0
  },
  "stock": {
    "available": true,
    "quantity": 500,
    "minOrderQuantity": 1,
    "maxOrderQuantity": 10
  },
  "tax": {
    "hsnCode": "30049099",
    "hsnName": "Medicaments",
    "localTax": 0,
    "sgst": 6,
    "cgst": 6,
    "centralTax": 0,
    "igst": 12,
    "oldTax": 10,
    "taxDiff": 2
  },
  "packaging": {
    "packSize": "10 tablets",
    "expiryDate": "2025-12-31T00:00:00.000Z",
    "storageInstructions": "Store below 25°C in a dry place"
  },
  "regulatory": {
    "drugType": "Allopathic",
    "sideEffects": ["Rare: nausea", "allergic reactions", "skin rash"],
    "warnings": ["Do not use if allergic to paracetamol", "Consult doctor if pregnant or breastfeeding"],
    "contraindications": ["Severe liver disease", "alcohol dependence"],
    "interactions": ["Alcohol", "Warfarin"]
  },
  "images": [
    "https://s3.amazonaws.com/arogyaRx/medicines/image1.jpg",
    "https://s3.amazonaws.com/arogyaRx/medicines/image2.jpg"
  ],
  "description": "Effective pain relief and fever reducer for adults and children",
  "additionalFeatures": {
    "alternativeMedicines": [],
    "userReviews": [],
    "faqs": [],
    "doctorAdvice": "Safe for most adults when taken as directed"
  },
  "totalSold": 1250,
  "totalViews": 5600,
  "lastSoldAt": "2024-01-20T10:00:00.000Z",
  "lastViewedAt": "2024-01-22T08:30:00.000Z",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Medicine not found"
}
```

**Frontend Integration:**
```javascript
const getMedicineById = async (medicineId) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(
      `http://localhost:5000/api/medicines/${medicineId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Medicine not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching medicine:', error);
    throw error;
  }
};

// Usage
const medicine = await getMedicineById('64med123abc');
console.log('Medicine details:', medicine);
```

---

## 4. Search Medicine by Name

**Endpoint:** `GET /api/medicines/name/:name`

**Description:** Search medicines by product name (case-insensitive).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `name`: Search term (minimum 1 character)

**Example Requests:**
```
GET /api/medicines/name/paracetamol
GET /api/medicines/name/croc
GET /api/medicines/name/aspirin
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "searchTerm": "paracetamol",
  "data": [
    {
      "_id": "64med123abc",
      "productName": "Paracetamol 500mg",
      "genericName": "Paracetamol",
      "brandName": "Crocin",
      "manufacturer": "GSK Pharmaceuticals",
      "pricing": {
        "mrp": 50,
        "sellingPrice": 45
      },
      "images": ["https://s3.amazonaws.com/..."],
      "prescriptionRequired": false
    },
    {
      "_id": "64med456def",
      "productName": "Paracetamol 650mg",
      "genericName": "Paracetamol",
      "brandName": "Dolo",
      "manufacturer": "Micro Labs",
      "pricing": {
        "mrp": 30,
        "sellingPrice": 28
      },
      "images": ["https://s3.amazonaws.com/..."],
      "prescriptionRequired": false
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Medicine name is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "No medicines found matching the search term",
  "searchTerm": "xyz"
}
```

**Frontend Integration:**
```javascript
const searchMedicineByName = async (searchTerm) => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }
    
    const response = await fetch(
      `http://localhost:5000/api/medicines/name/${encodeURIComponent(searchTerm)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error searching medicine:', error);
    throw error;
  }
};

// Usage
const results = await searchMedicineByName('paracetamol');
console.log(`Found ${results.count} medicines`);
```

**React Search Component:**
```javascript
import React, { useState } from 'react';

const MedicineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await fetch(
        `http://localhost:5000/api/medicines/name/${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
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
    <div className="medicine-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="search-results">
          <h3>Found {results.length} medicines</h3>
          {results.map(medicine => (
            <div key={medicine._id} className="result-item">
              <img src={medicine.images[0]} alt={medicine.productName} />
              <div>
                <h4>{medicine.productName}</h4>
                <p>{medicine.brandName} - {medicine.manufacturer}</p>
                <p className="price">₹{medicine.pricing.sellingPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;
```

---

## 5. Search Medicine by Generic Name

**Endpoint:** `GET /api/medicines/generic/:genericName`

**Description:** Search medicines by generic/salt name. Returns all brands containing that generic ingredient.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `genericName`: Generic name to search (e.g., "Paracetamol", "Ibuprofen")

**Example Requests:**
```
GET /api/medicines/generic/paracetamol
GET /api/medicines/generic/ibuprofen
GET /api/medicines/generic/amoxicillin
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "searchTerm": "paracetamol",
  "groupedByBrand": {
    "Crocin": [
      {
        "_id": "64med123abc",
        "productName": "Paracetamol 500mg",
        "genericName": "Paracetamol",
        "brandName": "Crocin",
        "manufacturer": "GSK Pharmaceuticals",
        "pricing": {
          "mrp": 50,
          "sellingPrice": 45
        }
      }
    ],
    "Dolo": [
      {
        "_id": "64med456def",
        "productName": "Paracetamol 650mg",
        "genericName": "Paracetamol",
        "brandName": "Dolo",
        "manufacturer": "Micro Labs",
        "pricing": {
          "mrp": 30,
          "sellingPrice": 28
        }
      }
    ]
  },
  "data": [
    {
      "_id": "64med123abc",
      "productName": "Paracetamol 500mg",
      "genericName": "Paracetamol",
      "brandName": "Crocin",
      "category": "Pain Relief"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Generic name is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "No medicines found with this generic name",
  "searchTerm": "xyz"
}
```

**Frontend Integration:**
```javascript
const searchByGenericName = async (genericName) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch(
      `http://localhost:5000/api/medicines/generic/${encodeURIComponent(genericName)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return await response.json();
  } catch (error) {
    console.error('Error searching by generic name:', error);
    throw error;
  }
};

// Usage - Find all paracetamol brands
const paracetamolBrands = await searchByGenericName('paracetamol');
console.log('Available brands:', Object.keys(paracetamolBrands.groupedByBrand));
```

---

## 6. Check Prescription Requirement

**Endpoint:** `GET /api/medicines/check-prescription/:id`

**Description:** Check if a specific medicine requires a prescription (public endpoint).

**Headers:**
```
None (Public endpoint)
```

**URL Parameters:**
- `id`: Medicine's MongoDB ObjectId

**Success Response (200 OK):**
```json
{
  "prescriptionRequired": true
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Medicine not found"
}
```

**Frontend Integration:**
```javascript
const checkPrescriptionRequired = async (medicineId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/medicines/check-prescription/${medicineId}`
    );
    
    const data = await response.json();
    return data.prescriptionRequired;
  } catch (error) {
    console.error('Error checking prescription:', error);
    throw error;
  }
};

// Usage - Check before adding to cart
const addToCart = async (medicineId) => {
  const requiresPrescription = await checkPrescriptionRequired(medicineId);
  
  if (requiresPrescription) {
    alert('This medicine requires a prescription. Please upload your prescription.');
    // Show prescription upload dialog
  } else {
    // Add to cart directly
    console.log('Adding to cart...');
  }
};
```

---

## Complete Workflow Examples

### Browse and Search Medicines
```javascript
// 1. Get all medicines
const allMedicines = await fetch('http://localhost:5000/api/medicines')
  .then(r => r.json());

// 2. Get medicines sorted by price
const cheapMedicines = await fetch('http://localhost:5000/api/medicines/public?sortBy=low-high')
  .then(r => r.json());

// 3. Filter by category
const painRelief = await fetch('http://localhost:5000/api/medicines?category=Pain Relief')
  .then(r => r.json());

// 4. Search by name
const token = localStorage.getItem('userToken');
const searchResults = await fetch('http://localhost:5000/api/medicines/name/paracetamol', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 5. Get medicine details
const medicineDetails = await fetch(`http://localhost:5000/api/medicines/${medicineId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 6. Check prescription requirement
const needsPrescription = await fetch(
  `http://localhost:5000/api/medicines/check-prescription/${medicineId}`
).then(r => r.json());
```

### Medicine Comparison Flow
```javascript
const token = localStorage.getItem('userToken');

// 1. Search for generic medicine
const genericResults = await fetch(
  'http://localhost:5000/api/medicines/generic/paracetamol',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());

// 2. Compare prices across brands
const brands = genericResults.groupedByBrand;
const comparison = Object.keys(brands).map(brandName => {
  const medicines = brands[brandName];
  return {
    brand: brandName,
    cheapest: Math.min(...medicines.map(m => m.pricing.sellingPrice)),
    options: medicines.length
  };
});

console.log('Price comparison:', comparison);

// 3. Get detailed info for selected medicine
const selectedId = genericResults.data[0]._id;
const details = await fetch(`http://localhost:5000/api/medicines/${selectedId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

## Summary

### Public Endpoints (No Authentication):
- `GET /api/medicines` - Get all medicines with filters
- `GET /api/medicines/public` - Get medicines with sorting
- `GET /api/medicines/check-prescription/:id` - Check prescription requirement

### Authenticated Endpoints (Require Token):
- `GET /api/medicines/:id` - Get medicine by ID
- `GET /api/medicines/name/:name` - Search by name
- `GET /api/medicines/generic/:genericName` - Search by generic name

### Key Features:
✅ Browse all medicines with filtering  
✅ Sort by price, name, stock  
✅ Search by product name or generic name  
✅ Detailed medicine information  
✅ Prescription requirement check  
✅ Brand comparison for generic medicines  
✅ Category-based filtering  
✅ Stock availability information  

---

**Last Updated:** January 2025  
**API Version:** 1.0
