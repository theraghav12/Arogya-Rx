# User-Side Prescription API Complete Guide
## Frontend Integration ke liye Complete Prescription API Documentation

---

## 📋 Table of Contents

### Part A: General Prescription Management
1. [Upload Prescription](#1-upload-prescription)
2. [Get My Prescriptions](#2-get-my-prescriptions)
3. [Get Prescription by ID](#3-get-prescription-by-id)
4. [Delete My Prescription](#4-delete-my-prescription)

### Part B: Order-Specific Prescription Management
5. [Upload Order Prescription](#5-upload-order-prescription)
6. [Get Order Prescription](#6-get-order-prescription)
7. [Delete Order Prescription Image](#7-delete-order-prescription-image)
8. [Check Prescription Status for Cart](#8-check-prescription-status-for-cart)

### Part C: Prescription Flow & Integration
9. [Complete Prescription Flow](#9-complete-prescription-flow)
10. [Prescription Verification Status](#10-prescription-verification-status)

---

## 1. Upload Prescription

### Endpoint
```
POST /api/prescriptions
```

### Description
User apna prescription image/PDF upload kar sakta hai. File S3 me store hoti hai aur database me reference save hota hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

### Request Body (FormData)
```javascript
{
  file: File  // Required - Prescription image or PDF file
}
```

### File Requirements
- **Allowed formats**: JPG, JPEG, PNG, PDF
- **Maximum size**: 5MB
- **Field name**: `file`

### Request Example

#### JavaScript/Fetch
```javascript
const uploadPrescription = async (file) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/prescriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        // Don't set Content-Type, browser will set it with boundary
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      console.log('Prescription uploaded:', data.data);
      alert('Prescription uploaded successfully!');
      return data.data;
    } else {
      alert(data.message || 'Upload failed');
      return null;
    }
  } catch (error) {
    console.error('Error uploading prescription:', error);
    alert('Error uploading prescription');
    return null;
  }
};

// Usage with file input
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadPrescription(file);
  }
};
```

#### Axios
```javascript
import axios from 'axios';

const uploadPrescriptionAxios = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/prescriptions', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      console.log('Prescription uploaded:', response.data.data);
      return response.data.data;
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};
```

#### React Component Example
```javascript
import React, { useState } from 'react';

const PrescriptionUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size should not exceed 5MB');
      return;
    }

    setError('');
    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription uploaded successfully!');
        setFile(null);
        setPreview(null);
        if (onUploadSuccess) onUploadSuccess(data.data);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error uploading prescription');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="prescription-upload">
      <h3>Upload Prescription</h3>

      <div className="upload-area">
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" style={{ maxWidth: '300px' }} />
          </div>
        )}

        {file && (
          <div className="file-info">
            <p>Selected: {file.name}</p>
            <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {error && (
          <div className="error-message" style={{ color: 'red' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload Prescription'}
        </button>
      </div>
    </div>
  );
};

export default PrescriptionUpload;
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "data": {
    "_id": "64abc123...",
    "patientId": "64user1...",
    "imageUrl": "https://bucket.s3.amazonaws.com/arogyaRx/prescriptions/...",
    "status": "pending",
    "dateIssued": "2024-01-20T10:30:00.000Z",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Error Responses

```javascript
// No file uploaded
{
  "success": false,
  "message": "Prescription image is required"
}
// Status Code: 400

// Invalid file type
{
  "success": false,
  "message": "Only JPG, PNG, and PDF files are allowed"
}
// Status Code: 400

// File too large
{
  "success": false,
  "message": "File size should not exceed 5MB"
}
// Status Code: 400

// Not authenticated
{
  "success": false,
  "message": "User not authenticated"
}
// Status Code: 401

// Not a patient
{
  "success": false,
  "message": "Only patients can upload prescriptions"
}
// Status Code: 403

// Upload failed
{
  "success": false,
  "message": "Failed to upload prescription image",
  "error": "Error details" // Only in development
}
// Status Code: 500
```

---

## 2. Get My Prescriptions

### Endpoint
```
GET /api/prescriptions/my-prescriptions
```

### Description
Currently logged-in user ki saari prescriptions fetch karta hai, sorted by most recent first.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### Request Example

#### JavaScript/Fetch
```javascript
const getMyPrescriptions = async () => {
  try {
    const response = await fetch('/api/prescriptions/my-prescriptions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('My prescriptions:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
};
```

#### React Component Example
```javascript
import React, { useState, useEffect } from 'react';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prescriptions/my-prescriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red',
      'processing': 'blue'
    };
    return (
      <span 
        className="status-badge"
        style={{ 
          backgroundColor: statusColors[status] || 'gray',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px'
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const handleDelete = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription deleted successfully');
        fetchPrescriptions(); // Refresh list
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting prescription');
    }
  };

  if (loading) {
    return <div>Loading prescriptions...</div>;
  }

  return (
    <div className="my-prescriptions">
      <h2>My Prescriptions</h2>

      {prescriptions.length === 0 ? (
        <div className="no-prescriptions">
          <p>No prescriptions uploaded yet</p>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {prescriptions.map(prescription => (
            <div key={prescription._id} className="prescription-card">
              {/* Image Preview */}
              <div className="prescription-image">
                {prescription.imageUrl.endsWith('.pdf') ? (
                  <div className="pdf-icon">📄 PDF</div>
                ) : (
                  <img 
                    src={prescription.imageUrl} 
                    alt="Prescription"
                    onClick={() => window.open(prescription.imageUrl, '_blank')}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>

              {/* Details */}
              <div className="prescription-details">
                <p>
                  <strong>Status:</strong> {getStatusBadge(prescription.status)}
                </p>
                <p>
                  <strong>Uploaded:</strong>{' '}
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </p>
                {prescription.dateIssued && (
                  <p>
                    <strong>Issued:</strong>{' '}
                    {new Date(prescription.dateIssued).toLocaleDateString()}
                  </p>
                )}
                {prescription.processedBy && (
                  <p>
                    <strong>Processed by:</strong> {prescription.processedBy.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="prescription-actions">
                <button
                  onClick={() => window.open(prescription.imageUrl, '_blank')}
                  className="view-btn"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(prescription._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrescriptions;
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "64abc123...",
      "patientId": "64user1...",
      "imageUrl": "https://bucket.s3.amazonaws.com/arogyaRx/prescriptions/image1.jpg",
      "imageKey": "arogyaRx/prescriptions/image1.jpg",
      "status": "pending",
      "dateIssued": "2024-01-20T10:30:00.000Z",
      "processedBy": {
        "_id": "64admin1...",
        "name": "Dr. Smith",
        "email": "doctor@example.com"
      },
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    {
      "_id": "64abc456...",
      "patientId": "64user1...",
      "imageUrl": "https://bucket.s3.amazonaws.com/arogyaRx/prescriptions/image2.pdf",
      "imageKey": "arogyaRx/prescriptions/image2.pdf",
      "status": "approved",
      "dateIssued": "2024-01-15T09:00:00.000Z",
      "processedBy": null,
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z"
    }
    // ... more prescriptions
  ]
}
```

#### Error Responses

```javascript
// Not authenticated
{
  "success": false,
  "message": "User not authenticated"
}
// Status Code: 401

// Server error
{
  "success": false,
  "message": "Failed to fetch your prescriptions",
  "error": "Error details" // Only in development
}
// Status Code: 500
```

---

## 3. Get Prescription by ID

### Endpoint
```
GET /api/prescriptions/:id
```

### Description
Specific prescription ki details fetch karta hai. User sirf apni prescription access kar sakta hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  id: "64abc123..."  // Required - Prescription ID
}
```

### Request Example

```javascript
const getPrescriptionById = async (prescriptionId) => {
  try {
    const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Prescription details:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return null;
  }
};
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "patientId": {
      "_id": "64user1...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    },
    "imageUrl": "https://bucket.s3.amazonaws.com/arogyaRx/prescriptions/image1.jpg",
    "imageKey": "arogyaRx/prescriptions/image1.jpg",
    "status": "pending",
    "dateIssued": "2024-01-20T10:30:00.000Z",
    "processedBy": null,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

#### Error Responses

```javascript
// Prescription not found
{
  "success": false,
  "message": "Prescription not found"
}
// Status Code: 404

// Not authorized
{
  "success": false,
  "message": "Not authorized to access this prescription"
}
// Status Code: 403

// Server error
{
  "success": false,
  "message": "Failed to fetch prescription",
  "error": "Error details" // Only in development
}
// Status Code: 500
```

---

## 4. Delete My Prescription

### Endpoint
```
DELETE /api/prescriptions/:id
```

### Description
User apni prescription delete kar sakta hai. File S3 se bhi delete ho jati hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  id: "64abc123..."  // Required - Prescription ID
}
```

### Request Example

```javascript
const deletePrescription = async (prescriptionId) => {
  try {
    // Confirm before deleting
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return false;
    }

    const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('Prescription deleted successfully');
      return true;
    } else {
      alert(data.message || 'Failed to delete prescription');
      return false;
    }
  } catch (error) {
    console.error('Error deleting prescription:', error);
    alert('Error deleting prescription');
    return false;
  }
};
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "message": "Prescription deleted successfully"
}
```

#### Error Responses

```javascript
// Prescription not found or not authorized
{
  "success": false,
  "message": "Prescription not found or you are not authorized to delete it"
}
// Status Code: 404

// Server error
{
  "success": false,
  "message": "Failed to delete prescription",
  "error": "Error details" // Only in development
}
// Status Code: 500
```

---

## 🎨 Complete React Application Example

```javascript
import React, { useState, useEffect } from 'react';
import './PrescriptionManager.css';

const PrescriptionManager = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Fetch all prescriptions
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prescriptions/my-prescriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size should not exceed 5MB');
      return;
    }

    setError('');
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Upload prescription
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription uploaded successfully!');
        setSelectedFile(null);
        setPreview(null);
        fetchPrescriptions(); // Refresh list
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error uploading prescription');
    } finally {
      setUploading(false);
    }
  };

  // Delete prescription
  const handleDelete = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription deleted successfully');
        fetchPrescriptions(); // Refresh list
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting prescription');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: '#ff9800', label: 'Pending' },
      'approved': { color: '#4caf50', label: 'Approved' },
      'rejected': { color: '#f44336', label: 'Rejected' },
      'processing': { color: '#2196f3', label: 'Processing' }
    };

    const config = statusConfig[status] || { color: '#9e9e9e', label: status };

    return (
      <span 
        style={{ 
          backgroundColor: config.color,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="prescription-manager">
      <h1>My Prescriptions</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload New Prescription</h2>
        
        <div className="upload-area">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileSelect}
            disabled={uploading}
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            Choose File
          </label>

          {preview && (
            <div className="preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          {selectedFile && (
            <div className="file-info">
              <p>📄 {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="upload-btn"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Prescription'}
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="prescriptions-section">
        <h2>My Uploaded Prescriptions</h2>

        {loading ? (
          <div className="loading">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <p>No prescriptions uploaded yet</p>
          </div>
        ) : (
          <div className="prescriptions-grid">
            {prescriptions.map(prescription => (
              <div key={prescription._id} className="prescription-card">
                {/* Image */}
                <div className="prescription-image">
                  {prescription.imageUrl.endsWith('.pdf') ? (
                    <div className="pdf-icon">
                      <span style={{ fontSize: '48px' }}>📄</span>
                      <p>PDF Document</p>
                    </div>
                  ) : (
                    <img 
                      src={prescription.imageUrl} 
                      alt="Prescription"
                      onClick={() => window.open(prescription.imageUrl, '_blank')}
                    />
                  )}
                </div>

                {/* Details */}
                <div className="prescription-details">
                  <div className="status-row">
                    {getStatusBadge(prescription.status)}
                  </div>
                  
                  <p className="date">
                    <strong>Uploaded:</strong>{' '}
                    {new Date(prescription.createdAt).toLocaleDateString('en-IN')}
                  </p>

                  {prescription.dateIssued && (
                    <p className="date">
                      <strong>Issued:</strong>{' '}
                      {new Date(prescription.dateIssued).toLocaleDateString('en-IN')}
                    </p>
                  )}

                  {prescription.processedBy && (
                    <p className="processed">
                      <strong>Processed by:</strong> {prescription.processedBy.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="prescription-actions">
                  <button
                    onClick={() => window.open(prescription.imageUrl, '_blank')}
                    className="view-btn"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => handleDelete(prescription._id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionManager;
```

---

## ⚠️ Important Notes

### 1. File Upload
- Maximum file size: 5MB
- Allowed formats: JPG, JPEG, PNG, PDF
- Files are stored on AWS S3
- Temporary files are automatically cleaned up

### 2. Authentication
- All APIs require Bearer token
- Only patients can upload prescriptions
- Users can only access their own prescriptions

### 3. Prescription Status
- **pending**: Newly uploaded, awaiting review
- **processing**: Being reviewed by pharmacist/doctor
- **approved**: Prescription approved
- **rejected**: Prescription rejected

### 4. File Storage
- Files are stored on S3 with unique keys
- S3 URLs are returned in responses
- Files are deleted from S3 when prescription is deleted

### 5. Security
- Users can only view/delete their own prescriptions
- Admin can view all prescriptions
- File type and size validation on server

---

## 📞 Support

Agar koi doubt ho ya API me koi issue aaye, to backend team se contact karo.

**Happy Coding! 🚀**


---

## Part B: Order-Specific Prescription Management

---

## 5. Upload Order Prescription

### Endpoint
```
POST /api/orders/:orderId/prescription
```

### Description
Specific order ke liye prescription images upload karta hai. Order place karne ke baad prescription upload kar sakte ho.

### Headers
```javascript
{
  "Authorization": "Bearer <token>",
  "Content-Type": "multipart/form-data"
}
```

### URL Parameters
```javascript
{
  orderId: "64abc123..."  // Required - Order ID
}
```

### Request Body (FormData)
```javascript
{
  files: [File, File, ...]  // Required - Multiple prescription image files
}
```

### Request Example

```javascript
const uploadOrderPrescription = async (orderId, files) => {
  try {
    const formData = new FormData();
    
    // Add multiple files
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch(`/api/orders/${orderId}/prescription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        // Don't set Content-Type, browser will set it with boundary
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Prescription uploaded:', data.data);
      alert('Prescription uploaded successfully!');
      return data.data;
    } else {
      alert(data.message || 'Upload failed');
      return null;
    }
  } catch (error) {
    console.error('Error uploading prescription:', error);
    alert('Error uploading prescription');
    return null;
  }
};

// Usage with file input
const handleOrderPrescriptionUpload = (orderId, event) => {
  const files = Array.from(event.target.files);
  uploadOrderPrescription(orderId, files);
};
```

#### React Component Example
```javascript
import React, { useState } from 'react';

const OrderPrescriptionUpload = ({ orderId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);

    // Create previews
    const newPreviews = [];
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === selectedFiles.length) {
            setPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/orders/${orderId}/prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription uploaded successfully!');
        setFiles([]);
        setPreviews([]);
        if (onUploadSuccess) onUploadSuccess(data.data);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading prescription');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="order-prescription-upload">
      <h3>Upload Prescription for Order</h3>

      <input
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {previews.length > 0 && (
        <div className="previews">
          {previews.map((preview, index) => (
            <img 
              key={index} 
              src={preview} 
              alt={`Preview ${index + 1}`}
              style={{ width: '100px', height: '100px', margin: '5px' }}
            />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
      >
        {uploading ? 'Uploading...' : 'Upload Prescription'}
      </button>
    </div>
  );
};

export default OrderPrescriptionUpload;
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "data": {
    "orderId": "64abc123...",
    "prescriptionImages": [
      "https://s3.amazonaws.com/arogyaRx/prescriptions/image1.jpg",
      "https://s3.amazonaws.com/arogyaRx/prescriptions/image2.jpg"
    ],
    "prescriptionVerificationStatus": "assigned_to_pharmacist"
  }
}
```

#### Error Responses

```javascript
// Order not found
{
  "success": false,
  "message": "Order not found"
}
// Status Code: 404

// Unauthorized
{
  "success": false,
  "message": "Unauthorized to upload prescription for this order"
}
// Status Code: 403

// No files uploaded
{
  "success": false,
  "message": "No prescription files uploaded"
}
// Status Code: 400
```

---

## 6. Get Order Prescription

### Endpoint
```
GET /api/orders/:orderId/prescription
```

### Description
Order ke prescription images fetch karta hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  orderId: "64abc123..."  // Required - Order ID
}
```

### Request Example

```javascript
const getOrderPrescription = async (orderId) => {
  try {
    const response = await fetch(
      `/api/orders/${orderId}/prescription`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Prescription images:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return null;
  }
};
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "data": {
    "orderId": "64abc123...",
    "prescriptionImages": [
      "https://s3.amazonaws.com/arogyaRx/prescriptions/image1.jpg",
      "https://s3.amazonaws.com/arogyaRx/prescriptions/image2.jpg"
    ],
    "prescriptionVerificationStatus": "verified_by_pharmacist",
    "hasPrescriptionRequired": true
  }
}
```

---

## 7. Delete Order Prescription Image

### Endpoint
```
DELETE /api/orders/:orderId/prescription/:imageKey
```

### Description
Order se specific prescription image delete karta hai.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  orderId: "64abc123...",                    // Required - Order ID
  imageKey: "arogyaRx/prescriptions/..."    // Required - S3 key (URL encoded)
}
```

### Request Example

```javascript
const deleteOrderPrescriptionImage = async (orderId, imageUrl) => {
  try {
    // Extract S3 key from URL
    const urlObj = new URL(imageUrl);
    const imageKey = encodeURIComponent(
      urlObj.pathname.substring(1)
    );
    
    const response = await fetch(
      `/api/orders/${orderId}/prescription/${imageKey}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      alert('Prescription image deleted successfully');
      return data.data;
    } else {
      alert(data.message || 'Failed to delete');
      return null;
    }
  } catch (error) {
    console.error('Error deleting prescription:', error);
    alert('Error deleting prescription');
    return null;
  }
};
```

### Response Structure

#### Success Response
```javascript
{
  "success": true,
  "message": "Prescription image deleted successfully",
  "data": {
    "orderId": "64abc123...",
    "prescriptionImages": [
      "https://s3.amazonaws.com/arogyaRx/prescriptions/image2.jpg"
    ]
  }
}
```

---

## 8. Check Prescription Status for Cart

### Endpoint
```
GET /api/orders/prescription-status/:cartId
```

### Description
Cart me prescription required medicines check karta hai before order placement.

### Headers
```javascript
{
  "Authorization": "Bearer <token>"
}
```

### URL Parameters
```javascript
{
  cartId: "64cart1..."  // Required - Cart ID
}
```

### Request Example

```javascript
const checkPrescriptionStatus = async (cartId) => {
  try {
    const response = await fetch(
      `/api/orders/prescription-status/${cartId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Prescription status:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error checking prescription status:', error);
    return null;
  }
};
```

### Response Structure

```javascript
{
  "success": true,
  "message": "Prescription status checked successfully",
  "data": {
    "cartId": "64cart1...",
    "totalAmount": 500,
    "prescriptionStatus": {
      "hasPrescriptionRequired": true,
      
      "prescriptionRequiredMedicines": [
        {
          "medicineId": "64med1...",
          "productName": "Antibiotic XYZ",
          "quantity": 2,
          "price": 150,
          "prescriptionRequired": true,
          "category": "Antibiotic",
          "imageUrl": "https://s3.amazonaws.com/..."
        }
      ],
      
      "prescriptionNotRequiredMedicines": [
        {
          "medicineId": "64med2...",
          "productName": "Paracetamol 500mg",
          "quantity": 1,
          "price": 100,
          "prescriptionRequired": false,
          "category": "General",
          "imageUrl": "https://s3.amazonaws.com/..."
        }
      ],
      
      "prescriptionRequiredCount": 1,
      "prescriptionNotRequiredCount": 1,
      "totalItems": 2
    },
    "message": "⚠️ This cart contains 1 prescription medicine(s). You will need a valid prescription to complete the order."
  }
}
```

---

## Part C: Prescription Flow & Integration

---

## 9. Complete Prescription Flow

### 📊 Prescription Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESCRIPTION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Adds Medicines to Cart
├── User browses medicines
├── Adds prescription & non-prescription medicines to cart
└── Cart shows prescription requirement warning

Step 2: Check Prescription Status (Before Checkout)
├── API: GET /api/orders/prescription-status/:cartId
├── Shows which medicines need prescription
├── Displays warning if prescription required
└── User can proceed to checkout

Step 3: Place Order
├── API: POST /api/orders/place-order-using-cart
├── Order created with status: "Processing"
├── prescriptionVerificationStatus: "pending"
├── hasPrescriptionRequired: true
└── Order placed successfully

Step 4: Upload Prescription (After Order Placement)
├── User goes to order details page
├── Sees "Upload Prescription" button
├── API: POST /api/orders/:orderId/prescription
├── Uploads prescription images (multiple files)
├── prescriptionVerificationStatus: "assigned_to_pharmacist"
└── Prescription uploaded to S3

Step 5: Pharmacist Verification (Backend/Admin)
├── Pharmacist reviews prescription
├── prescriptionVerificationStatus: "under_verification"
├── Pharmacist verifies medicines
├── May suggest substitutions
└── prescriptionVerificationStatus: "verified_by_pharmacist"

Step 6: Doctor Approval (If Required)
├── Complex prescriptions sent to doctor
├── prescriptionVerificationStatus: "sent_to_doctor"
├── Doctor reviews and approves
└── prescriptionVerificationStatus: "verified_by_doctor"

Step 7: Final Approval
├── prescriptionVerificationStatus: "approved"
├── prescriptionVerified: true
├── Order processing continues
└── Order moves to "Confirmed" status

Step 8: Order Fulfillment
├── Order packed and dispatched
├── Delivery status updated
└── Order delivered

Alternative Flow: Rejection
├── If prescription invalid
├── prescriptionVerificationStatus: "rejected"
├── User notified with reason
├── User can upload new prescription
└── Process restarts from Step 4
```

### 🔄 Prescription Verification Status Flow

```javascript
// Status progression
"pending"                    // Initial state after order placement
    ↓
"assigned_to_pharmacist"     // After prescription upload
    ↓
"under_verification"         // Pharmacist reviewing
    ↓
"verified_by_pharmacist"     // Pharmacist approved
    ↓
"sent_to_doctor"            // Sent for doctor review (if needed)
    ↓
"verified_by_doctor"        // Doctor approved
    ↓
"approved"                  // Final approval - order processing
    
// Alternative path
"rejected"                  // Prescription rejected - user must reupload
```

---

## 10. Prescription Verification Status

### Status Meanings

#### 1. **pending**
- **Meaning**: Order placed, prescription not uploaded yet
- **User Action**: Upload prescription
- **Message**: "📋 Prescription verification pending - Please upload your prescription"

#### 2. **assigned_to_pharmacist**
- **Meaning**: Prescription uploaded, assigned to pharmacist
- **User Action**: Wait for verification
- **Message**: "👨‍⚕️ Prescription assigned to pharmacist for review"

#### 3. **under_verification**
- **Meaning**: Pharmacist is reviewing prescription
- **User Action**: Wait for verification
- **Message**: "🔍 Prescription is being verified by our pharmacist"

#### 4. **verified_by_pharmacist**
- **Meaning**: Pharmacist has verified the prescription
- **User Action**: None (automatic progression)
- **Message**: "✅ Prescription verified by pharmacist"

#### 5. **sent_to_doctor**
- **Meaning**: Prescription sent to doctor for final approval
- **User Action**: Wait for doctor approval
- **Message**: "👩‍⚕️ Prescription sent to doctor for final approval"

#### 6. **verified_by_doctor**
- **Meaning**: Doctor has approved the prescription
- **User Action**: None (automatic progression)
- **Message**: "✅ Prescription approved by doctor"

#### 7. **approved**
- **Meaning**: Prescription fully approved, order processing
- **User Action**: None (order will be processed)
- **Message**: "✅ Prescription approved - Order processing"

#### 8. **rejected**
- **Meaning**: Prescription rejected (invalid/unclear)
- **User Action**: Upload new prescription
- **Message**: "❌ Prescription rejected - Please contact support"

---

## 🎯 Complete Integration Example

### Checkout Flow with Prescription

```javascript
import React, { useState, useEffect } from 'react';

const CheckoutWithPrescription = ({ cartId }) => {
  const [prescriptionStatus, setPrescriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({
    address: '',
    contact: '',
    name: '',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    checkPrescriptionRequirement();
  }, [cartId]);

  // Step 1: Check if prescription is required
  const checkPrescriptionRequirement = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/orders/prescription-status/${cartId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setPrescriptionStatus(data.data.prescriptionStatus);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Place order
  const handlePlaceOrder = async () => {
    // Show warning if prescription required
    if (prescriptionStatus?.hasPrescriptionRequired) {
      const confirmOrder = confirm(
        `This order contains ${prescriptionStatus.prescriptionRequiredCount} prescription medicine(s). ` +
        'You will need to upload a valid prescription after placing the order. Continue?'
      );
      
      if (!confirmOrder) return;
    }

    try {
      const response = await fetch('/api/orders/place-order-using-cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cartId: cartId,
          ...orderDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to order details page
        if (prescriptionStatus?.hasPrescriptionRequired) {
          alert('Order placed! Please upload your prescription now.');
        } else {
          alert('Order placed successfully!');
        }
        window.location.href = `/orders/${data.orderId}`;
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error placing order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="checkout-with-prescription">
      <h2>Checkout</h2>

      {/* Prescription Warning */}
      {prescriptionStatus?.hasPrescriptionRequired && (
        <div className="prescription-warning">
          <h3>⚠️ Prescription Required</h3>
          <p>
            This cart contains {prescriptionStatus.prescriptionRequiredCount} medicine(s) 
            that require a valid prescription:
          </p>
          <ul>
            {prescriptionStatus.prescriptionRequiredMedicines.map(med => (
              <li key={med.medicineId}>
                <strong>{med.productName}</strong> (Qty: {med.quantity})
              </li>
            ))}
          </ul>
          <p className="note">
            ℹ️ You can place the order now and upload the prescription immediately after.
          </p>
        </div>
      )}

      {/* Order Form */}
      <div className="order-form">
        {/* ... order form fields ... */}
        <button onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutWithPrescription;
```

### Order Details with Prescription Upload

```javascript
import React, { useState, useEffect } from 'react';

const OrderDetailsWithPrescription = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [prescriptionImages, setPrescriptionImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    fetchPrescriptionImages();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      setOrder(data.order);
    }
  };

  const fetchPrescriptionImages = async () => {
    const response = await fetch(`/api/orders/${orderId}/prescription`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      setPrescriptionImages(data.data.prescriptionImages || []);
    }
  };

  const handlePrescriptionUpload = async (files) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`/api/orders/${orderId}/prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescription uploaded successfully!');
        fetchPrescriptionImages();
        fetchOrderDetails(); // Refresh to get updated status
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading prescription');
    } finally {
      setUploading(false);
    }
  };

  const getStatusMessage = (status) => {
    const messages = {
      'pending': '📋 Please upload your prescription',
      'assigned_to_pharmacist': '👨‍⚕️ Prescription assigned to pharmacist',
      'under_verification': '🔍 Prescription being verified',
      'verified_by_pharmacist': '✅ Verified by pharmacist',
      'sent_to_doctor': '👩‍⚕️ Sent to doctor for approval',
      'verified_by_doctor': '✅ Approved by doctor',
      'approved': '✅ Prescription approved',
      'rejected': '❌ Prescription rejected'
    };
    return messages[status] || status;
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="order-details-with-prescription">
      <h2>Order #{order.orderNumber}</h2>

      {/* Prescription Section */}
      {order.hasPrescriptionRequired && (
        <div className="prescription-section">
          <h3>Prescription Status</h3>
          <p className="status-message">
            {getStatusMessage(order.prescriptionVerificationStatus)}
          </p>

          {/* Show upload button if pending */}
          {order.prescriptionVerificationStatus === 'pending' && (
            <div className="upload-section">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handlePrescriptionUpload(Array.from(e.target.files))}
                disabled={uploading}
              />
            </div>
          )}

          {/* Show uploaded prescriptions */}
          {prescriptionImages.length > 0 && (
            <div className="uploaded-prescriptions">
              <h4>Uploaded Prescriptions:</h4>
              <div className="prescription-grid">
                {prescriptionImages.map((imageUrl, index) => (
                  <div key={index} className="prescription-image">
                    <img src={imageUrl} alt={`Prescription ${index + 1}`} />
                    <button onClick={() => window.open(imageUrl, '_blank')}>
                      View Full Size
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medicine Substitutions */}
          {order.medicineSubstitutions && order.medicineSubstitutions.length > 0 && (
            <div className="substitutions">
              <h4>Medicine Substitutions:</h4>
              {order.medicineSubstitutions.map((sub, index) => (
                <div key={index} className="substitution">
                  <p>
                    <strong>{sub.originalMedicine}</strong> → {sub.substituteMedicine}
                  </p>
                  <p className="reason">Reason: {sub.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rest of order details */}
    </div>
  );
};

export default OrderDetailsWithPrescription;
```

---

## ⚠️ Important Notes

### For Order Prescription APIs:
1. **Multiple Files**: Can upload multiple prescription images at once
2. **Auto Status Update**: Status automatically changes to "assigned_to_pharmacist" after upload
3. **Order Specific**: Prescriptions are linked to specific orders
4. **S3 Storage**: All files stored on AWS S3

### Prescription Flow Best Practices:
1. **Check Before Checkout**: Always check prescription status before placing order
2. **Immediate Upload**: Prompt user to upload prescription immediately after order placement
3. **Status Tracking**: Show clear status messages to user
4. **Reupload Option**: Allow reupload if prescription is rejected
5. **Multiple Images**: Support multiple prescription images for complex orders

---

## 📞 Support

Agar koi doubt ho ya API me koi issue aaye, to backend team se contact karo.

**Happy Coding! 🚀**


---

## 💡 Advanced Feature: Link Existing Prescription to Order

### Concept
Agar user ne pehle se prescription upload kar rakhi hai (general prescription), to wo naya upload karne ki jagah existing prescription ko order se link kar sakta hai.

### Implementation Approach

#### Option 1: Frontend-Side Solution (Recommended)

User apni existing prescription select kare aur uski image URL ko order me upload kare:

```javascript
const linkExistingPrescriptionToOrder = async (orderId, prescriptionImageUrls) => {
  try {
    // Download existing prescription images as blobs
    const filePromises = prescriptionImageUrls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Extract filename from URL
      const filename = url.split('/').pop();
      
      // Create File object from blob
      return new File([blob], filename, { type: blob.type });
    });
    
    const files = await Promise.all(filePromises);
    
    // Upload to order using existing API
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch(`/api/orders/${orderId}/prescription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Existing prescription linked to order successfully!');
      return data.data;
    } else {
      alert(data.message || 'Failed to link prescription');
      return null;
    }
  } catch (error) {
    console.error('Error linking prescription:', error);
    alert('Error linking prescription to order');
    return null;
  }
};
```

#### Option 2: Backend API Enhancement (Future Implementation)

Backend me ek naya API endpoint banaya ja sakta hai:

```javascript
// Proposed API
POST /api/orders/:orderId/link-prescription

// Request Body
{
  "prescriptionIds": ["64abc123...", "64def456..."]
}

// Response
{
  "success": true,
  "message": "Prescriptions linked to order successfully",
  "data": {
    "orderId": "64order1...",
    "linkedPrescriptions": 2,
    "prescriptionImages": [
      "https://s3.amazonaws.com/...",
      "https://s3.amazonaws.com/..."
    ]
  }
}
```

### Complete React Component Example

```javascript
import React, { useState, useEffect } from 'react';

const PrescriptionSelector = ({ orderId, onLinkSuccess }) => {
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [showUploadNew, setShowUploadNew] = useState(false);

  useEffect(() => {
    fetchMyPrescriptions();
  }, []);

  // Fetch user's existing prescriptions
  const fetchMyPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prescriptions/my-prescriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filter only approved or pending prescriptions
        const validPrescriptions = data.data.filter(
          p => p.status === 'approved' || p.status === 'pending'
        );
        setMyPrescriptions(validPrescriptions);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle prescription selection
  const togglePrescriptionSelection = (prescription) => {
    setSelectedPrescriptions(prev => {
      const isSelected = prev.find(p => p._id === prescription._id);
      if (isSelected) {
        return prev.filter(p => p._id !== prescription._id);
      } else {
        return [...prev, prescription];
      }
    });
  };

  // Link selected prescriptions to order
  const handleLinkPrescriptions = async () => {
    if (selectedPrescriptions.length === 0) {
      alert('Please select at least one prescription');
      return;
    }

    setLinking(true);

    try {
      // Get image URLs from selected prescriptions
      const imageUrls = selectedPrescriptions.map(p => p.imageUrl);

      // Download images as blobs and create File objects
      const filePromises = imageUrls.map(async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split('/').pop();
        return new File([blob], filename, { type: blob.type });
      });

      const files = await Promise.all(filePromises);

      // Upload to order
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/orders/${orderId}/prescription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Prescriptions linked to order successfully!');
        setSelectedPrescriptions([]);
        if (onLinkSuccess) onLinkSuccess(data.data);
      } else {
        alert(data.message || 'Failed to link prescriptions');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error linking prescriptions to order');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="prescription-selector">
      <h3>Select Prescription for Order</h3>

      {/* Toggle between existing and new upload */}
      <div className="toggle-buttons">
        <button
          className={!showUploadNew ? 'active' : ''}
          onClick={() => setShowUploadNew(false)}
        >
          Use Existing Prescription
        </button>
        <button
          className={showUploadNew ? 'active' : ''}
          onClick={() => setShowUploadNew(true)}
        >
          Upload New Prescription
        </button>
      </div>

      {!showUploadNew ? (
        // Show existing prescriptions
        <div className="existing-prescriptions">
          {loading ? (
            <div>Loading your prescriptions...</div>
          ) : myPrescriptions.length === 0 ? (
            <div className="no-prescriptions">
              <p>No existing prescriptions found</p>
              <button onClick={() => setShowUploadNew(true)}>
                Upload New Prescription
              </button>
            </div>
          ) : (
            <>
              <p className="instruction">
                Select one or more prescriptions to link to this order:
              </p>

              <div className="prescription-grid">
                {myPrescriptions.map(prescription => {
                  const isSelected = selectedPrescriptions.find(
                    p => p._id === prescription._id
                  );

                  return (
                    <div
                      key={prescription._id}
                      className={`prescription-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => togglePrescriptionSelection(prescription)}
                    >
                      {/* Checkbox */}
                      <div className="checkbox">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => {}}
                        />
                      </div>

                      {/* Image */}
                      <div className="prescription-image">
                        {prescription.imageUrl.endsWith('.pdf') ? (
                          <div className="pdf-icon">📄</div>
                        ) : (
                          <img src={prescription.imageUrl} alt="Prescription" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="prescription-details">
                        <p className="status">
                          Status: <span className={`badge ${prescription.status}`}>
                            {prescription.status}
                          </span>
                        </p>
                        <p className="date">
                          Uploaded: {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Link Button */}
              <button
                onClick={handleLinkPrescriptions}
                disabled={linking || selectedPrescriptions.length === 0}
                className="link-btn"
              >
                {linking
                  ? 'Linking...'
                  : `Link ${selectedPrescriptions.length} Prescription(s) to Order`}
              </button>
            </>
          )}
        </div>
      ) : (
        // Show upload new prescription form
        <div className="upload-new">
          <OrderPrescriptionUpload
            orderId={orderId}
            onUploadSuccess={onLinkSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default PrescriptionSelector;
```

### CSS Styling Example

```css
.prescription-selector {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.toggle-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.toggle-buttons button {
  flex: 1;
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-buttons button.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.prescription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.prescription-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.prescription-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.prescription-card.selected {
  border-color: #4CAF50;
  background: #e8f5e9;
}

.prescription-card .checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
}

.prescription-card .checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.prescription-image {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 10px;
}

.prescription-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.pdf-icon {
  font-size: 48px;
}

.link-btn {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.link-btn:hover:not(:disabled) {
  background: #45a049;
}

.link-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.instruction {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.badge.approved {
  background: #4CAF50;
  color: white;
}

.badge.pending {
  background: #ff9800;
  color: white;
}
```

### Usage in Order Details Page

```javascript
import React, { useState } from 'react';
import PrescriptionSelector from './PrescriptionSelector';

const OrderDetailsPage = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [showPrescriptionSelector, setShowPrescriptionSelector] = useState(false);

  const handlePrescriptionLinked = (data) => {
    console.log('Prescription linked:', data);
    setShowPrescriptionSelector(false);
    // Refresh order details
    fetchOrderDetails();
  };

  return (
    <div className="order-details-page">
      <h2>Order Details</h2>

      {/* Show prescription selector if prescription required */}
      {order?.hasPrescriptionRequired && 
       order?.prescriptionVerificationStatus === 'pending' && (
        <div className="prescription-section">
          <h3>Prescription Required</h3>
          
          {!showPrescriptionSelector ? (
            <button onClick={() => setShowPrescriptionSelector(true)}>
              📋 Add Prescription
            </button>
          ) : (
            <PrescriptionSelector
              orderId={orderId}
              onLinkSuccess={handlePrescriptionLinked}
            />
          )}
        </div>
      )}

      {/* Rest of order details */}
    </div>
  );
};

export default OrderDetailsPage;
```

---

## 🎯 Benefits of Using Existing Prescriptions

### 1. **User Convenience**
- No need to upload same prescription multiple times
- Faster checkout process
- Better user experience

### 2. **Storage Optimization**
- Reuses existing S3 files
- Reduces duplicate uploads
- Saves storage costs

### 3. **Consistency**
- Same prescription for multiple orders
- Easier tracking for users
- Maintains prescription history

### 4. **Time Saving**
- Quick order placement
- No waiting for upload
- Instant prescription linking

---

## 📝 Implementation Notes

### Current Implementation:
- Frontend downloads existing prescription image
- Converts to File object
- Uploads to order using existing API
- Works with current backend without changes

### Future Enhancement (Backend):
- Create dedicated API endpoint
- Direct database linking without re-upload
- Reference existing prescription IDs
- More efficient and faster

### Recommendation:
Start with **Option 1 (Frontend Solution)** as it works with existing backend. Later, implement **Option 2 (Backend API)** for better performance.

---

## ⚠️ Important Considerations

1. **Prescription Validity**: Check if prescription is still valid (not expired)
2. **Status Check**: Only allow approved/pending prescriptions to be linked
3. **Multiple Orders**: Same prescription can be used for multiple orders
4. **File Format**: Ensure prescription format is compatible (images/PDF)
5. **User Confirmation**: Show preview before linking to order

---

## 📞 Support

Agar implementation me koi doubt ho, to backend team se discuss karo for best approach.

**Happy Coding! 🚀**
