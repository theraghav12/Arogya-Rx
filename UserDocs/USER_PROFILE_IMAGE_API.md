# User Profile Image API Documentation

## Base URL
```
http://localhost:5000/api/profile
```

**Authentication Required:** All endpoints require Bearer token

---

## Table of Contents
1. [Upload/Update Profile Image](#1-uploadupdate-profile-image)
2. [Get Profile Image](#2-get-profile-image)
3. [Delete Profile Image](#3-delete-profile-image)
4. [Get Complete Profile (with image)](#4-get-complete-profile)

---

## 1. Upload/Update Profile Image

**Endpoint:** `POST /api/profile/image`

**Description:** Upload or update user profile image. Image is stored in AWS S3. If user already has a profile image, it will be replaced.

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| profileImage | File | Yes | Image file (JPG, PNG, GIF, WEBP) |

**File Restrictions:**
- Max size: 5MB
- Allowed formats: JPG, JPEG, PNG, GIF, WEBP
- Only image files accepted

**Example Request (JavaScript/Fetch):**
```javascript
const uploadProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);

  const token = localStorage.getItem('userToken');

  const response = await fetch('http://localhost:5000/api/profile/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};

// Usage with file input
const fileInput = document.getElementById('profileImageInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadProfileImage(file);
    console.log(result);
  }
});
```

**Example Request (React):**
```javascript
import React, { useState } from 'react';

const ProfileImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('userToken');

      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.profileImage.url);
        alert('Profile image uploaded successfully!');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Profile" 
          style={{ width: 150, height: 150, borderRadius: '50%' }}
        />
      )}
    </div>
  );
};

export default ProfileImageUpload;
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "profileImage": {
    "url": "https://mymedicos-prod-assets.s3.ap-south-1.amazonaws.com/arogyaRx/profiles/1234567890_profile.jpg",
    "key": "arogyaRx/profiles/1234567890_profile.jpg"
  }
}
```

**Error Responses:**

**400 Bad Request (No file):**
```json
{
  "success": false,
  "message": "No image file provided"
}
```

**400 Bad Request (Invalid file type):**
```json
{
  "success": false,
  "message": "Only image files are allowed!"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 2. Get Profile Image

**Endpoint:** `GET /api/profile/image`

**Description:** Get current user's profile image URL.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Example Request:**
```javascript
const getProfileImage = async () => {
  const token = localStorage.getItem('userToken');

  const response = await fetch('http://localhost:5000/api/profile/image', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Usage
const imageData = await getProfileImage();
console.log(imageData.profileImage.url);
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "profileImage": {
    "url": "https://mymedicos-prod-assets.s3.ap-south-1.amazonaws.com/arogyaRx/profiles/1234567890_profile.jpg",
    "key": "arogyaRx/profiles/1234567890_profile.jpg"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No profile image found"
}
```

---

## 3. Delete Profile Image

**Endpoint:** `DELETE /api/profile/image`

**Description:** Delete user's profile image from AWS S3 and database.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Example Request:**
```javascript
const deleteProfileImage = async () => {
  const token = localStorage.getItem('userToken');

  const response = await fetch('http://localhost:5000/api/profile/image', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Usage
const result = await deleteProfileImage();
if (result.success) {
  console.log('Profile image deleted');
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No profile image to delete"
}
```

---

## 4. Get Complete Profile (with image)

**Endpoint:** `GET /api/profile`

**Description:** Get complete user profile including profile image.

**Headers:**
```
Authorization: Bearer <user_token>
```

**Success Response (200 OK):**
```json
{
  "id": "64abc123def456",
  "email": "user@example.com",
  "contact": "+919876543210",
  "gender": "Male",
  "role": "patient",
  "name": "John Doe",
  "profileImage": {
    "url": "https://mymedicos-prod-assets.s3.ap-south-1.amazonaws.com/arogyaRx/profiles/1234567890_profile.jpg",
    "key": "arogyaRx/profiles/1234567890_profile.jpg"
  },
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-01-15"
}
```

**Note:** If user has no profile image, `profileImage` will be `null`.

---

## Complete React Component Example

```javascript
import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('userToken');

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Update profile with new image
        setProfile(prev => ({
          ...prev,
          profileImage: data.profileImage
        }));
        alert('Profile image updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => ({
          ...prev,
          profileImage: null
        }));
        alert('Profile image deleted!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      
      <div className="profile-image-section">
        {profile?.profileImage ? (
          <div>
            <img 
              src={profile.profileImage.url} 
              alt="Profile" 
              style={{ 
                width: 150, 
                height: 150, 
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <button onClick={handleImageDelete}>Delete Image</button>
          </div>
        ) : (
          <div className="no-image">
            <p>No profile image</p>
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          style={{ marginTop: 10 }}
        />
        {uploading && <p>Uploading...</p>}
      </div>

      <div className="profile-details">
        <p><strong>Name:</strong> {profile?.name}</p>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Contact:</strong> {profile?.contact}</p>
        <p><strong>Gender:</strong> {profile?.gender}</p>
      </div>
    </div>
  );
};

export default UserProfile;
```

---

## Summary

### Endpoints:
- `POST /api/profile/image` - Upload/Update profile image
- `GET /api/profile/image` - Get profile image
- `DELETE /api/profile/image` - Delete profile image
- `GET /api/profile` - Get complete profile (includes image)

### Features:
✅ Upload images to AWS S3  
✅ Automatic old image deletion when updating  
✅ 5MB file size limit  
✅ Image format validation  
✅ Secure S3 URLs  
✅ Easy integration with React/Flutter  

### Storage:
- Images stored in: `arogyaRx/profiles/` folder in S3
- Public read access
- Automatic cleanup on update/delete

---

**Last Updated:** January 2025  
**API Version:** 1.0
