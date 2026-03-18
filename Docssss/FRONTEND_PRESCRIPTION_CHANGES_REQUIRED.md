# Frontend Prescription API Changes Required

## Overview
Backend prescription APIs mein major changes kiye gaye hain. Frontend code update karna zaroori hai.

## 🔄 Main Changes Summary

### 1. **Response Format Changed**
**OLD FORMAT:**
```javascript
// Direct data response
{
  "_id": "123",
  "imageUrl": "...",
  "status": "pending"
}
```

**NEW FORMAT:**
```javascript
// Structured response with success flag
{
  "success": true,
  "message": "Prescription uploaded successfully",
  "data": {
    "_id": "123",
    "imageUrl": "...",
    "status": "pending"
  }
}
```

### 2. **Error Format Changed**
**OLD FORMAT:**
```javascript
{
  "message": "Error message"
}
```

**NEW FORMAT:**
```javascript
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error (development only)"
}
```

### 3. **API Endpoints Changed**
- `GET /api/prescriptions/my-prescriptions` (NEW - Get user's prescriptions)
- `DELETE /api/prescriptions/me/:id` (CHANGED - Delete own prescription)
- `GET /api/prescriptions/test` (NEW - Health check)

## 📝 Required Frontend Code Changes

### 1. Upload Prescription Function

**BEFORE:**
```javascript
const uploadPrescription = async (file) => {
  const response = await fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const data = await response.json();
  
  // OLD: Direct check
  if (response.ok) {
    console.log('Uploaded:', data);
    return data;
  }
};
```

**AFTER:**
```javascript
const uploadPrescription = async (file) => {
  const response = await fetch('/api/prescriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const data = await response.json();
  
  // NEW: Check success field
  if (data.success) {
    console.log('Uploaded:', data.data);
    alert(data.message);
    return data.data;
  } else {
    alert(data.message || 'Upload failed');
    return null;
  }
};
```

### 2. Get My Prescriptions Function

**BEFORE:**
```javascript
const getMyPrescriptions = async () => {
  const response = await fetch('/api/prescriptions/patient/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const prescriptions = await response.json();
  return prescriptions;
};
```

**AFTER:**
```javascript
const getMyPrescriptions = async () => {
  // NEW: Updated endpoint
  const response = await fetch('/api/prescriptions/my-prescriptions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  // NEW: Check success and use data property
  if (data.success) {
    console.log('Total count:', data.count);
    return data.data;
  } else {
    console.error('Error:', data.message);
    return [];
  }
};
```

### 3. Delete Prescription Function

**BEFORE:**
```javascript
const deletePrescription = async (prescriptionId) => {
  const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    alert('Deleted successfully');
    return true;
  }
};
```

**AFTER:**
```javascript
const deletePrescription = async (prescriptionId) => {
  // NEW: Updated endpoint path
  const response = await fetch(`/api/prescriptions/me/${prescriptionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  // NEW: Check success field
  if (data.success) {
    alert(data.message);
    return true;
  } else {
    alert(data.message || 'Failed to delete');
    return false;
  }
};
```

### 4. Get Prescription by ID Function

**BEFORE:**
```javascript
const getPrescriptionById = async (id) => {
  const response = await fetch(`/api/prescriptions/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const prescription = await response.json();
  return prescription;
};
```

**AFTER:**
```javascript
const getPrescriptionById = async (id) => {
  const response = await fetch(`/api/prescriptions/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  
  // NEW: Check success field
  if (data.success) {
    return data.data;
  } else {
    console.error('Error:', data.message);
    return null;
  }
};
```
## 🎯 React Component Updates

### Updated MyPrescriptions Component

```javascript
import React, { useState, useEffect } from 'react';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    
    try {
      // NEW: Updated endpoint
      const response = await fetch('/api/prescriptions/my-prescriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      // NEW: Handle new response format
      if (data.success) {
        setPrescriptions(data.data);
      } else {
        setError(data.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error fetching prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      // NEW: Updated delete endpoint
      const response = await fetch(`/api/prescriptions/me/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      // NEW: Handle new response format
      if (data.success) {
        alert(data.message);
        fetchPrescriptions(); // Refresh list
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting prescription');
    }
  };

  if (loading) return <div>Loading prescriptions...</div>;
  if (error) return <div className="error">{error}</div>;

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
              <div className="prescription-image">
                {prescription.imageUrl.endsWith('.pdf') ? (
                  <div className="pdf-icon">📄 PDF</div>
                ) : (
                  <img 
                    src={prescription.imageUrl} 
                    alt="Prescription"
                    onClick={() => window.open(prescription.imageUrl, '_blank')}
                  />
                )}
              </div>

              <div className="prescription-details">
                <p><strong>Status:</strong> {prescription.status}</p>
                <p><strong>Uploaded:</strong> {new Date(prescription.createdAt).toLocaleDateString()}</p>
                {prescription.dateIssued && (
                  <p><strong>Issued:</strong> {new Date(prescription.dateIssued).toLocaleDateString()}</p>
                )}
              </div>

              <div className="prescription-actions">
                <button onClick={() => window.open(prescription.imageUrl, '_blank')}>
                  View
                </button>
                <button onClick={() => handleDelete(prescription._id)}>
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
### Updated PrescriptionUpload Component

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

      // NEW: Handle new response format
      if (data.success) {
        alert(data.message);
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
## 🔧 Order-Related Prescription Changes

### Check Prescription Status for Cart

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
    
    // NEW: Check success field
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

### Upload Order Prescription

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
      },
      body: formData
    });
    
    const data = await response.json();
    
    // NEW: Check success field
    if (data.success) {
      console.log('Prescription uploaded:', data.data);
      alert(data.message);
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
```

## ⚠️ Critical Changes Checklist

### ✅ Must Update:

1. **Response Handling:**
   - Check `data.success` instead of `response.ok`
   - Access actual data from `data.data` property
   - Handle error messages from `data.message`

2. **API Endpoints:**
   - Change `/api/prescriptions/patient/me` → `/api/prescriptions/my-prescriptions`
   - Change `/api/prescriptions/:id` → `/api/prescriptions/me/:id` (for delete)

3. **Error Handling:**
   - Update error checking logic
   - Display user-friendly error messages
   - Handle new error response format

4. **Success Messages:**
   - Show success messages from `data.message`
   - Update user feedback based on new response format

### 🔍 Testing Required:

1. **Upload Prescription:**
   - Test file upload with new response format
   - Verify error handling for invalid files
   - Check success message display

2. **Get Prescriptions:**
   - Test prescription list loading
   - Verify pagination if implemented
   - Check empty state handling

3. **Delete Prescription:**
   - Test prescription deletion
   - Verify confirmation dialogs
   - Check list refresh after deletion

4. **Order Prescriptions:**
   - Test prescription status checking
   - Verify order prescription upload
   - Check prescription verification flow

## 🚀 Migration Steps

1. **Update API Functions:**
   - Replace all prescription API calls with new format
   - Update response handling logic
   - Add proper error handling

2. **Update Components:**
   - Modify React components to use new API format
   - Update state management for new response structure
   - Add loading and error states

3. **Test Thoroughly:**
   - Test all prescription-related functionality
   - Verify error scenarios
   - Check user experience flow

4. **Deploy:**
   - Deploy frontend changes
   - Monitor for any issues
   - Verify production functionality

## 📞 Support

Agar koi doubt ho ya implementation me issue aaye, to backend team se contact karo.

**Happy Coding! 🚀**