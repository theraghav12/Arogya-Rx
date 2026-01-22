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
} from "lucide-react"
import { format } from "date-fns"
import { profileApi, type Address } from "@/lib/api/profile"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [updating, setUpdating] = React.useState(false)
  const [profile, setProfile] = React.useState<any>(null)
  const [addresses, setAddresses] = React.useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = React.useState(false)

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
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.get()
      console.log("Profile data loaded:", data) // Debug log
      setProfile(data)
      setProfileForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        contact: data.contact || "",
        gender: data.gender || "",
        dob: data.dob || "",
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const result = await profileApi.update({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        contact: profileForm.contact,
        gender: profileForm.gender,
        dob: profileForm.dob,
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

    setUpdating(true)
    try {
      const result = await profileApi.uploadProfileImage(file)
      console.log("Image upload result:", result) // Debug log
      if (result.success) {
        const newProfileImage = result.profileImage || result.user?.profileImage
        toast({
          title: "Success",
          description: "Profile image updated successfully",
        })
        // Update profile state immediately with new image
        setProfile((prev: any) => ({
          ...prev,
          profileImage: newProfileImage,
        }))
        // Update localStorage using helper function
        updateUserProfile({ profileImage: newProfileImage })
        // Trigger a page reload event to update navbar
        window.dispatchEvent(new Event("storage"))
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
    }
  }

  const handleDeleteImage = async () => {
    if (!confirm("Are you sure you want to delete your profile image?")) return

    setUpdating(true)
    try {
      const result = await profileApi.deleteProfileImage()
      console.log("Image delete result:", result) // Debug log
      if (result.success) {
        toast({
          title: "Success",
          description: "Profile image deleted successfully",
        })
        // Update profile state immediately
        setProfile((prev: any) => ({
          ...prev,
          profileImage: null,
        }))
        // Update localStorage using helper function
        updateUserProfile({ profileImage: null })
        // Trigger a page reload event to update navbar
        window.dispatchEvent(new Event("storage"))
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profile?.profileImage?.url || profile?.profileImage || "/placeholder-user.jpg"} 
                        alt={profile?.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl">{getInitials(profile?.name || "User")}</AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{profile?.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Badge className="mt-3">Verified Account</Badge>
                  
                  {profile?.profileImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleDeleteImage}
                      disabled={updating}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Photo
                    </Button>
                  )}
                  
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
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-6 text-lg font-semibold">Personal Information</h3>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
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
                            <Input
                              id="contact"
                              type="tel"
                              className="pl-9"
                              value={profileForm.contact}
                              onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
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

                <TabsContent value="security" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-6 text-lg font-semibold">Security Settings</h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="mb-3 font-medium">Change Password</h4>
                          <Alert>
                            <AlertDescription>
                              Password change functionality will be available soon. Contact support if you need to reset your password.
                            </AlertDescription>
                          </Alert>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="mb-3 font-medium">Two-Factor Authentication</h4>
                          <p className="mb-4 text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                          <Button variant="outline" disabled>
                            Enable 2FA (Coming Soon)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
  )
}
