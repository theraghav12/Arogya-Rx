"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, updateUserProfile } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  Upload,
  Trash2,
  Plus,
  Home,
  Briefcase,
  User,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { profileApi, type Address } from "@/lib/api/profile"
import { useToast } from "@/hooks/use-toast"

import { ImageCropper } from "@/components/image-cropper"

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [profile, setProfile] = React.useState<any>(null)
  const [addresses, setAddresses] = React.useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = React.useState(false)
  const [prescriptions, setPrescriptions] = React.useState<any[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(false)
  
  // Image cropper states
  const [imageToCrop, setImageToCrop] = React.useState<string | null>(null)
  const [showCropper, setShowCropper] = React.useState(false)

  // Check authentication on mount
  React.useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    gender: "",
    dob: "",
    age: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  })

  const [addressForm, setAddressForm] = React.useState({
    type: "home" as "home" | "work" | "other",
    label: "",
    fullName: "",
    phoneNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
    deliveryInstructions: "",
  })

  React.useEffect(() => {
    loadProfile()
    loadAddresses()
    loadPrescriptions()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.get()
      console.log("Profile data loaded:", data)
      console.log("Profile image data:", data?.profileImage) // Debug profile image
      setProfile(data)
      
      // Clean contact number for display (remove +91 if present)
      let displayContact = data.contact || ""
      if (displayContact.startsWith("+91")) {
        displayContact = displayContact.substring(3)
      }
      
      // Normalize gender to capitalize first letter
      let normalizedGender = data.gender || ""
      if (normalizedGender) {
        normalizedGender = normalizedGender.charAt(0).toUpperCase() + normalizedGender.slice(1).toLowerCase()
      }
      
      // Format DOB for date input (YYYY-MM-DD)
      let formattedDob = ""
      if (data.dob) {
        try {
          const date = new Date(data.dob)
          formattedDob = date.toISOString().split('T')[0]
        } catch (e) {
          console.error("Error formatting DOB:", e)
        }
      }
      
      setProfileForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        contact: displayContact,
        gender: normalizedGender,
        dob: formattedDob,
        age: data.age?.toString() || "",
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        postalCode: data.address?.postalCode || "",
        country: data.address?.country || "India",
      })
    } catch (error) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const data = await profileApi.getAddresses()
      if (data.success && data.addresses) {
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error("Failed to load addresses:", error)
    }
  }

  const loadPrescriptions = async () => {
    setLoadingPrescriptions(true)
    try {
      // Import prescription API
      const { getMyPrescriptions } = await import("@/lib/api/prescriptions")
      const prescriptionsData = await getMyPrescriptions()
      
      setPrescriptions(prescriptionsData.data || [])
    } catch (error) {
      console.error("Failed to load prescriptions:", error)
      setPrescriptions([])
    } finally {
      setLoadingPrescriptions(false)
    }
  }

  const handlePrescriptionUpload = async (file: File) => {
    try {
      const { uploadPrescription } = await import("@/lib/api/prescriptions")
      await uploadPrescription(file)
      
      toast({
        title: "Success",
        description: "Prescription uploaded successfully",
      })
      
      // Reload prescriptions
      loadPrescriptions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload prescription",
        variant: "destructive",
      })
    }
  }

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) {
      return
    }

    try {
      const { deletePrescription } = await import("@/lib/api/prescriptions")
      await deletePrescription(prescriptionId)
      
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      })
      
      // Reload prescriptions
      loadPrescriptions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prescription",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const result = await profileApi.update({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        // contact is not editable, so don't send it
        gender: profileForm.gender,
        dob: profileForm.dob,
        age: profileForm.age ? parseInt(profileForm.age) : undefined,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
          country: profileForm.country,
        },
      })

      if (result.message) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        loadProfile()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should not exceed 5MB",
        variant: "destructive",
      })
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only JPG, PNG, GIF, and WebP images are allowed",
        variant: "destructive",
      })
      return
    }

    // Create a preview URL for cropping
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
    
    // Reset the input
    e.target.value = ""
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false)
    setUpdating(true)
    
    try {
      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], "profile-image.jpg", {
        type: "image/jpeg",
      })
      
      const result = await profileApi.uploadProfileImage(croppedFile)
      console.log("Image upload result:", result)
      
      if (result.success) {
        const newProfileImage = result.profileImage || result.user?.profileImage
        console.log("New profile image:", newProfileImage)
        
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        })
        
        // Update localStorage with new image
        if (newProfileImage) {
          updateUserProfile({ profileImage: newProfileImage })
        }
        
        // Reload the page to show updated image everywhere
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to upload image",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
      setImageToCrop(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setImageToCrop(null)
  }

  const handleDeleteImage = async () => {
    if (!confirm("Are you sure you want to delete your profile image?")) return

    setUpdating(true)
    try {
      const result = await profileApi.deleteProfileImage()
      console.log("Image delete result:", result)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile image deleted successfully",
        })
        
        // Update localStorage
        updateUserProfile({ profileImage: null })
        
        // Reload page to show updated state everywhere
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete image",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Image delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const result = await profileApi.addAddress(addressForm)
      if (result.success) {
        toast({
          title: "Success",
          description: "Address added successfully",
        })
        setShowAddressForm(false)
        setAddressForm({
          type: "home",
          label: "",
          fullName: "",
          phoneNumber: "",
          street: "",
          landmark: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false,
          deliveryInstructions: "",
        })
        loadAddresses()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add address",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const result = await profileApi.deleteAddress(addressId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        })
        loadAddresses()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const result = await profileApi.setDefaultAddress(addressId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Default address updated",
        })
        loadAddresses()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set default address",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      {/* Image Cropper Dialog */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={showCropper}
        />
      )}

      <div className="mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={
                          profile?.profileImage?.url || 
                          (typeof profile?.profileImage === 'string' ? profile?.profileImage : null) || 
                          "/placeholder-user.jpg"
                        } 
                        alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
                        className="object-cover"
                        onError={(e) => {
                          console.log("Image load error:", profile?.profileImage)
                          e.currentTarget.src = "/placeholder-user.jpg"
                        }}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(`${profile?.firstName || ''} ${profile?.lastName || 'User'}`)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload button */}
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                      title="Upload profile image"
                    >
                      <Upload className="h-4 w-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={updating}
                      />
                    </label>
                    
                    {/* Delete button - only show if image exists */}
                    {profile?.profileImage && (
                      <button
                        onClick={handleDeleteImage}
                        disabled={updating}
                        className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        title="Delete profile image"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-bold">
                    {profile?.firstName || profile?.lastName 
                      ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
                      : "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Badge className="mt-3">Verified Account</Badge>
                  
                  {updating && (
                    <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3 text-sm">
                  {profile?.contact && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{profile.contact}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy") : "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="addresses">Addresses</TabsTrigger>
                  <TabsTrigger value="prescriptions">My Prescriptions</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-6 text-lg font-semibold">Personal Information</h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="firstName"
                                className="pl-9"
                                placeholder="John"
                                value={profileForm.firstName}
                                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              className="pl-9"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <div className="absolute left-9 top-2.5 text-sm text-muted-foreground">+91</div>
                            <Input
                              id="contact"
                              type="tel"
                              className="pl-[4.5rem] bg-muted cursor-not-allowed"
                              placeholder="9876543210"
                              value={profileForm.contact}
                              disabled
                              readOnly
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Phone number cannot be changed
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              placeholder="25"
                              value={profileForm.age}
                              onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                              id="dob"
                              type="date"
                              value={profileForm.dob}
                              onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <select
                              id="gender"
                              className="w-full rounded-md border px-3 py-2"
                              value={profileForm.gender}
                              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <h4 className="text-sm font-medium">Address</h4>

                        <div className="space-y-2">
                          <Label htmlFor="street">Street Address</Label>
                          <Input
                            id="street"
                            value={profileForm.street}
                            onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileForm.city}
                              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={profileForm.state}
                              onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              value={profileForm.postalCode}
                              onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={profileForm.country}
                              onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" disabled={updating}>
                            {updating ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button type="button" variant="outline" onClick={loadProfile}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="addresses" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Saved Addresses</h3>
                      <Button onClick={() => setShowAddressForm(!showAddressForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Address
                      </Button>
                    </div>

                    {showAddressForm && (
                      <Card>
                        <CardContent className="p-6">
                          <h4 className="mb-4 font-semibold">Add New Address</h4>
                          <form onSubmit={handleAddAddress} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="addressType">Type</Label>
                                <select
                                  id="addressType"
                                  className="w-full rounded-md border px-3 py-2"
                                  value={addressForm.type}
                                  onChange={(e) =>
                                    setAddressForm({ ...addressForm, type: e.target.value as "home" | "work" | "other" })
                                  }
                                >
                                  <option value="home">Home</option>
                                  <option value="work">Work</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="addressLabel">Label *</Label>
                                <Input
                                  id="addressLabel"
                                  placeholder="e.g., Home, Office"
                                  value={addressForm.label}
                                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                  id="fullName"
                                  value={addressForm.fullName}
                                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                  id="phoneNumber"
                                  type="tel"
                                  value={addressForm.phoneNumber}
                                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="addressStreet">Street Address *</Label>
                              <Input
                                id="addressStreet"
                                value={addressForm.street}
                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="landmark">Landmark</Label>
                              <Input
                                id="landmark"
                                placeholder="Near City Mall"
                                value={addressForm.landmark}
                                onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="addressCity">City *</Label>
                                <Input
                                  id="addressCity"
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="addressState">State *</Label>
                                <Input
                                  id="addressState"
                                  value={addressForm.state}
                                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="addressPostalCode">Postal Code *</Label>
                                <Input
                                  id="addressPostalCode"
                                  value={addressForm.postalCode}
                                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                              <Input
                                id="deliveryInstructions"
                                placeholder="Ring the bell twice"
                                value={addressForm.deliveryInstructions}
                                onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="isDefault"
                                checked={addressForm.isDefault}
                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                className="h-4 w-4"
                              />
                              <Label htmlFor="isDefault" className="font-normal">
                                Set as default address
                              </Label>
                            </div>

                            <div className="flex gap-3">
                              <Button type="submit" disabled={updating}>
                                {updating ? "Adding..." : "Add Address"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddressForm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}

                    {addresses.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No Addresses</h3>
                          <p className="text-sm text-muted-foreground">Add your first delivery address</p>
                        </CardContent>
                      </Card>
                    ) : (
                      addresses.map((address) => (
                        <Card key={address._id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  {address.type === "home" && <Home className="h-4 w-4" />}
                                  {address.type === "work" && <Briefcase className="h-4 w-4" />}
                                  <Badge>{address.label}</Badge>
                                  {address.isDefault && <Badge variant="secondary">Default</Badge>}
                                </div>
                                <p className="font-medium">{address.fullName || profile?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.street}
                                  {address.landmark && `, ${address.landmark}`}
                                  <br />
                                  {address.city}, {address.state} {address.postalCode}
                                  <br />
                                  {address.country}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {address.phoneNumber || profile?.contact}
                                </p>
                                {address.deliveryInstructions && (
                                  <p className="mt-2 text-sm italic text-muted-foreground">
                                    Note: {address.deliveryInstructions}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {!address.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefaultAddress(address._id)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAddress(address._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">My Prescriptions</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{prescriptions.length} Prescription{prescriptions.length !== 1 ? 's' : ''}</Badge>
                        <div>
                          <input
                            type="file"
                            id="prescription-upload"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                // Validate file type
                                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
                                if (!validTypes.includes(file.type)) {
                                  toast({
                                    title: "Invalid File Type",
                                    description: "Only JPG, PNG, and PDF files are allowed",
                                    variant: "destructive",
                                  })
                                  return
                                }
                                
                                // Validate file size (5MB)
                                const maxSize = 5 * 1024 * 1024
                                if (file.size > maxSize) {
                                  toast({
                                    title: "File Too Large",
                                    description: "File size should not exceed 5MB",
                                    variant: "destructive",
                                  })
                                  return
                                }
                                
                                handlePrescriptionUpload(file)
                                e.target.value = '' // Reset input
                              }
                            }}
                            className="hidden"
                          />
                          <label htmlFor="prescription-upload">
                            <Button asChild>
                              <span className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Prescription
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Upload your prescriptions here to use them later when ordering prescription medicines. 
                        Accepted formats: JPG, PNG, PDF (Max 5MB)
                      </AlertDescription>
                    </Alert>

                    {loadingPrescriptions ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Loading prescriptions...</p>
                        </CardContent>
                      </Card>
                    ) : prescriptions.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">No Prescriptions Yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload your prescriptions to keep them handy for future orders
                          </p>
                          <label htmlFor="prescription-upload">
                            <Button asChild variant="outline">
                              <span className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Your First Prescription
                              </span>
                            </Button>
                          </label>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {prescriptions.map((prescription) => (
                          <Card key={prescription._id} className="overflow-hidden">
                            <div className="relative aspect-[3/4] bg-muted">
                              {prescription.imageUrl.endsWith('.pdf') ? (
                                <div className="h-full flex flex-col items-center justify-center p-4">
                                  <FileText className="h-16 w-16 text-muted-foreground mb-2" />
                                  <p className="text-sm text-center text-muted-foreground">PDF Document</p>
                                </div>
                              ) : (
                                <img
                                  src={prescription.imageUrl}
                                  alt="Prescription"
                                  className="h-full w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(prescription.imageUrl, '_blank')}
                                />
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge 
                                    variant={
                                      prescription.status === 'approved' 
                                        ? 'default' 
                                        : prescription.status === 'rejected'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {prescription.status === 'pending' && '📋 Pending'}
                                    {prescription.status === 'processing' && '🔍 Processing'}
                                    {prescription.status === 'approved' && '✅ Approved'}
                                    {prescription.status === 'rejected' && '❌ Rejected'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(prescription.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                                {prescription.dateIssued && (
                                  <p className="text-xs text-muted-foreground">
                                    Issued: {new Date(prescription.dateIssued).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                )}
                                {prescription.processedBy && (
                                  <p className="text-xs text-muted-foreground">
                                    Processed by: {prescription.processedBy.name}
                                  </p>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => window.open(prescription.imageUrl, '_blank')}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePrescription(prescription._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

              </Tabs>
            </div>
          </div>
        </div>
  )
}
