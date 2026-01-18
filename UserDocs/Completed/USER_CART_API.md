# User Cart APIs - Complete Guide

## Base URL
```
http://localhost:5000/api/cart
```

**Note:** All endpoints require authentication with Bearer token.

---

## Table of Contents
1. [Add Item to Cart](#1-add-item-to-cart)
2. [Get Cart](#2-get-cart)
3. [Update Item Quantity](#3-update-item-quantity)
4. [Remove Item from Cart](#4-remove-item-from-cart)
5. [Clear Cart](#5-clear-cart)

---

## Overview

The cart system supports three types of products:
- **Medicines** - Regular medicines from the medicine catalog
- **Category Products** - Products from category-based catalog
- **Lab Tests** - Laboratory tests with optional home collection

---

## 1. Add Item to Cart

**Endpoint:** `POST /api/cart/add`

**Description:** Add a medicine, category product, or lab test to cart.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Adding a Medicine

**Request Body:**
```json
{
  "medicineId": "64med123abc",
  "quantity": 2
}
```

**Success Response (200 OK):**
```json
{
  "message": "medicine added to cart successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [
      {
        "productType": "medicine",
        "medicineId": "64med123abc",
        "quantity": 2,
        "price": 45,
        "isHomeCollection": false,
        "homeCollectionPrice": 0,
        "_id": "64item123"
      }
    ],
    "totalPrice": 90
  },
  "addedItem": {
    "productType": "medicine",
    "medicineId": "64med123abc",
    "quantity": 2,
    "price": 45
  }
}
```

### Adding a Category Product

**Request Body:**
```json
{
  "categoryProductId": "64prod456def",
  "quantity": 1
}
```

**Success Response (200 OK):**
```json
{
  "message": "categoryProduct added to cart successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [
      {
        "productType": "categoryProduct",
        "categoryProductId": "64prod456def",
        "quantity": 1,
        "price": 85,
        "_id": "64item456"
      }
    ],
    "totalPrice": 85
  }
}
```

### Adding a Lab Test (Without Home Collection)

**Request Body:**
```json
{
  "labTestId": "64lab789ghi",
  "quantity": 1,
  "isHomeCollection": false
}
```

### Adding a Lab Test (With Home Collection)

**Request Body:**
```json
{
  "labTestId": "64lab789ghi",
  "quantity": 1,
  "isHomeCollection": true,
  "preferredDate": "2025-01-20",
  "preferredSlot": {
    "start": "09:00",
    "end": "11:00"
  },
  "labTestPatientDetails": {
    "name": "John Doe",
    "phone": "9876543210",
    "gender": "Male",
    "age": 30,
    "disease": "Routine checkup"
  }
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicineId | String | Conditional | Medicine ID |
| categoryProductId | String | Conditional | Category product ID |
| labTestId | String | Conditional | Lab test ID |
| quantity | Number | Yes | Quantity (minimum 1) |
| isHomeCollection | Boolean | No | Enable home collection (default: false) |
| preferredDate | String | Conditional | Required if isHomeCollection=true (YYYY-MM-DD) |
| preferredSlot | Object | Conditional | Required if isHomeCollection=true |
| preferredSlot.start | String | Conditional | Start time (HH:MM 24-hour) |
| preferredSlot.end | String | Conditional | End time (HH:MM 24-hour) |
| labTestPatientDetails | Object | No | Patient details for lab test |

**Success Response (200 OK) - Lab Test:**
```json
{
  "message": "labTest added to cart successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [
      {
        "productType": "labTest",
        "labTestId": "64lab789ghi",
        "quantity": 1,
        "price": 500,
        "isHomeCollection": true,
        "homeCollectionPrice": 100,
        "preferredDate": "2025-01-20T00:00:00.000Z",
        "preferredSlot": {
          "start": "09:00",
          "end": "11:00"
        },
        "labTestPatientDetails": {
          "name": "John Doe",
          "phone": "9876543210",
          "gender": "Male",
          "age": 30,
          "disease": "Routine checkup"
        },
        "_id": "64item789"
      }
    ],
    "totalPrice": 600
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Product ID:**
```json
{
  "message": "One of medicineId, categoryProductId, or labTestId is required"
}
```

**400 Bad Request - Invalid Quantity:**
```json
{
  "message": "Quantity must be at least 1"
}
```

**400 Bad Request - Out of Stock:**
```json
{
  "message": "Only 5 units available in stock"
}
```

**400 Bad Request - Item Already in Cart:**
```json
{
  "message": "medicine already exists in cart. Use update quantity instead."
}
```

**400 Bad Request - Missing Time Slot:**
```json
{
  "message": "preferredDate and preferredSlot (start and end) are required for home collection"
}
```

**400 Bad Request - Past Date:**
```json
{
  "message": "Preferred date cannot be in the past"
}
```

**400 Bad Request - Invalid Time Format:**
```json
{
  "message": "Time slot must be in HH:MM format (24-hour)"
}
```

**400 Bad Request - Invalid Time Range:**
```json
{
  "message": "End time must be after start time"
}
```

**404 Not Found:**
```json
{
  "message": "Medicine not found"
}
```

**Frontend Integration:**
```javascript
const addToCart = async (itemData) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

// Usage Examples
await addToCart({ medicineId: '64med123abc', quantity: 2 });
await addToCart({ categoryProductId: '64prod456def', quantity: 1 });
await addToCart({
  labTestId: '64lab789ghi',
  quantity: 1,
  isHomeCollection: true,
  preferredDate: '2025-01-20',
  preferredSlot: { start: '09:00', end: '11:00' },
  labTestPatientDetails: {
    name: 'John Doe',
    phone: '9876543210',
    gender: 'Male',
    age: 30
  }
});
```

---

## 2. Get Cart

**Endpoint:** `GET /api/cart`

**Description:** Get user's cart with all items and populated product details.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Cart retrieved successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [
      {
        "productType": "medicine",
        "medicineId": {
          "_id": "64med123abc",
          "productName": "Paracetamol 500mg",
          "brandName": "Crocin",
          "images": ["https://s3.amazonaws.com/..."],
          "pricing": {
            "mrp": 50,
            "sellingPrice": 45,
            "discount": 10
          },
          "inventory": {
            "stockQuantity": 100
          },
          "prescriptionRequired": false
        },
        "quantity": 2,
        "price": 45,
        "_id": "64item123"
      },
      {
        "productType": "categoryProduct",
        "categoryProductId": {
          "_id": "64prod456def",
          "productDetails": {
            "productName": "Dove Soap",
            "brandName": "Dove",
            "images": ["https://s3.amazonaws.com/..."],
            "pricing": {
              "mrp": 100,
              "sellingPrice": 85
            },
            "stock": {
              "available": true,
              "quantity": 50
            }
          }
        },
        "quantity": 1,
        "price": 85,
        "_id": "64item456"
      },
      {
        "productType": "labTest",
        "labTestId": {
          "_id": "64lab789ghi",
          "testName": "Complete Blood Count (CBC)",
          "price": 500,
          "discountedPrice": 450,
          "isHomeCollectionAvailable": true,
          "homeCollectionPrice": 100
        },
        "quantity": 1,
        "price": 450,
        "isHomeCollection": true,
        "homeCollectionPrice": 100,
        "preferredDate": "2025-01-20T00:00:00.000Z",
        "preferredSlot": {
          "start": "09:00",
          "end": "11:00"
        },
        "labTestPatientDetails": {
          "name": "John Doe",
          "phone": "9876543210",
          "gender": "Male",
          "age": 30
        },
        "_id": "64item789"
      }
    ],
    "totalPrice": 725
  },
  "totalItems": 3,
  "totalPrice": 725
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Cart is empty"
}
```

**Frontend Integration:**
```javascript
const getCart = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Usage
const cartData = await getCart();
console.log(`Cart has ${cartData.totalItems} items`);
console.log(`Total: ₹${cartData.totalPrice}`);
```

---

## 3. Update Item Quantity

**Endpoint:** `PUT /api/cart/update-quantity`

**Description:** Update the quantity of an item in the cart.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Update Medicine Quantity

**Request Body:**
```json
{
  "medicineId": "64med123abc",
  "quantity": 3
}
```

### Update Category Product Quantity

**Request Body:**
```json
{
  "categoryProductId": "64prod456def",
  "quantity": 2
}
```

### Update Lab Test Quantity

**Request Body:**
```json
{
  "labTestId": "64lab789ghi",
  "quantity": 1,
  "isHomeCollection": true
}
```

**Field Descriptions:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicineId | String | Conditional | Medicine ID |
| categoryProductId | String | Conditional | Category product ID |
| labTestId | String | Conditional | Lab test ID |
| quantity | Number | Yes | New quantity (1-10) |
| isHomeCollection | Boolean | Conditional | Required for lab tests |

**Success Response (200 OK):**
```json
{
  "message": "Quantity updated successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [
      {
        "productType": "medicine",
        "medicineId": "64med123abc",
        "quantity": 3,
        "price": 45,
        "_id": "64item123"
      }
    ],
    "totalPrice": 135
  },
  "updatedItem": {
    "productType": "medicine",
    "medicineId": "64med123abc",
    "quantity": 3,
    "price": 45
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Quantity:**
```json
{
  "message": "Quantity must be at least 1"
}
```

**400 Bad Request - Quantity Limit:**
```json
{
  "message": "Quantity cannot exceed 10 units"
}
```

**400 Bad Request - Out of Stock:**
```json
{
  "message": "Only 5 units available in stock"
}
```

**404 Not Found:**
```json
{
  "message": "medicine not found in cart"
}
```

**Frontend Integration:**
```javascript
const updateCartQuantity = async (itemData) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/cart/update-quantity', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    return await response.json();
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
};

// Usage
await updateCartQuantity({ medicineId: '64med123abc', quantity: 3 });
```

---

## 4. Remove Item from Cart

**Endpoint:** `POST /api/cart/remove`

**Description:** Remove a specific item from the cart.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Remove Medicine

**Request Body:**
```json
{
  "medicineId": "64med123abc"
}
```

### Remove Category Product

**Request Body:**
```json
{
  "categoryProductId": "64prod456def"
}
```

### Remove Lab Test

**Request Body:**
```json
{
  "labTestId": "64lab789ghi",
  "isHomeCollection": true
}
```

**Success Response (200 OK):**
```json
{
  "message": "medicine removed from cart successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [],
    "totalPrice": 0
  },
  "removedItem": {
    "productType": "medicine",
    "medicineId": "64med123abc",
    "quantity": 2,
    "price": 45
  }
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "One of medicineId, categoryProductId, or labTestId is required"
}
```

**404 Not Found:**
```json
{
  "message": "medicine not found in cart"
}
```

**Frontend Integration:**
```javascript
const removeFromCart = async (itemData) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/cart/remove', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

// Usage
await removeFromCart({ medicineId: '64med123abc' });
await removeFromCart({ categoryProductId: '64prod456def' });
await removeFromCart({ labTestId: '64lab789ghi', isHomeCollection: true });
```

---

## 5. Clear Cart

**Endpoint:** `DELETE /api/cart/clear`

**Description:** Remove all items from the cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "message": "Cart cleared successfully",
  "cart": {
    "_id": "64cart123",
    "userId": "64user123",
    "items": [],
    "totalPrice": 0
  },
  "clearedItemsCount": 3,
  "clearedItems": [
    {
      "productType": "medicine",
      "medicineId": "64med123abc",
      "quantity": 2,
      "price": 45
    },
    {
      "productType": "categoryProduct",
      "categoryProductId": "64prod456def",
      "quantity": 1,
      "price": 85
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Cart not found"
}
```

**Frontend Integration:**
```javascript
const clearCart = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/cart/clear', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Usage
const result = await clearCart();
console.log(`Cleared ${result.clearedItemsCount} items`);
```

---

## Complete Workflow Example

```javascript
const token = localStorage.getItem('userToken');

// 1. Add items to cart
await fetch('http://localhost:5000/api/cart/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    medicineId: '64med123abc',
    quantity: 2
  })
});

// 2. Get cart
const cartResponse = await fetch('http://localhost:5000/api/cart', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cartData = await cartResponse.json();

// 3. Update quantity
await fetch('http://localhost:5000/api/cart/update-quantity', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    medicineId: '64med123abc',
    quantity: 3
  })
});

// 4. Remove item
await fetch('http://localhost:5000/api/cart/remove', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    medicineId: '64med123abc'
  })
});

// 5. Clear cart
await fetch('http://localhost:5000/api/cart/clear', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Summary

### Endpoints:
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart with populated details
- `PUT /api/cart/update-quantity` - Update item quantity
- `POST /api/cart/remove` - Remove specific item
- `DELETE /api/cart/clear` - Clear entire cart

### Supported Product Types:
✅ **Medicines** - Regular medicines  
✅ **Category Products** - Personal care, baby care, etc.  
✅ **Lab Tests** - With optional home collection  

### Key Features:
✅ Multi-product type support  
✅ Stock validation  
✅ Quantity limits (1-10 units)  
✅ Home collection for lab tests  
✅ Time slot booking  
✅ Patient details for lab tests  
✅ Automatic price calculation  
✅ Populated product details  
✅ Duplicate item prevention  

---

**Last Updated:** January 2025  
**API Version:** 1.0
