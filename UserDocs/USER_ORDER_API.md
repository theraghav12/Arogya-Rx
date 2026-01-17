# User Order API Documentation

## Overview
This document provides comprehensive API documentation for the user-side order system, including regular orders and lab test orders with support for ordering for someone else.

**Base URL**: `/api/orders` and `/api/lab-test-orders`

---

## Table of Contents

### Regular Orders
1. [Place Order from Cart](#1-place-order-from-cart)
2. [Get All Orders](#2-get-all-orders)
3. [Get Order by ID](#3-get-order-by-id)
4. [Get Orders with Filters](#4-get-orders-with-filters)
5. [Cancel Order](#5-cancel-order)
6. [Check Prescription Status](#6-check-prescription-status)
7. [Reorder Previous Order](#7-reorder-previous-order)
8. [Get Order Statistics](#8-get-order-statistics)
9. [Get Order Invoice](#9-get-order-invoice)
10. [Get Lab Test Results](#10-get-lab-test-results)

### Lab Test Orders
11. [Create Lab Test Order](#11-create-lab-test-order)
12. [Get My Lab Test Orders](#12-get-my-lab-test-orders)
13. [Get Lab Test Order by ID](#13-get-lab-test-order-by-id)
14. [Reschedule Lab Test](#14-reschedule-lab-test)

---

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Regular Orders

### 1. Place Order from Cart

**Endpoint**: `POST /api/orders/place-from-cart`

**Description**: Place an order using items from the cart.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "cartId": "64cart123abc",
  "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
  "contact": "9876543210",
  "name": "John Doe",
  "paymentMethod": "COD"
}
```

**Alternative - Using Address ID**:
```json
{
  "cartId": "64cart123abc",
  "addressId": "64addr123",
  "contact": "9876543210",
  "paymentMethod": "Online"
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cartId | String | Yes | Cart ID |
| address | String | Conditional | Full address string (required if addressId not provided) |
| addressId | String | Conditional | Address ID from user's saved addresses |
| contact | String | Yes | Contact phone number |
| name | String | No | Custom name (if ordering for someone else) |
| paymentMethod | String | No | "COD" or "Online" (default: "COD") |

**Important Notes**:
- When ordering lab tests for someone else, patient details should be added to cart items before placing order
- The `name` field is for the order recipient name (useful when ordering for someone else)
- Lab test patient details are carried from cart to order automatically

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "64order123",
    "userId": "64user123",
    "orderNumber": "ORD-1704567890123",
    "items": [
      {
        "_id": "64item123",
        "productType": "medicine",
        "medicineId": "64med123abc",
        "quantity": 2,
        "price": 45
      },
      {
        "_id": "64item456",
        "productType": "labTest",
        "labTestId": "64lab789ghi",
        "quantity": 1,
        "price": 500,
        "isHomeCollection": true,
        "homeCollectionPrice": 100,
        "labTestSampleOTP": "123456",
        "labTestStatus": "pending",
        "labTestRecorder": {
          "name": "Not assigned"
        },
        "labTestPatientDetails": {
          "name": "Jane Doe",
          "phone": "9876543211",
          "gender": "Female",
          "age": 28,
          "disease": "Routine checkup"
        }
      }
    ],
    "totalAmount": 690,
    "status": "Order Placed",
    "deliveryStatus": "Processing",
    "paymentStatus": "Pending",
    "paymentMethod": "COD",
    "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
    "contact": "9876543210",
    "hasLabTests": true,
    "deliveryOTP": "654321",
    "orderedAt": "2025-01-15T10:00:00.000Z"
  },
  "prescriptionStatus": {
    "hasPrescriptionRequired": false,
    "prescriptionVerified": false,
    "prescriptionVerificationStatus": "pending",
    "prescriptionRequiredMedicines": [],
    "prescriptionNotRequiredMedicines": [
      {
        "productId": "64med123abc",
        "productName": "Paracetamol 500mg",
        "quantity": 2,
        "price": 45,
        "prescriptionRequired": false,
        "productType": "medicine"
      }
    ],
    "prescriptionRequiredCount": 0,
    "prescriptionNotRequiredCount": 1,
    "message": "✅ This order contains only OTC medicines. No prescription required.",
    "statusMessage": "No prescription verification needed"
  }
}
```

**Error Responses**:

**400 Bad Request - Missing Fields**:
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "cartId, address (or addressId), and contact are required"
}
```

**400 Bad Request - Insufficient Stock**:
```json
{
  "success": false,
  "message": "Insufficient stock",
  "error": "Not enough stock for Paracetamol 500mg. Available: 5, Required: 10"
}
```

**403 Forbidden - Cart Access Denied**:
```json
{
  "success": false,
  "message": "Access denied",
  "error": "You can only place orders from your own cart"
}
```

**404 Not Found - Cart Empty**:
```json
{
  "success": false,
  "message": "Cart not found or empty",
  "error": "Invalid cart ID or empty cart"
}
```

**Frontend Integration**:
```javascript
const placeOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('userToken');
    
    const response = await fetch('http://localhost:5000/api/orders/place-from-cart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    return await response.json();
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Usage - Regular order
await placeOrder({
  cartId: '64cart123abc',
  addressId: '64addr123',
  contact: '9876543210',
  paymentMethod: 'COD'
});

// Usage - Order for someone else (with custom name)
await placeOrder({
  cartId: '64cart123abc',
  address: '456 Park Avenue, Delhi, 110001',
  contact: '9876543210',
  name: 'Jane Doe',
  paymentMethod: 'Online'
});
```

---

### 2. Get All Orders

**Endpoint**: `GET /api/orders`

**Description**: Get all orders with filters and pagination.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10) |
| status | String | No | Filter by order status |
| paymentStatus | String | No | Filter by payment status |
| startDate | String | No | Filter from date (YYYY-MM-DD) |
| endDate | String | No | Filter until date (YYYY-MM-DD) |
| sortBy | String | No | Sort field (default: "orderedAt") |
| sortOrder | String | No | "asc" or "desc" (default: "desc") |

**Example Requests**:
```
GET /api/orders
GET /api/orders?page=1&limit=10
GET /api/orders?status=Delivered
GET /api/orders?paymentStatus=Completed
GET /api/orders?startDate=2025-01-01&endDate=2025-01-31
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "64order123",
        "orderNumber": "ORD-1704567890123",
        "status": "Order Placed",
        "deliveryStatus": "Processing",
        "paymentStatus": "Pending",
        "paymentMethod": "COD",
        "totalAmount": 690,
        "orderedAt": "2025-01-15T10:00:00.000Z",
        "deliveredAt": null,
        "deliveryOTP": "654321",
        "hasLabTests": true,
        "items": [
          {
            "_id": "64item123",
            "productType": "medicine",
            "quantity": 2,
            "price": 45,
            "medicine": {
              "_id": "64med123abc",
              "productName": "Paracetamol 500mg",
              "price": 45,
              "image": "https://s3.amazonaws.com/...",
              "category": "Pain Relief"
            }
          }
        ],
        "address": "123 Main Street, Mumbai",
        "contact": "9876543210"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 45,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Frontend Integration**:
```javascript
const getOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    const token = localStorage.getItem('userToken');
    const params = new URLSearchParams({ page, limit, ...filters });
    
    const response = await fetch(
      `http://localhost:5000/api/orders?${params}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
```

---

### 3. Get Order by ID

**Endpoint**: `GET /api/orders/:id`

**Description**: Get detailed information about a specific order.

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id`: Order's MongoDB ObjectId

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "order": {
    "_id": "64order123",
    "userId": {
      "_id": "64user123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "orderNumber": "ORD-1704567890123",
    "status": "Order Placed",
    "deliveryStatus": "Processing",
    "paymentStatus": "Pending",
    "paymentMethod": "COD",
    "totalAmount": 690,
    "orderedAt": "2025-01-15T10:00:00.000Z",
    "items": [
      {
        "_id": "64item456",
        "productType": "labTest",
        "quantity": 1,
        "price": 500,
        "isHomeCollection": true,
        "homeCollectionPrice": 100,
        "labTestSampleOTP": "123456",
        "labTestStatus": "pending",
        "labTestPatientDetails": {
          "name": "Jane Doe",
          "phone": "9876543211",
          "gender": "Female",
          "age": 28,
          "disease": "Routine checkup"
        },
        "labTest": {
          "_id": "64lab789ghi",
          "testName": "Complete Blood Count (CBC)",
          "price": 500
        }
      }
    ],
    "address": "123 Main Street, Mumbai",
    "contact": "9876543210"
  }
}
```

**Error Responses**:

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Access denied",
  "error": "You can only view your own orders"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Frontend Integration**:
```javascript
const getOrderById = async (orderId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 4. Get Orders with Filters

**Endpoint**: `GET /api/orders` (same as Get All Orders but with filters)

See [Get All Orders](#2-get-all-orders) for complete details.

---

### 5. Cancel Order

**Endpoint**: `PUT /api/orders/:id/cancel`

**Description**: Cancel an order (only if not shipped or delivered).

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id`: Order's MongoDB ObjectId

**Success Response** (200 OK):
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "_id": "64order123",
    "orderNumber": "ORD-1704567890123",
    "status": "Cancelled",
    "totalAmount": 690
  }
}
```

**Error Responses**:

**400 Bad Request**:
```json
{
  "message": "Cannot cancel a shipped or delivered order"
}
```

**404 Not Found**:
```json
{
  "message": "Order not found"
}
```

**Frontend Integration**:
```javascript
const cancelOrder = async (orderId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 6. Check Prescription Status

**Endpoint**: `GET /api/orders/check-prescription/:cartId`

**Description**: Check if cart items require prescription before placing order.

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `cartId`: Cart's MongoDB ObjectId

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Prescription status checked successfully",
  "data": {
    "cartId": "64cart123abc",
    "totalAmount": 590,
    "prescriptionStatus": {
      "hasPrescriptionRequired": true,
      "prescriptionRequiredMedicines": [
        {
          "medicineId": "64med456def",
          "productName": "Amoxicillin 500mg",
          "quantity": 1,
          "price": 150,
          "prescriptionRequired": true
        }
      ],
      "prescriptionNotRequiredMedicines": [
        {
          "medicineId": "64med123abc",
          "productName": "Paracetamol 500mg",
          "quantity": 2,
          "price": 45,
          "prescriptionRequired": false
        }
      ]
    }
  }
}
```

**Frontend Integration**:
```javascript
const checkPrescription = async (cartId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(
    `http://localhost:5000/api/orders/check-prescription/${cartId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return await response.json();
};
```

---

### 7. Reorder Previous Order

**Endpoint**: `POST /api/orders/:orderId/reorder`

**Description**: Add items from a previous delivered order to cart for reordering.

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `orderId`: Order's MongoDB ObjectId (must be delivered)

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Items added to cart for reorder",
  "cartId": "64cart789xyz",
  "items": [
    {
      "productType": "medicine",
      "medicineId": "64med123abc",
      "quantity": 2,
      "price": 45,
      "name": "Paracetamol 500mg"
    }
  ]
}
```

**Frontend Integration**:
```javascript
const reorderOrder = async (orderId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(
    `http://localhost:5000/api/orders/${orderId}/reorder`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return await response.json();
};
```

---

### 8. Get Order Statistics

**Endpoint**: `GET /api/orders/stats/overview`

**Description**: Get order statistics for the authenticated user.

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "statistics": {
    "totalOrders": 45,
    "totalAmount": 25000,
    "pendingOrders": 2,
    "processingOrders": 5,
    "shippedOrders": 3,
    "deliveredOrders": 32,
    "cancelledOrders": 3
  }
}
```

**Frontend Integration**:
```javascript
const getOrderStats = async () => {
  const token = localStorage.getItem('userToken');
  const response = await fetch('http://localhost:5000/api/orders/stats/overview', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 9. Get Order Invoice

**Endpoint**: `GET /api/orders/:id/invoice`

**Description**: Generate and download PDF invoice for an order.

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id`: Order's MongoDB ObjectId

**Success Response** (200 OK):
Returns a PDF file with Content-Type: application/pdf

**Frontend Integration**:
```javascript
const downloadInvoice = async (orderId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(
    `http://localhost:5000/api/orders/${orderId}/invoice`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
```

---

### 10. Get Lab Test Results

**Endpoint**: `GET /api/orders/my-lab-results`

**Description**: Get all lab test results for the authenticated user.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10) |
| status | String | No | Filter by lab test status |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Lab test results retrieved successfully",
  "data": [
    {
      "orderId": "64order123",
      "orderNumber": "ORD-1704567890123",
      "orderDate": "2025-01-15T10:00:00.000Z",
      "testDetails": {
        "_id": "64item456",
        "testId": "64lab789ghi",
        "testName": "Complete Blood Count (CBC)",
        "status": "completed"
      },
      "result": {
        "uploadedAt": "2025-01-17T10:00:00.000Z",
        "fileUrl": "https://s3.amazonaws.com/lab-results/result.pdf"
      },
      "patient": {
        "name": "Jane Doe",
        "phone": "9876543211",
        "gender": "Female",
        "age": 28
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalResults": 15
  }
}
```

**Frontend Integration**:
```javascript
const getLabResults = async (page = 1) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(
    `http://localhost:5000/api/orders/my-lab-results?page=${page}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return await response.json();
};
```

---

## Lab Test Orders

### 11. Create Lab Test Order

**Endpoint**: `POST /api/lab-test-orders`

**Description**: Create a new lab test order directly (without cart). Supports ordering for someone else.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body - Order for Self**:
```json
{
  "tests": [
    { "labTestId": "64lab123abc" },
    { "labTestId": "64lab456def" }
  ],
  "patientName": "John Doe",
  "patientAge": 30,
  "patientGender": "Male",
  "contactPhone": "9876543210",
  "contactEmail": "john@example.com",
  "address": "123 Main Street, Mumbai, Maharashtra, 400001",
  "homeCollection": true,
  "preferredDate": "2025-01-20",
  "preferredSlot": {
    "start": "09:00",
    "end": "11:00"
  },
  "payment": {
    "method": "online"
  }
}
```

**Request Body - Order for Someone Else**:
```json
{
  "tests": [
    { "labTestId": "64lab123abc" }
  ],
  "patientName": "Jane Doe",
  "patientAge": 28,
  "patientGender": "Female",
  "contactPhone": "9876543211",
  "contactEmail": "jane@example.com",
  "address": "456 Park Avenue, Delhi, 110001",
  "homeCollection": true,
  "preferredDate": "2025-01-22",
  "preferredSlot": {
    "start": "10:00",
    "end": "12:00"
  },
  "payment": {
    "method": "online"
  }
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tests | Array | Yes | Array of lab test objects with labTestId |
| patientName | String | Yes | Patient's full name (can be different from logged-in user) |
| patientAge | Number | Yes | Patient's age |
| patientGender | String | Yes | Patient's gender (Male/Female/Other) |
| contactPhone | String | Yes | Contact phone number |
| contactEmail | String | No | Contact email |
| address | String | Yes | Full address for home collection |
| homeCollection | Boolean | No | Enable home collection (default: true) |
| preferredDate | String | Conditional | Required if homeCollection=true (YYYY-MM-DD) |
| preferredSlot | Object | Conditional | Required if homeCollection=true |
| preferredSlot.start | String | Conditional | Start time (HH:MM) |
| preferredSlot.end | String | Conditional | End time (HH:MM) |
| couponCode | String | No | Discount coupon code |
| payment | Object | No | Payment details |
| payment.method | String | No | Payment method (default: "online") |

**Important Notes**:
- The `patientName`, `patientAge`, `patientGender` fields are for the actual patient
- These can be different from the logged-in user (ordering for family/friends)
- The logged-in user's ID is automatically recorded as the order creator
- Contact details should be of the person who will coordinate the test

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "64ltorder123",
    "user": "64user123",
    "tests": [
      {
        "labTest": "64lab123abc",
        "testName": "Complete Blood Count (CBC)",
        "priceSnapshot": 500,
        "discountedPriceSnapshot": 450
      }
    ],
    "patientName": "Jane Doe",
    "patientAge": 28,
    "patientGender": "Female",
    "contactPhone": "9876543211",
    "contactEmail": "jane@example.com",
    "address": "456 Park Avenue, Delhi, 110001",
    "homeCollection": true,
    "preferredDate": "2025-01-22T00:00:00.000Z",
    "preferredSlot": {
      "start": "10:00",
      "end": "12:00"
    },
    "subtotal": 450,
    "homeCollectionCharge": 100,
    "totalAmount": 550,
    "payment": {
      "method": "online",
      "status": "pending"
    },
    "status": "pending",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Error Responses**:

**400 Bad Request - Invalid Tests**:
```json
{
  "message": "One or more lab tests are invalid or inactive"
}
```

**400 Bad Request - Validation Error**:
```json
{
  "errors": [
    {
      "msg": "Patient name is required",
      "param": "patientName",
      "location": "body"
    }
  ]
}
```

**Frontend Integration**:
```javascript
// Order lab test for self
const createLabTestOrder = async (orderData) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch('http://localhost:5000/api/lab-test-orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  return await response.json();
};

// Usage - Order for self
await createLabTestOrder({
  tests: [{ labTestId: '64lab123abc' }],
  patientName: 'John Doe',
  patientAge: 30,
  patientGender: 'Male',
  contactPhone: '9876543210',
  contactEmail: 'john@example.com',
  address: '123 Main Street, Mumbai',
  homeCollection: true,
  preferredDate: '2025-01-20',
  preferredSlot: { start: '09:00', end: '11:00' },
  payment: { method: 'online' }
});

// Usage - Order for someone else (e.g., parent, child, friend)
await createLabTestOrder({
  tests: [{ labTestId: '64lab123abc' }],
  patientName: 'Jane Doe',  // Different person
  patientAge: 28,
  patientGender: 'Female',
  contactPhone: '9876543211',  // Their contact
  contactEmail: 'jane@example.com',
  address: '456 Park Avenue, Delhi',  // Their address
  homeCollection: true,
  preferredDate: '2025-01-22',
  preferredSlot: { start: '10:00', end: '12:00' },
  payment: { method: 'online' }
});
```

---

### 12. Get My Lab Test Orders

**Endpoint**: `GET /api/lab-test-orders/my-orders`

**Description**: Get all lab test orders created by the authenticated user.

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64ltorder123",
      "user": "64user123",
      "tests": [
        {
          "labTest": "64lab123abc",
          "testName": "Complete Blood Count (CBC)",
          "priceSnapshot": 500,
          "discountedPriceSnapshot": 450
        }
      ],
      "patientName": "Jane Doe",
      "patientAge": 28,
      "patientGender": "Female",
      "contactPhone": "9876543211",
      "address": "456 Park Avenue, Delhi",
      "homeCollection": true,
      "preferredDate": "2025-01-22T00:00:00.000Z",
      "preferredSlot": {
        "start": "10:00",
        "end": "12:00"
      },
      "totalAmount": 550,
      "status": "pending",
      "payment": {
        "method": "online",
        "status": "pending"
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Frontend Integration**:
```javascript
const getMyLabTestOrders = async () => {
  const token = localStorage.getItem('userToken');
  const response = await fetch('http://localhost:5000/api/lab-test-orders/my-orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 13. Get Lab Test Order by ID

**Endpoint**: `GET /api/lab-test-orders/:id`

**Description**: Get detailed information about a specific lab test order.

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
- `id`: Lab test order's MongoDB ObjectId

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "64ltorder123",
    "user": "64user123",
    "tests": [
      {
        "labTest": "64lab123abc",
        "testName": "Complete Blood Count (CBC)",
        "priceSnapshot": 500,
        "discountedPriceSnapshot": 450
      }
    ],
    "patientName": "Jane Doe",
    "patientAge": 28,
    "patientGender": "Female",
    "contactPhone": "9876543211",
    "contactEmail": "jane@example.com",
    "address": "456 Park Avenue, Delhi",
    "homeCollection": true,
    "preferredDate": "2025-01-22T00:00:00.000Z",
    "preferredSlot": {
      "start": "10:00",
      "end": "12:00"
    },
    "subtotal": 450,
    "homeCollectionCharge": 100,
    "totalAmount": 550,
    "status": "confirmed",
    "payment": {
      "method": "online",
      "status": "completed"
    }
  }
}
```

**Error Responses**:

**403 Forbidden**:
```json
{
  "message": "Forbidden"
}
```

**404 Not Found**:
```json
{
  "message": "Order not found"
}
```

**Frontend Integration**:
```javascript
const getLabTestOrderById = async (orderId) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(`http://localhost:5000/api/lab-test-orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

---

### 14. Reschedule Lab Test

**Endpoint**: `PUT /api/lab-test-orders/:id/reschedule`

**Description**: Reschedule a lab test appointment.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: Lab test order's MongoDB ObjectId

**Request Body**:
```json
{
  "preferredDate": "2025-01-25",
  "preferredSlot": {
    "start": "14:00",
    "end": "16:00"
  },
  "reason": "Not available on original date"
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| preferredDate | String | Yes | New preferred date (YYYY-MM-DD) |
| preferredSlot | Object | Yes | New time slot |
| preferredSlot.start | String | Yes | Start time (HH:MM) |
| preferredSlot.end | String | Yes | End time (HH:MM) |
| reason | String | No | Reason for rescheduling |

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "64ltorder123",
    "patientName": "Jane Doe",
    "preferredDate": "2025-01-25T00:00:00.000Z",
    "preferredSlot": {
      "start": "14:00",
      "end": "16:00"
    },
    "status": "pending",
    "updatedAt": "2025-01-16T10:00:00.000Z"
  }
}
```

**Error Responses**:

**403 Forbidden**:
```json
{
  "message": "Forbidden"
}
```

**404 Not Found**:
```json
{
  "message": "Order not found"
}
```

**Frontend Integration**:
```javascript
const rescheduleLabTest = async (orderId, rescheduleData) => {
  const token = localStorage.getItem('userToken');
  const response = await fetch(
    `http://localhost:5000/api/lab-test-orders/${orderId}/reschedule`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rescheduleData)
    }
  );
  return await response.json();
};

// Usage
await rescheduleLabTest('64ltorder123', {
  preferredDate: '2025-01-25',
  preferredSlot: { start: '14:00', end: '16:00' },
  reason: 'Not available on original date'
});
```

---

## Complete Workflow Examples

### Workflow 1: Regular Order with Lab Test for Someone Else

```javascript
// Step 1: Add lab test to cart with patient details
await fetch('http://localhost:5000/api/cart/add', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    labTestId: '64lab123abc',
    quantity: 1,
    isHomeCollection: true,
    preferredDate: '2025-01-20',
    preferredSlot: { start: '09:00', end: '11:00' },
    labTestPatientDetails: {
      name: 'Jane Doe',
      phone: '9876543211',
      gender: 'Female',
      age: 28,
      disease: 'Routine checkup'
    }
  })
});

// Step 2: Place order from cart
const orderResult = await fetch('http://localhost:5000/api/orders/place-from-cart', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cartId: '64cart123abc',
    address: '123 Main Street, Mumbai',
    contact: '9876543210',
    name: 'John Doe',  // Order placed by John for Jane
    paymentMethod: 'Online'
  })
});

console.log('Order placed:', orderResult);
```

### Workflow 2: Direct Lab Test Order for Someone Else

```javascript
// Create lab test order directly (without cart)
const labTestOrder = await fetch('http://localhost:5000/api/lab-test-orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tests: [
      { labTestId: '64lab123abc' },
      { labTestId: '64lab456def' }
    ],
    patientName: 'Jane Doe',  // Ordering for Jane
    patientAge: 28,
    patientGender: 'Female',
    contactPhone: '9876543211',
    contactEmail: 'jane@example.com',
    address: '456 Park Avenue, Delhi',
    homeCollection: true,
    preferredDate: '2025-01-22',
    preferredSlot: { start: '10:00', end: '12:00' },
    payment: { method: 'online' }
  })
});

console.log('Lab test order created:', labTestOrder);
```

### Workflow 3: View and Manage Orders

```javascript
// Get all orders
const orders = await fetch('http://localhost:5000/api/orders?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get specific order details
const orderDetails = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get lab test orders
const labTestOrders = await fetch('http://localhost:5000/api/lab-test-orders/my-orders', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Reschedule lab test
await fetch(`http://localhost:5000/api/lab-test-orders/${orderId}/reschedule`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferredDate: '2025-01-25',
    preferredSlot: { start: '14:00', end: '16:00' }
  })
});

// Download invoice
const invoiceBlob = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.blob());
```

---

## React Component Examples

### Component 1: Place Order with Lab Test for Someone Else

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const PlaceOrderForm = ({ cartId }) => {
  const [orderData, setOrderData] = useState({
    cartId: cartId,
    address: '',
    contact: '',
    name: '',
    paymentMethod: 'COD'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:5000/api/orders/place-from-cart',
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Order placed successfully!');
        // Redirect to order details or orders list
        window.location.href = `/orders/${response.data.order._id}`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="place-order-form">
      <h2>Place Order</h2>

      <div className="form-group">
        <label>Delivery Address:</label>
        <textarea
          value={orderData.address}
          onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
          placeholder="Enter full delivery address"
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Contact Number:</label>
        <input
          type="tel"
          value={orderData.contact}
          onChange={(e) => setOrderData({ ...orderData, contact: e.target.value })}
          placeholder="9876543210"
          required
        />
      </div>

      <div className="form-group">
        <label>Recipient Name (if ordering for someone else):</label>
        <input
          type="text"
          value={orderData.name}
          onChange={(e) => setOrderData({ ...orderData, name: e.target.value })}
          placeholder="Leave empty if ordering for yourself"
        />
        <small>Enter the name of the person receiving this order</small>
      </div>

      <div className="form-group">
        <label>Payment Method:</label>
        <select
          value={orderData.paymentMethod}
          onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Online">Online Payment</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </form>
  );
};

export default PlaceOrderForm;
```

### Component 2: Create Lab Test Order for Someone Else

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const LabTestOrderForm = ({ selectedTests }) => {
  const [patientData, setPatientData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    contactPhone: '',
    contactEmail: '',
    address: '',
    homeCollection: true,
    preferredDate: '',
    preferredSlot: { start: '09:00', end: '11:00' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:5000/api/lab-test-orders',
        {
          tests: selectedTests.map(testId => ({ labTestId: testId })),
          ...patientData,
          patientAge: parseInt(patientData.patientAge),
          payment: { method: 'online' }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert('Lab test order created successfully!');
        window.location.href = `/lab-test-orders/${response.data.data._id}`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lab-test-order-form">
      <h2>Book Lab Test</h2>
      <p className="info">You can book this test for yourself or someone else</p>

      <div className="form-group">
        <label>Patient Name: *</label>
        <input
          type="text"
          value={patientData.patientName}
          onChange={(e) => setPatientData({ ...patientData, patientName: e.target.value })}
          placeholder="Enter patient's full name"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Age: *</label>
          <input
            type="number"
            value={patientData.patientAge}
            onChange={(e) => setPatientData({ ...patientData, patientAge: e.target.value })}
            placeholder="Age"
            min="1"
            max="120"
            required
          />
        </div>

        <div className="form-group">
          <label>Gender: *</label>
          <select
            value={patientData.patientGender}
            onChange={(e) => setPatientData({ ...patientData, patientGender: e.target.value })}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Contact Phone: *</label>
        <input
          type="tel"
          value={patientData.contactPhone}
          onChange={(e) => setPatientData({ ...patientData, contactPhone: e.target.value })}
          placeholder="9876543210"
          required
        />
      </div>

      <div className="form-group">
        <label>Contact Email:</label>
        <input
          type="email"
          value={patientData.contactEmail}
          onChange={(e) => setPatientData({ ...patientData, contactEmail: e.target.value })}
          placeholder="email@example.com"
        />
      </div>

      <div className="form-group">
        <label>Address: *</label>
        <textarea
          value={patientData.address}
          onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
          placeholder="Full address for home collection"
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={patientData.homeCollection}
            onChange={(e) => setPatientData({ ...patientData, homeCollection: e.target.checked })}
          />
          Home Collection
        </label>
      </div>

      {patientData.homeCollection && (
        <>
          <div className="form-group">
            <label>Preferred Date: *</label>
            <input
              type="date"
              value={patientData.preferredDate}
              onChange={(e) => setPatientData({ ...patientData, preferredDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time: *</label>
              <input
                type="time"
                value={patientData.preferredSlot.start}
                onChange={(e) => setPatientData({
                  ...patientData,
                  preferredSlot: { ...patientData.preferredSlot, start: e.target.value }
                })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time: *</label>
              <input
                type="time"
                value={patientData.preferredSlot.end}
                onChange={(e) => setPatientData({
                  ...patientData,
                  preferredSlot: { ...patientData.preferredSlot, end: e.target.value }
                })}
                required
              />
            </div>
          </div>
        </>
      )}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating Order...' : 'Book Lab Test'}
      </button>
    </form>
  );
};

export default LabTestOrderForm;
```

### Component 3: View Orders with Patient Details

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get('http://localhost:5000/api/orders?page=1&limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderNumber}</h3>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <p><strong>Date:</strong> {new Date(order.orderedAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
                {order.deliveryOTP && (
                  <p><strong>Delivery OTP:</strong> {order.deliveryOTP}</p>
                )}
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    {item.medicine && (
                      <p>{item.medicine.productName} x {item.quantity}</p>
                    )}
                    {item.labTest && (
                      <div className="lab-test-item">
                        <p>{item.labTest.testName} x {item.quantity}</p>
                        {item.labTestPatientDetails && (
                          <div className="patient-details">
                            <small>
                              <strong>Patient:</strong> {item.labTestPatientDetails.name}, 
                              Age {item.labTestPatientDetails.age}, 
                              {item.labTestPatientDetails.gender}
                            </small>
                            {item.labTestPatientDetails.phone && (
                              <small>
                                <br/><strong>Contact:</strong> {item.labTestPatientDetails.phone}
                              </small>
                            )}
                          </div>
                        )}
                        {item.isHomeCollection && (
                          <small className="home-collection">
                            🏠 Home Collection | OTP: {item.labTestSampleOTP}
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-actions">
                <button onClick={() => window.location.href = `/orders/${order._id}`}>
                  View Details
                </button>
                {['Order Placed', 'Processing'].includes(order.status) && (
                  <button 
                    onClick={() => cancelOrder(order._id)}
                    className="cancel-btn"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
```

---

## Summary

### Regular Order Endpoints (10 APIs)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders/place-from-cart` | POST | Required | Place order from cart |
| `/api/orders` | GET | Required | Get all orders with filters |
| `/api/orders/:id` | GET | Required | Get order by ID |
| `/api/orders/:id/cancel` | PUT | Required | Cancel order |
| `/api/orders/check-prescription/:cartId` | GET | Required | Check prescription status |
| `/api/orders/:orderId/reorder` | POST | Required | Reorder previous order |
| `/api/orders/stats/overview` | GET | Required | Get order statistics |
| `/api/orders/:id/invoice` | GET | Required | Download order invoice |
| `/api/orders/my-lab-results` | GET | Required | Get lab test results |
| `/api/orders/create-payment` | POST | Required | Create payment order |

### Lab Test Order Endpoints (4 APIs)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/lab-test-orders` | POST | Required | Create lab test order |
| `/api/lab-test-orders/my-orders` | GET | Required | Get my lab test orders |
| `/api/lab-test-orders/:id` | GET | Required | Get lab test order by ID |
| `/api/lab-test-orders/:id/reschedule` | PUT | Required | Reschedule lab test |

### Key Features

#### Regular Orders
- 🛒 **Cart-Based Ordering**: Place orders from cart items
- 💊 **Multi-Product Support**: Medicines, category products, and lab tests
- 📋 **Prescription Management**: Automatic prescription requirement detection
- 💳 **Payment Options**: COD and Online payment support
- 📦 **Order Tracking**: Real-time order status updates
- 🔢 **Delivery OTP**: Secure delivery verification
- 📄 **Invoice Generation**: PDF invoice download
- 🔄 **Reorder**: Quick reorder from previous orders
- 📊 **Statistics**: Order history and spending analytics

#### Lab Test Orders
- 🧪 **Direct Booking**: Book lab tests without cart
- 👥 **Order for Others**: Book tests for family/friends
- 🏠 **Home Collection**: Schedule home sample collection
- 📅 **Time Slot Booking**: Choose preferred date and time
- 🔄 **Rescheduling**: Change appointment date/time
- 📋 **Patient Details**: Store patient information separately
- 💰 **Pricing**: Transparent pricing with home collection charges
- 📱 **Notifications**: Real-time status updates

### Order for Someone Else Feature

#### Via Cart (Regular Orders)
1. Add lab test to cart with `labTestPatientDetails`:
   ```json
   {
     "labTestId": "64lab123abc",
     "quantity": 1,
     "isHomeCollection": true,
     "labTestPatientDetails": {
       "name": "Jane Doe",
       "phone": "9876543211",
       "gender": "Female",
       "age": 28,
       "disease": "Routine checkup"
     }
   }
   ```

2. Place order with custom recipient name:
   ```json
   {
     "cartId": "64cart123abc",
     "address": "456 Park Avenue",
     "contact": "9876543210",
     "name": "Jane Doe"
   }
   ```

#### Direct Lab Test Order
Create order directly with patient details:
```json
{
  "tests": [{ "labTestId": "64lab123abc" }],
  "patientName": "Jane Doe",
  "patientAge": 28,
  "patientGender": "Female",
  "contactPhone": "9876543211",
  "address": "456 Park Avenue, Delhi"
}
```

### Important Notes

1. **Correct Endpoint**: Use `/api/orders/place-from-cart` (NOT `/api/orders/place-order`)
2. **Patient Details**: Lab test patient details are preserved from cart to order
3. **Multiple Patients**: Each lab test item can have different patient details
4. **Home Collection**: Requires date and time slot
5. **Payment Methods**: COD or Online (Razorpay)
6. **Stock Management**: Automatic stock reduction for COD orders
7. **Prescription Verification**: Automatic detection and verification workflow
8. **Order Tracking**: Delivery OTP for secure delivery
9. **Lab Test OTP**: Separate OTP for sample collection

### Business Rules

1. Orders can only be placed from user's own cart
2. Stock is validated before order placement
3. COD orders reduce stock immediately
4. Online orders reduce stock after payment verification
5. Only pending/processing orders can be cancelled
6. Lab test patient details are optional but recommended
7. Home collection requires date and time slot
8. Reorder only available for delivered orders
9. Invoice available for all orders
10. Lab test results available after completion

### Error Prevention Tips

1. ✅ Always use correct endpoint: `/api/orders/place-from-cart`
2. ✅ Include either `address` or `addressId` (not both)
3. ✅ Provide `contact` phone number
4. ✅ For lab tests with home collection, include date and time slot
5. ✅ Patient details should be added to cart items before placing order
6. ✅ Use proper date format: YYYY-MM-DD
7. ✅ Use proper time format: HH:MM (24-hour)
8. ✅ Validate stock availability before ordering
9. ✅ Check prescription requirements before ordering
10. ✅ Handle payment method correctly (COD/Online)

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Production Ready ✅
