# User Order & Payment API - Complete Guide

## Overview
Complete documentation for user-side order management and online payment processing using Razorpay integration.

---

## 📋 **Table of Contents**
1. [Place Order (COD)](#1-place-order-cod)
2. [Place Order (Online Payment)](#2-place-order-online-payment)
3. [Get All Orders](#3-get-all-orders)
4. [Get Order Details](#4-get-order-details)
5. [Get Orders with Filters](#5-get-orders-with-filters)
6. [Cancel Order](#6-cancel-order)
7. [Reorder](#7-reorder)
8. [Download Invoice](#8-download-invoice)
9. [Order Statistics](#9-order-statistics)

---

## 🛒 **1. Place Order (COD - Cash on Delivery)**

### **Endpoint:**
```
POST /api/orders/place-from-cart
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

### **Request Body:**
```json
{
  "cartId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
  "contact": "+91-9876543210",
  "name": "John Doe",
  "paymentMethod": "COD"
}
```

**OR using addressId:**
```json
{
  "cartId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "addressId": "64f8a1b2c3d4e5f6g7h8i9j1",
  "contact": "+91-9876543210",
  "name": "John Doe",
  "paymentMethod": "COD"
}
```

### **Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
    "userId": "64f8a1b2c3d4e5f6g7h8i9j3",
    "orderNumber": "ORD-1234567890",
    "items": [
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j4",
        "productType": "medicine",
        "medicineId": "64f8a1b2c3d4e5f6g7h8i9j5",
        "quantity": 2,
        "price": 45
      }
    ],
    "totalAmount": 90,
    "status": "Order Placed",
    "deliveryStatus": "Processing",
    "paymentStatus": "Pending",
    "paymentMethod": "COD",
    "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
    "contact": "+91-9876543210",
    "hasLabTests": false,
    "deliveryOTP": "123456",
    "orderedAt": "2024-01-15T10:30:00.000Z"
  },
  "prescriptionStatus": {
    "hasPrescriptionRequired": false,
    "prescriptionVerified": false,
    "prescriptionVerificationStatus": "pending",
    "prescriptionRequiredMedicines": [],
    "prescriptionNotRequiredMedicines": [
      {
        "productId": "64f8a1b2c3d4e5f6g7h8i9j5",
        "productName": "Paracetamol 500mg",
        "quantity": 2,
        "price": 45,
        "prescriptionRequired": false,
        "productType": "medicine"
      }
    ],
    "prescriptionRequiredCount": 0,
    "prescriptionNotRequiredCount": 1,
    "message": "✅ This order contains only OTC medicines. No prescription required."
  }
}
```

### **Response (Error - 400):**
```json
{
  "success": false,
  "message": "Insufficient stock",
  "error": "Not enough stock for Paracetamol 500mg. Available: 10, Required: 20"
}
```

---

## 💳 **2. Place Order (Online Payment - Razorpay)**

### **Step 1: Create Payment Order**

#### **Endpoint:**
```
POST /api/payment/orders/create-payment
```

#### **Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "cartId": "64f8a1b2c3d4e5f6g7h8i9j0",
  "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
  "contact": "+91-9876543210"
}
```

#### **Response (Success - 201):**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "razorpayOrderId": "order_MNOPqrstuvwxyz",
  "razorpayKeyId": "rzp_test_1234567890",
  "amount": 9000,
  "currency": "INR",
  "orderId": "64f8a1b2c3d4e5f6g7h8i9j2",
  "orderNumber": "ORD-1234567890"
}
```

### **Step 2: Open Razorpay Checkout (Frontend)**

```javascript
// Frontend code to open Razorpay checkout
const options = {
  key: response.razorpayKeyId,
  amount: response.amount,
  currency: response.currency,
  name: "ArogyaRx",
  description: "Order Payment",
  order_id: response.razorpayOrderId,
  handler: function (razorpayResponse) {
    // Payment successful - verify payment
    verifyPayment(razorpayResponse);
  },
  prefill: {
    name: "John Doe",
    email: "john@example.com",
    contact: "+91-9876543210"
  },
  theme: {
    color: "#556B2F"
  }
};

const razorpay = new Razorpay(options);
razorpay.open();

// Handle payment failure
razorpay.on('payment.failed', function (response) {
  handlePaymentFailure(response);
});
```

### **Step 3: Verify Payment**

#### **Endpoint:**
```
POST /api/payment/verify
```

#### **Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "razorpay_order_id": "order_MNOPqrstuvwxyz",
  "razorpay_payment_id": "pay_ABCDefghijklmn",
  "razorpay_signature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

#### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order payment verified successfully",
  "order": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j2",
    "orderNumber": "ORD-1234567890",
    "status": "Order Placed",
    "paymentStatus": "Completed",
    "totalAmount": 90
  }
}
```

### **Step 4: Handle Payment Failure (Optional)**

#### **Endpoint:**
```
POST /api/payment/failure
```

#### **Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "razorpay_order_id": "order_MNOPqrstuvwxyz",
  "error_description": "Payment failed due to insufficient funds"
}
```

#### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment failure handled",
  "data": {
    "orderId": "64f8a1b2c3d4e5f6g7h8i9j2",
    "orderNumber": "ORD-1234567890",
    "status": "Order Rejected",
    "paymentStatus": "Failed"
  }
}
```

---

## 📦 **3. Get All Orders**

### **Endpoint:**
```
GET /api/orders/simple
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Query Parameters:**
```
page     - Page number (default: 1)
limit    - Items per page (default: 10)
```

### **Example Request:**
```
GET /api/orders/simple?page=1&limit=10
```

### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
        "orderNumber": "ORD-1234567890",
        "status": "Order Placed",
        "deliveryStatus": "Processing",
        "paymentStatus": "Pending",
        "paymentMethod": "COD",
        "totalAmount": 90,
        "orderedAt": "2024-01-15T10:30:00.000Z",
        "deliveredAt": null,
        "deliveryOTP": "123456",
        "hasLabTests": false,
        "items": [
          {
            "_id": "64f8a1b2c3d4e5f6g7h8i9j4",
            "productType": "medicine",
            "quantity": 2,
            "price": 45,
            "medicine": {
              "_id": "64f8a1b2c3d4e5f6g7h8i9j5",
              "productName": "Paracetamol 500mg",
              "price": 45,
              "image": "https://s3.amazonaws.com/...",
              "category": "OTC"
            }
          }
        ],
        "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
        "contact": "+91-9876543210",
        "prescriptionVerified": false,
        "prescriptionVerificationStatus": "pending",
        "hasPrescriptionRequired": false,
        "medicineSubstitutions": []
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🔍 **4. Get Order Details**

### **Endpoint:**
```
GET /api/orders/:id
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Example Request:**
```
GET /api/orders/64f8a1b2c3d4e5f6g7h8i9j2
```

### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "order": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
    "orderNumber": "ORD-1234567890",
    "status": "Order Placed",
    "deliveryStatus": "Processing",
    "paymentStatus": "Pending",
    "paymentMethod": "COD",
    "totalAmount": 90,
    "orderedAt": "2024-01-15T10:30:00.000Z",
    "deliveredAt": null,
    "deliveryOTP": "123456",
    "hasLabTests": false,
    "items": [
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j4",
        "productType": "medicine",
        "quantity": 2,
        "price": 45,
        "medicine": {
          "_id": "64f8a1b2c3d4e5f6g7h8i9j5",
          "productName": "Paracetamol 500mg",
          "price": 45,
          "image": "https://s3.amazonaws.com/...",
          "category": "OTC"
        }
      },
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j6",
        "productType": "labTest",
        "quantity": 1,
        "price": 500,
        "isHomeCollection": true,
        "homeCollectionPrice": 100,
        "labTestSampleOTP": "654321",
        "labTestStatus": "pending",
        "labTestRecorder": {
          "name": "Not assigned",
          "phone": null,
          "email": null
        },
        "labTest": {
          "_id": "64f8a1b2c3d4e5f6g7h8i9j7",
          "testName": "Complete Blood Count (CBC)",
          "description": "Comprehensive blood test",
          "price": 500
        }
      }
    ],
    "address": "123 Main Street, Mumbai, Maharashtra, 400001, India",
    "contact": "+91-9876543210",
    "userId": {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j3",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91-9876543210"
    }
  }
}
```

---

## 🔎 **5. Get Orders with Filters**

### **Endpoint:**
```
GET /api/orders
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Query Parameters:**
```
page          - Page number (default: 1)
limit         - Items per page (default: 10)
status        - Filter by order status
                Options: "Pending", "Order Placed", "Processing", "Shipped", 
                        "Delivered", "Cancelled", "Order Rejected"
paymentStatus - Filter by payment status
                Options: "Pending", "Completed", "Failed"
startDate     - Filter orders from this date (ISO format)
endDate       - Filter orders until this date (ISO format)
sortBy        - Sort field (default: "orderedAt")
                Options: "orderedAt", "totalAmount", "status"
sortOrder     - Sort order (default: "desc")
                Options: "asc", "desc"
```

### **Example Requests:**
```
# Get all pending orders
GET /api/orders?status=Pending&page=1&limit=10

# Get delivered orders from last month
GET /api/orders?status=Delivered&startDate=2024-01-01&endDate=2024-01-31

# Get orders sorted by amount (high to low)
GET /api/orders?sortBy=totalAmount&sortOrder=desc

# Get completed payment orders
GET /api/orders?paymentStatus=Completed
```

### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
        "orderNumber": "ORD-1234567890",
        "status": "Delivered",
        "deliveryStatus": "Delivered",
        "paymentStatus": "Completed",
        "totalAmount": 90,
        "orderedAt": "2024-01-15T10:30:00.000Z",
        "deliveredAt": "2024-01-17T14:30:00.000Z",
        "items": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## ❌ **6. Cancel Order**

### **Endpoint:**
```
PUT /api/orders/:id/cancel
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Example Request:**
```
PUT /api/orders/64f8a1b2c3d4e5f6g7h8i9j2/cancel
```

### **Response (Success - 200):**
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "_id": "64f8a1b2c3d4e5f6g7h8i9j2",
    "orderNumber": "ORD-1234567890",
    "status": "Cancelled",
    "deliveryStatus": "Cancelled",
    "paymentStatus": "Pending",
    "totalAmount": 90
  }
}
```

### **Response (Error - 400):**
```json
{
  "message": "Cannot cancel a shipped or delivered order"
}
```

---

## 🔄 **7. Reorder**

### **Endpoint:**
```
POST /api/orders/:orderId/reorder
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Example Request:**
```
POST /api/orders/64f8a1b2c3d4e5f6g7h8i9j2/reorder
```

### **Response (Success - 201):**
```json
{
  "success": true,
  "message": "Items added to cart for reorder",
  "cartId": "64f8a1b2c3d4e5f6g7h8i9j8",
  "items": [
    {
      "productType": "medicine",
      "medicineId": "64f8a1b2c3d4e5f6g7h8i9j5",
      "quantity": 2,
      "price": 45,
      "name": "Paracetamol 500mg",
      "image": "https://s3.amazonaws.com/..."
    }
  ]
}
```

### **Response (Error - 404):**
```json
{
  "success": false,
  "message": "Order not found or not eligible for reorder"
}
```

---

## 📄 **8. Download Invoice**

### **Endpoint:**
```
GET /api/orders/:id/invoice
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Example Request:**
```
GET /api/orders/64f8a1b2c3d4e5f6g7h8i9j2/invoice
```

### **Response (Success - 200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=invoice-ORD-1234567890.pdf

[PDF Binary Data]
```

### **Frontend Implementation:**
```javascript
// Download invoice
const downloadInvoice = async (orderId) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/invoice`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    console.error('Error downloading invoice:', error);
  }
};
```

---

## 📊 **9. Order Statistics**

### **Endpoint:**
```
GET /api/orders/stats/overview
```

### **Headers:**
```
Authorization: Bearer <user_jwt_token>
```

### **Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "statistics": {
    "totalOrders": 50,
    "totalAmount": 4500,
    "pendingOrders": 5,
    "processingOrders": 10,
    "shippedOrders": 8,
    "deliveredOrders": 25,
    "cancelledOrders": 2
  }
}
```

---

## 🎨 **Frontend Integration Examples**

### **React - Place Order with Razorpay:**
```javascript
import { useState } from 'react';

function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  const placeOrderWithRazorpay = async (cartId, address, contact) => {
    try {
      setLoading(true);

      // Step 1: Create payment order
      const response = await fetch('/api/payment/orders/create-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartId, address, contact })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: "ArogyaRx",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: async function (razorpayResponse) {
          // Step 3: Verify payment
          await verifyPayment(razorpayResponse);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: contact
        },
        theme: {
          color: "#556B2F"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response) {
        handlePaymentFailure(data.razorpayOrderId, response.error.description);
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(razorpayResponse)
      });

      const data = await response.json();

      if (data.success) {
        alert('Payment successful! Order placed.');
        // Redirect to order details page
        window.location.href = `/orders/${data.order.id}`;
      } else {
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed');
    }
  };

  const handlePaymentFailure = async (orderId, errorDescription) => {
    try {
      await fetch('/api/payment/failure', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          error_description: errorDescription
        })
      });

      alert('Payment failed. Please try again.');
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={() => placeOrderWithRazorpay(cartId, address, contact)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

### **React - Display Orders:**
```javascript
import { useState, useEffect } from 'react';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/orders/simple?page=${currentPage}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order cancelled successfully');
        fetchOrders(); // Refresh orders
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  return (
    <div>
      <h1>My Orders</h1>
      
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <>
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <h3>Order #{order.orderNumber}</h3>
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentMethod} - {order.paymentStatus}</p>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Ordered: {new Date(order.orderedAt).toLocaleDateString()}</p>
              
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item._id}>
                    {item.medicine && (
                      <p>{item.medicine.productName} x {item.quantity}</p>
                    )}
                    {item.labTest && (
                      <p>{item.labTest.testName} x {item.quantity}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-actions">
                <button onClick={() => window.location.href = `/orders/${order._id}`}>
                  View Details
                </button>
                
                {(order.status === 'Pending' || order.status === 'Order Placed') && (
                  <button onClick={() => cancelOrder(order._id)}>
                    Cancel Order
                  </button>
                )}
                
                {order.status === 'Delivered' && (
                  <button onClick={() => window.location.href = `/orders/${order._id}/invoice`}>
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 🔐 **Security Notes**

1. **Always use HTTPS** in production
2. **Never expose Razorpay Key Secret** on frontend
3. **Verify payment signature** on backend before confirming order
4. **Validate user ownership** of cart and orders
5. **Use secure JWT tokens** for authentication

---

## 📱 **Order Status Flow**

### **COD Orders:**
```
Pending → Order Placed → Processing → Shipped → Delivered
                ↓
            Cancelled (if cancelled before shipping)
```

### **Online Payment Orders:**
```
Payment Pending → Payment Completed → Order Placed → Processing → Shipped → Delivered
       ↓                    ↓
Payment Failed        Order Rejected (if payment fails)
```

---

## 💡 **Best Practices**

1. **Check cart before payment** - Validate stock availability
2. **Handle payment failures gracefully** - Show clear error messages
3. **Store order ID** - Save order ID after successful payment
4. **Show order status** - Keep users informed about order progress
5. **Enable reorder** - Make it easy for users to reorder previous orders
6. **Provide invoice** - Allow users to download invoices for delivered orders

---

## 🐛 **Common Errors**

### **400 - Insufficient Stock**
```json
{
  "success": false,
  "message": "Insufficient stock",
  "error": "Not enough stock for Paracetamol 500mg"
}
```
**Solution:** Check stock before adding to cart

### **403 - Access Denied**
```json
{
  "success": false,
  "message": "Access denied",
  "error": "You can only place orders from your own cart"
}
```
**Solution:** Ensure user is authenticated and cart belongs to them

### **404 - Cart Not Found**
```json
{
  "success": false,
  "message": "Cart not found or empty"
}
```
**Solution:** Verify cart ID and ensure cart has items

### **400 - Invalid Payment Signature**
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```
**Solution:** Check Razorpay integration and webhook configuration

---

## 📞 **Support**

For any issues with orders or payments:
- Email: support@arogyarx.com
- Phone: +91-1234567890
- Check order status in "My Orders" section