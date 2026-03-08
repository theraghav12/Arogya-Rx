# Order Invoice & Filter API Documentation
## Get Order Invoice aur Get Orders with Filters - Complete Guide

---

## 📋 Table of Contents
1. [Get Order Invoice (Download PDF)](#1-get-order-invoice)
2. [Get Orders with Filters](#2-get-orders-with-filters)

---

## 1. Get Order Invoice

### Endpoint
```
GET /api/orders/:id/invoice
```

### Description
Order ka professional PDF invoice generate karke download karta hai. Invoice me complete order details, items, pricing, tax information, aur company branding hoti hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  id: "64abc123..."  // Required - Order ID
}
```

### Request Example

#### JavaScript/Fetch
```javascript
const downloadInvoice = async (orderId) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/invoice`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download invoice');
    }
    
    // Get the PDF blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Invoice downloaded successfully');
  } catch (error) {
    console.error('Error downloading invoice:', error);
    alert('Failed to download invoice: ' + error.message);
  }
};

// Usage
downloadInvoice('64abc123...');
```

#### Axios
```javascript
import axios from 'axios';

const downloadInvoiceAxios = async (orderId) => {
  try {
    const response = await axios.get(`/api/orders/${orderId}/invoice`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      responseType: 'blob' // Important for PDF download
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    alert('Failed to download invoice');
  }
};
```

#### React Component Example
```javascript
import React, { useState } from 'react';

const InvoiceDownloadButton = ({ orderId, orderNumber }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={downloading}
      className="download-invoice-btn"
    >
      {downloading ? (
        <>
          <span className="spinner"></span>
          Downloading...
        </>
      ) : (
        <>
          📥 Download Invoice
        </>
      )}
    </button>
  );
};

export default InvoiceDownloadButton;
```

### Response

#### Success Response
Returns a PDF file with the following headers:

```javascript
// Response Headers
{
  "Content-Type": "application/pdf",
  "Content-Disposition": "attachment; filename=invoice-A3B9X7.pdf",
  "Content-Length": "45678"  // Size in bytes
}

// Response Body: Binary PDF data
```

#### PDF Invoice Contains:
1. **Company Branding**
   - ArogyaRx logo
   - Company name and tagline
   - Professional design with brand colors

2. **Invoice Header**
   - Invoice badge
   - Issue date and time
   - Order number

3. **Bill To Section**
   - Customer name
   - Delivery address
   - Contact phone
   - Email address

4. **Order Information**
   - Order number
   - Order status
   - Payment method and status
   - Order placed date

5. **Items Table**
   - Product/Test name
   - Product type (medicine/categoryProduct/labTest)
   - Quantity
   - Unit price
   - Line total
   - For lab tests: Patient details if provided

6. **Payment Summary**
   - Subtotal
   - Delivery charges (if applicable)
   - Total amount (with GST breakdown if applicable)

7. **Footer**
   - Thank you message
   - Support contact information

#### Error Responses

```javascript
// Order not found
{
  "success": false,
  "message": "Order not found"
}
// Status Code: 404

// Unauthorized access
{
  "success": false,
  "message": "Not authorized to view this invoice"
}
// Status Code: 403

// Server error
{
  "success": false,
  "message": "Could not generate invoice",
  "error": "Error message" // Only in development mode
}
// Status Code: 500
```

### Important Notes

1. **Authorization**: User can only download invoice for their own orders (unless admin)
2. **PDF Generation**: Uses Puppeteer to generate professional PDF
3. **File Naming**: Invoice filename format: `invoice-{orderNumber}.pdf`
4. **Logo**: Automatically includes ArogyaRx logo if available
5. **Responsive**: PDF is formatted for A4 size with proper margins
6. **Patient Details**: For lab tests, includes patient information if order was placed for someone else

---

## 2. Get Orders with Filters

### Endpoint
```
GET /api/orders/filter
```

### Description
Advanced filtering aur sorting ke saath orders fetch karta hai. Date range, status, payment status se filter kar sakte ho.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### Query Parameters

```javascript
{
  // Pagination
  page: 1,                          // Optional - Default: 1
  limit: 10,                        // Optional - Default: 10
  
  // Filters
  status: "Processing",             // Optional - Order status
  paymentStatus: "Pending",         // Optional - Payment status
  startDate: "2024-01-01",          // Optional - Start date (YYYY-MM-DD)
  endDate: "2024-01-31",            // Optional - End date (YYYY-MM-DD)
  
  // Sorting
  sortBy: "orderedAt",              // Optional - Field to sort by
  sortOrder: "desc"                 // Optional - "asc" or "desc"
}
```

#### Available Filter Values

**status** (Order Status):
- `"Processing"`
- `"Confirmed"`
- `"Shipped"`
- `"Delivered"`
- `"Cancelled"`
- `"Returned"`
- `"Refunded"`

**paymentStatus**:
- `"Pending"`
- `"Completed"`
- `"Failed"`
- `"Refunded"`

**sortBy** (Sort Fields):
- `"orderedAt"` - Order date (default)
- `"totalAmount"` - Order amount
- `"status"` - Order status
- `"paymentStatus"` - Payment status

**sortOrder**:
- `"desc"` - Descending (newest first) - default
- `"asc"` - Ascending (oldest first)

### Request Examples

#### Example 1: Get Recent Orders (Default)
```javascript
const getRecentOrders = async () => {
  try {
    const response = await fetch('/api/orders/filter?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Example 2: Filter by Status
```javascript
const getProcessingOrders = async () => {
  try {
    const response = await fetch(
      '/api/orders/filter?status=Processing&page=1&limit=10',
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Example 3: Filter by Date Range
```javascript
const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate: startDate,  // "2024-01-01"
      endDate: endDate,      // "2024-01-31"
      page: 1,
      limit: 20
    });
    
    const response = await fetch(`/api/orders/filter?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
getOrdersByDateRange('2024-01-01', '2024-01-31');
```

#### Example 4: Multiple Filters with Sorting
```javascript
const getFilteredOrders = async (filters) => {
  try {
    const params = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...(filters.status && { status: filters.status }),
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      sortBy: filters.sortBy || 'orderedAt',
      sortOrder: filters.sortOrder || 'desc'
    });
    
    const response = await fetch(`/api/orders/filter?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage examples
getFilteredOrders({
  status: 'Delivered',
  paymentStatus: 'Completed',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  sortBy: 'totalAmount',
  sortOrder: 'desc',
  page: 1,
  limit: 20
});
```

#### Example 5: React Component with Filters
```javascript
import React, { useState, useEffect } from 'react';

const OrderFilterComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    startDate: '',
    endDate: '',
    sortBy: 'orderedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add all non-empty filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/orders/filter?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="order-filter-container">
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All</option>
            <option value="Processing">Processing</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status:</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="orderedAt">Order Date</option>
            <option value="totalAmount">Amount</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort Order:</label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <button onClick={() => setFilters({
          status: '',
          paymentStatus: '',
          startDate: '',
          endDate: '',
          sortBy: 'orderedAt',
          sortOrder: 'desc',
          page: 1,
          limit: 10
        })}>
          Clear Filters
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <h3>Order #{order.orderNumber}</h3>
                <p>Status: {order.deliveryStatus}</p>
                <p>Payment: {order.paymentStatus}</p>
                <p>Amount: ₹{order.totalAmount}</p>
                <p>Date: {new Date(order.orderedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderFilterComponent;
```

### Response Structure

```javascript
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [
      {
        "_id": "64abc123...",
        "orderNumber": "A3B9X7",
        "status": "Processing",
        "deliveryStatus": "Processing",
        "paymentStatus": "Pending",
        "totalAmount": 500,
        "orderedAt": "2024-01-20T10:30:00.000Z",
        "deliveredAt": null,
        "deliveryOTP": "123456",
        "hasLabTests": false,
        "address": "123 Main St, City",
        "contact": "+919876543210",
        
        // Prescription details
        "prescriptionVerified": false,
        "prescriptionVerificationStatus": "pending",
        "hasPrescriptionRequired": true,
        "medicineSubstitutions": [],
        
        // Order items
        "items": [
          {
            "_id": "64item1...",
            "productType": "medicine",
            "quantity": 2,
            "price": 100,
            "isHomeCollection": false,
            "homeCollectionPrice": 0,
            "labTestSampleOTP": null,
            "labTestStatus": "pending",
            "labTestRecorder": {
              "name": "Not assigned",
              "phone": null,
              "email": null
            },
            
            // Medicine details
            "medicine": {
              "_id": "64med1...",
              "productName": "Paracetamol 500mg",
              "price": 100,
              "image": "https://s3.amazonaws.com/...",
              "category": "General"
            }
          },
          {
            "_id": "64item2...",
            "productType": "labTest",
            "quantity": 1,
            "price": 300,
            "isHomeCollection": true,
            "homeCollectionPrice": 50,
            "labTestSampleOTP": "654321",
            "labTestStatus": "pending",
            "labTestRecorder": {
              "name": "Not assigned",
              "phone": null,
              "email": null
            },
            
            // Lab test details
            "labTest": {
              "_id": "64lab1...",
              "testName": "Complete Blood Count",
              "description": "CBC test",
              "price": 300
            },
            "labTestId": "64lab1...",
            
            // Patient details (if test ordered for someone else)
            "labTestPatientDetails": {
              "name": "Jane Doe",
              "phone": "+919876543211",
              "gender": "Female",
              "age": 30,
              "disease": "Fever"
            }
          }
        ]
      }
      // ... more orders
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

### Error Responses

```javascript
// Authentication required
{
  "success": false,
  "message": "Authentication required",
  "error": "Please log in to view orders"
}
// Status Code: 401

// Server error
{
  "success": false,
  "message": "Server error",
  "error": "Error message" // Only in development mode
}
// Status Code: 500
```

---

## 🎯 Use Cases

### Use Case 1: Download Invoice Button
```javascript
// Simple download button in order details page
<button onClick={() => downloadInvoice(order._id)}>
  Download Invoice
</button>
```

### Use Case 2: Filter Orders by This Month
```javascript
const getThisMonthOrders = async () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0];
  
  return await getFilteredOrders({
    startDate,
    endDate,
    sortBy: 'orderedAt',
    sortOrder: 'desc'
  });
};
```

### Use Case 3: Get Pending Payment Orders
```javascript
const getPendingPaymentOrders = async () => {
  return await getFilteredOrders({
    paymentStatus: 'Pending',
    sortBy: 'orderedAt',
    sortOrder: 'desc'
  });
};
```

### Use Case 4: Get Delivered Orders
```javascript
const getDeliveredOrders = async () => {
  return await getFilteredOrders({
    status: 'Delivered',
    sortBy: 'deliveredAt',
    sortOrder: 'desc'
  });
};
```

---

## ⚠️ Important Notes

### For Get Order Invoice:
1. Only user's own orders can be accessed (unless admin)
2. PDF is generated on-the-fly using Puppeteer
3. Invoice includes all order details with professional formatting
4. File size typically ranges from 50KB to 200KB
5. Logo is automatically included if available in Backend/public/image.png

### For Get Orders with Filters:
1. All filters are optional - can use any combination
2. Date filters use YYYY-MM-DD format
3. Pagination is mandatory (default: page=1, limit=10)
4. Maximum limit per page: 100 orders
5. Sorting works on any returned field
6. Empty filters return all user's orders

---

## 📞 Support

Agar koi doubt ho ya API me koi issue aaye, to backend team se contact karo.

**Happy Coding! 🚀**
