"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Heart,
  Share2,
  Pill,
  AlertTriangle,
  Info,
  Package,
  Calendar,
  Loader2,
  ChevronLeft,
  Plus,
  Minus,
} from "lucide-react"
import { medicinesApi, type Medicine } from "@/lib/api/medicines"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/auth-utils"
import { format } from "date-fns"

export default function MedicineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [medicine, setMedicine] = React.useState<Medicine | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [quantity, setQuantity] = React.useState(1)
  const [addingToCart, setAddingToCart] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [cartQuantity, setCartQuantity] = React.useState(0)

  React.useEffect(() => {
    if (params.id) {
      loadMedicine(params.id as string)
      loadCartItems()
    }
  }, [params.id])

  const loadCartItems = async () => {
    try {
      const { getCart } = await import("@/lib/api/cart")
      const cartData = await getCart()
      const medicineId = params.id as string
      const cartItem = cartData.cart.items.find((item: any) => item.medicineId?._id === medicineId)
      if (cartItem) {
        setCartQuantity(cartItem.quantity)
      }
    } catch (error) {
      // Cart might be empty or user not logged in
    }
  }

  const loadMedicine = async (id: string) => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      const response = await medicinesApi.getById(id)
      console.log("=== MEDICINE API RESPONSE ===");
      console.log("Full Response:", response);
      console.log("Response Data:", response?.data);
      console.log("Direct Response:", response);
      console.log("============================");
      
      // Handle both response formats: direct data or wrapped in success/data
      const medicineData = response?.data || response
      console.log("=== PROCESSED MEDICINE DATA ===");
      console.log("Medicine Data:", medicineData);
      console.log("Stock:", medicineData?.stock);
      console.log("Stock Quantity:", medicineData?.stock?.quantity);
      console.log("===============================");
      
      setMedicine(medicineData)
    } catch (error) {
      console.error("Failed to load medicine:", error)
      toast({
        title: "Error",
        description: "Failed to load medicine details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!medicine) return

    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setAddingToCart(true)
    try {
      const { addToCart } = await import("@/lib/api/cart")
      const result = await addToCart({
        medicineId: medicine._id,
        quantity: 1,
      })

      if (result.message) {
        setCartQuantity(1)
        toast({
          title: "Success",
          description: `${medicine.productName} added to cart`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!medicine || newQuantity < 1) return

    setAddingToCart(true)
    try {
      try {
        const { updateCartQuantity } = await import("@/lib/api/cart")
        await updateCartQuantity({
          medicineId: medicine._id,
          quantity: newQuantity,
        })
        setCartQuantity(newQuantity)
      } catch (updateError: any) {
        const { removeFromCart, addToCart } = await import("@/lib/api/cart")
        await removeFromCart({ medicineId: medicine._id })
        await addToCart({ medicineId: medicine._id, quantity: newQuantity })
        setCartQuantity(newQuantity)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      })
      loadCartItems()
    } finally {
      setAddingToCart(false)
    }
  }

  const handleRemoveFromCart = async () => {
    if (!medicine) return

    setAddingToCart(true)
    try {
      const { removeFromCart } = await import("@/lib/api/cart")
      await removeFromCart({ medicineId: medicine._id })
      setCartQuantity(0)
      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading medicine details...</p>
          </div>
      </div>
    )
  }

  if (!medicine) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Medicine Not Found</h2>
            <p className="mt-2 text-muted-foreground">The medicine you're looking for doesn't exist</p>
            <Button className="mt-4" onClick={() => router.push("/medicines")}>
              Browse Medicines
            </Button>
          </div>
      </div>
    )
  }

  // Check stock availability - simple check matching list page
  const stockData = medicine.stock || {}
  const stockQuantity = stockData.quantity ?? 0
  
  // Medicine is in stock if quantity is greater than 0
  // Negative quantities are treated as out of stock
  const inStock = stockQuantity > 0

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log("=== MEDICINE DETAIL STOCK CHECK ===");
    console.log("Medicine:", medicine.productName);
    console.log("Stock Data:", stockData);
    console.log("Stock Quantity:", stockQuantity);
    console.log("In Stock:", inStock);
    console.log("Note: Negative stock is treated as out of stock");
    console.log("===================================");
  }

  return (
    <div className="container px-4 py-8 md:px-6">
          {/* Breadcrumb */}
          <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images Section */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={medicine.images[selectedImage] || "/placeholder.svg"}
                      alt={medicine.productName}
                      className="h-full w-full object-contain p-8"
                    />
                    {medicine.prescriptionRequired && (
                      <Badge className="absolute top-4 right-4" variant="destructive">
                        Prescription Required
                      </Badge>
                    )}
                    {medicine.pricing.discount > 0 && (
                      <Badge className="absolute top-4 left-4 bg-primary">
                        {medicine.pricing.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {medicine.images.length > 1 && (
                <div className="flex gap-2">
                  {medicine.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 ${
                        selectedImage === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={image} alt={`${medicine.productName} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{medicine.productName}</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  {medicine.brandName} • {medicine.manufacturer}
                </p>
                <p className="text-sm text-muted-foreground">Generic: {medicine.genericName}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">₹{medicine.pricing.sellingPrice}</span>
                {medicine.pricing.discount > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{medicine.pricing.mrp}</span>
                    <Badge className="bg-primary">{medicine.pricing.discount}% OFF</Badge>
                  </>
                )}
              </div>

              <Separator />

              {/* Key Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Form</p>
                    <p className="font-medium">{medicine.dosage.form}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pack Size</p>
                    <p className="font-medium">{medicine.packaging.packSize}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Strength</p>
                    <p className="font-medium">{medicine.dosage.strength}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{medicine.manufacturer}</p>
                  </div>
                </div>

                {medicine.dosage.recommendedDosage && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended Dosage</p>
                      <p className="font-medium">{medicine.dosage.recommendedDosage}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Availability Status */}
              <div>
                {inStock ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      In Stock
                    </Badge>
                    {stockQuantity > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {stockQuantity} {stockData.unit || 'units'} available
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="destructive">Currently Unavailable</Badge>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                {cartQuantity > 0 ? (
                  <div className="flex items-center gap-2 flex-1 border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-none hover:bg-primary hover:text-primary-foreground"
                      disabled={addingToCart}
                      onClick={() => {
                        if (cartQuantity === 1) {
                          handleRemoveFromCart()
                        } else {
                          handleUpdateQuantity(cartQuantity - 1)
                        }
                      }}
                    >
                      {cartQuantity === 1 ? (
                        <ShoppingCart className="h-5 w-5" />
                      ) : (
                        <Minus className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="flex-1 text-center font-semibold text-lg bg-muted/50 h-12 flex items-center justify-center">
                      {addingToCart ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        cartQuantity
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-none hover:bg-primary hover:text-primary-foreground"
                      disabled={addingToCart || cartQuantity >= stockQuantity}
                      onClick={() => handleUpdateQuantity(cartQuantity + 1)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="flex-1"
                    size="lg"
                    disabled={!inStock || addingToCart}
                    onClick={handleAddToCart}
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {medicine.prescriptionRequired && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Prescription Required</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You'll need to upload a valid prescription to purchase this medicine
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="composition">Composition</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">About {medicine.productName}</h3>
                    <p className="text-muted-foreground leading-relaxed">{medicine.description}</p>

                    {medicine.additionalFeatures?.doctorAdvice && (
                      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Doctor's Advice</h4>
                            <p className="mt-2 text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                              {medicine.additionalFeatures.doctorAdvice}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {medicine.additionalFeatures && (
                      <div className="mt-6">
                        <h4 className="mb-3 font-medium">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {medicine.additionalFeatures.fastActing && <Badge variant="secondary">Fast Acting</Badge>}
                          {medicine.additionalFeatures.sugarFree && <Badge variant="secondary">Sugar Free</Badge>}
                          {medicine.additionalFeatures.glutenFree && <Badge variant="secondary">Gluten Free</Badge>}
                        </div>
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="mt-6 space-y-3">
                      <h4 className="mb-3 font-medium">Product Details</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {medicine.itemID && (
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Item ID</p>
                            <p className="font-medium">{medicine.itemID}</p>
                          </div>
                        )}
                        {medicine.itemCode && (
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Item Code</p>
                            <p className="font-medium">{medicine.itemCode}</p>
                          </div>
                        )}
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Category</p>
                          <p className="font-medium">{medicine.category}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Generic Name</p>
                          <p className="font-medium">{medicine.genericName}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="composition" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Composition</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">Active Ingredients</h4>
                        <ul className="space-y-2">
                          {Array.isArray(medicine.composition.activeIngredients) && 
                           typeof medicine.composition.activeIngredients[0] === 'object' ? (
                            medicine.composition.activeIngredients.map((ingredient: any, index) => (
                              <li key={index} className="flex items-center justify-between rounded-lg border p-3">
                                <span>{ingredient.name || ingredient}</span>
                                {ingredient.strength && <Badge variant="secondary">{ingredient.strength}</Badge>}
                              </li>
                            ))
                          ) : (
                            (medicine.composition.activeIngredients as string[]).map((ingredient, index) => (
                              <li key={index} className="flex items-center rounded-lg border p-3">
                                <span>{ingredient}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {medicine.composition.inactiveIngredients && medicine.composition.inactiveIngredients.length > 0 && (
                        <div>
                          <h4 className="mb-2 font-medium">Inactive Ingredients</h4>
                          <p className="text-sm text-muted-foreground">
                            {medicine.composition.inactiveIngredients.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Usage Instructions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium">How to Use</h4>
                        <p className="text-muted-foreground leading-relaxed">{medicine.usageInstructions}</p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="mb-2 font-medium">Dosage Information</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Route</p>
                            <p className="font-medium">{medicine.dosage.route}</p>
                          </div>
                          {medicine.dosage.frequency && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Frequency</p>
                              <p className="font-medium">{medicine.dosage.frequency}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {medicine.sideEffects && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Possible Side Effects</h4>
                            <p className="text-muted-foreground leading-relaxed">{medicine.sideEffects}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="warnings" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Warnings & Precautions</h3>
                    <div className="space-y-4">
                      {(medicine.warnings || (medicine.regulatory?.warnings && medicine.regulatory.warnings.length > 0)) && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                          <div className="flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-900">Important Warnings</h4>
                              {medicine.warnings ? (
                                <p className="mt-2 text-sm text-amber-800 leading-relaxed">{medicine.warnings}</p>
                              ) : medicine.regulatory?.warnings && (
                                <ul className="mt-2 space-y-1">
                                  {medicine.regulatory.warnings.map((warning, index) => (
                                    <li key={index} className="text-sm text-amber-800 leading-relaxed">• {warning}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {(medicine.sideEffects || (medicine.regulatory?.sideEffects && medicine.regulatory.sideEffects.length > 0)) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Possible Side Effects</h4>
                            {medicine.sideEffects ? (
                              <p className="text-muted-foreground leading-relaxed">{medicine.sideEffects}</p>
                            ) : medicine.regulatory?.sideEffects && (
                              <ul className="space-y-1">
                                {medicine.regulatory.sideEffects.map((effect, index) => (
                                  <li key={index} className="text-muted-foreground">• {effect}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      )}

                      {(medicine.contraindications || (medicine.regulatory?.contraindications && medicine.regulatory.contraindications.length > 0)) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Contraindications</h4>
                            {medicine.contraindications ? (
                              <p className="text-muted-foreground leading-relaxed">{medicine.contraindications}</p>
                            ) : medicine.regulatory?.contraindications && (
                              <ul className="space-y-1">
                                {medicine.regulatory.contraindications.map((contra, index) => (
                                  <li key={index} className="text-muted-foreground">• {contra}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      )}

                      {medicine.regulatory?.interactions && medicine.regulatory.interactions.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Drug Interactions</h4>
                            <p className="text-muted-foreground">
                              May interact with: {medicine.regulatory.interactions.join(", ")}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Pricing Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-3 font-medium">Price Breakdown</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">MRP (Maximum Retail Price)</p>
                            <p className="text-2xl font-bold">₹{medicine.pricing.mrp.toFixed(2)}</p>
                          </div>
                          <div className="rounded-lg border p-4 bg-primary/5">
                            <p className="text-sm text-muted-foreground">Selling Price</p>
                            <p className="text-2xl font-bold text-primary">₹{medicine.pricing.sellingPrice.toFixed(2)}</p>
                          </div>
                          {medicine.pricing.discount > 0 && (
                            <div className="rounded-lg border p-4">
                              <p className="text-sm text-muted-foreground">Discount</p>
                              <p className="text-2xl font-bold text-green-600">{medicine.pricing.discount}%</p>
                            </div>
                          )}
                          {medicine.pricing.discount > 0 && (
                            <div className="rounded-lg border p-4">
                              <p className="text-sm text-muted-foreground">You Save</p>
                              <p className="text-2xl font-bold text-green-600">
                                ₹{(medicine.pricing.mrp - medicine.pricing.sellingPrice).toFixed(2)}
                              </p>
                            </div>
                          )}
                          {medicine.pricing.rate !== undefined && medicine.pricing.rate > 0 && (
                            <div className="rounded-lg border p-4">
                              <p className="text-sm text-muted-foreground">Rate</p>
                              <p className="text-xl font-bold">₹{medicine.pricing.rate.toFixed(2)}</p>
                            </div>
                          )}
                          {medicine.pricing.addLess !== undefined && medicine.pricing.addLess !== 0 && (
                            <div className="rounded-lg border p-4">
                              <p className="text-sm text-muted-foreground">Add/Less</p>
                              <p className="text-xl font-bold">₹{medicine.pricing.addLess.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {medicine.tax && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-3 font-medium">Tax Information</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {medicine.tax.hsnCode && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">HSN Code</p>
                                  <p className="font-medium">{medicine.tax.hsnCode}</p>
                                </div>
                              )}
                              {medicine.tax.hsnName && medicine.tax.hsnName !== 'N/A' && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">HSN Name</p>
                                  <p className="font-medium">{medicine.tax.hsnName}</p>
                                </div>
                              )}
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">SGST (State GST)</p>
                                <p className="font-medium">{medicine.tax.sgst}%</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">CGST (Central GST)</p>
                                <p className="font-medium">{medicine.tax.cgst}%</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">IGST (Integrated GST)</p>
                                <p className="font-medium">{medicine.tax.igst}%</p>
                              </div>
                              <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm text-muted-foreground">Total GST</p>
                                <p className="font-medium">{medicine.tax.sgst + medicine.tax.cgst}%</p>
                              </div>
                              {medicine.tax.localTax !== undefined && medicine.tax.localTax > 0 && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Local Tax</p>
                                  <p className="font-medium">{medicine.tax.localTax}%</p>
                                </div>
                              )}
                              {medicine.tax.centralTax !== undefined && medicine.tax.centralTax > 0 && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Central Tax</p>
                                  <p className="font-medium">{medicine.tax.centralTax}%</p>
                                </div>
                              )}
                              {medicine.tax.oldTax !== undefined && medicine.tax.oldTax > 0 && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Old Tax</p>
                                  <p className="font-medium">{medicine.tax.oldTax}%</p>
                                </div>
                              )}
                              {medicine.tax.taxDiff !== undefined && medicine.tax.taxDiff !== 0 && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Tax Difference</p>
                                  <p className="font-medium">{medicine.tax.taxDiff}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />
                      <div className="rounded-lg bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Note: All prices are inclusive of applicable taxes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="storage" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Storage & Handling</h3>
                    <div className="space-y-4">
                      {(medicine.storageConditions || medicine.packaging.storageInstructions) && (
                        <div>
                          <h4 className="mb-2 font-medium">Storage Conditions</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {medicine.storageConditions || medicine.packaging.storageInstructions}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <h4 className="mb-2 font-medium">Packaging Information</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Pack Size</p>
                            <p className="font-medium">{medicine.packaging.packSize}</p>
                          </div>
                          {medicine.packaging.packType && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Pack Type</p>
                              <p className="font-medium">{medicine.packaging.packType}</p>
                            </div>
                          )}
                          {medicine.packaging.expiryDate && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Expiry Date</p>
                              <p className="font-medium">{format(new Date(medicine.packaging.expiryDate), "PPP")}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {(medicine.regulatory?.drugType || medicine.regulatory?.drugLicenseNumber || medicine.regulatory?.scheduleType) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Regulatory Information</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {medicine.regulatory.drugType && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Drug Type</p>
                                  <p className="font-medium">{medicine.regulatory.drugType}</p>
                                </div>
                              )}
                              {medicine.regulatory.drugLicenseNumber && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Drug License Number</p>
                                  <p className="font-medium">{medicine.regulatory.drugLicenseNumber}</p>
                                </div>
                              )}
                              {medicine.regulatory.scheduleType && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Schedule Type</p>
                                  <p className="font-medium">{medicine.regulatory.scheduleType}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Tax Information */}
                      {medicine.tax && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Tax Information</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {medicine.tax.hsnCode && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">HSN Code</p>
                                  <p className="font-medium">{medicine.tax.hsnCode}</p>
                                </div>
                              )}
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">SGST</p>
                                <p className="font-medium">{medicine.tax.sgst}%</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">CGST</p>
                                <p className="font-medium">{medicine.tax.cgst}%</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">IGST</p>
                                <p className="font-medium">{medicine.tax.igst}%</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Stock Information */}
                      <Separator />
                      <div>
                        <h4 className="mb-2 font-medium">Stock Information</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Available Quantity</p>
                            <p className="font-medium">{stockQuantity} {medicine.stock.unit || 'units'}</p>
                          </div>
                          {medicine.stock.minOrderQuantity && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Min Order Quantity</p>
                              <p className="font-medium">{medicine.stock.minOrderQuantity}</p>
                            </div>
                          )}
                          {medicine.stock.maxOrderQuantity && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Max Order Quantity</p>
                              <p className="font-medium">{medicine.stock.maxOrderQuantity}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="storage" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Storage & Handling</h3>
                    <div className="space-y-4">
                      {(medicine.storageConditions || medicine.packaging.storageInstructions) && (
                        <div>
                          <h4 className="mb-2 font-medium">Storage Conditions</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {medicine.storageConditions || medicine.packaging.storageInstructions}
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <h4 className="mb-2 font-medium">Packaging Information</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">Pack Size</p>
                            <p className="font-medium">{medicine.packaging.packSize}</p>
                          </div>
                          {medicine.packaging.packType && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Pack Type</p>
                              <p className="font-medium">{medicine.packaging.packType}</p>
                            </div>
                          )}
                          {medicine.packaging.expiryDate && (
                            <div className="rounded-lg border p-3">
                              <p className="text-sm text-muted-foreground">Expiry Date</p>
                              <p className="font-medium">{format(new Date(medicine.packaging.expiryDate), "PPP")}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {(medicine.regulatory?.drugType || medicine.regulatory?.drugLicenseNumber || medicine.regulatory?.scheduleType) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Regulatory Information</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {medicine.regulatory.drugType && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Drug Type</p>
                                  <p className="font-medium">{medicine.regulatory.drugType}</p>
                                </div>
                              )}
                              {medicine.regulatory.drugLicenseNumber && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Drug License Number</p>
                                  <p className="font-medium">{medicine.regulatory.drugLicenseNumber}</p>
                                </div>
                              )}
                              {medicine.regulatory.scheduleType && (
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Schedule Type</p>
                                  <p className="font-medium">{medicine.regulatory.scheduleType}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {medicine.tax && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2 font-medium">Tax Information</h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">HSN Code</p>
                                <p className="font-medium">{medicine.tax.hsnCode}</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">HSN Name</p>
                                <p className="font-medium">{medicine.tax.hsnName}</p>
                              </div>
                              <div className="rounded-lg border p-3">
                                <p className="text-sm text-muted-foreground">GST Rate</p>
                                <p className="font-medium">{medicine.tax.igst}% (SGST: {medicine.tax.sgst}% + CGST: {medicine.tax.cgst}%)</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
  )
}
