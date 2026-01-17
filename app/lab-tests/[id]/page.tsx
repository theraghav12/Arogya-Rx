"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ShoppingCart,
  Heart,
  Share2,
  Home,
  Clock,
  FileText,
  AlertCircle,
  Info,
  Loader2,
  ChevronLeft,
  TrendingUp,
  Award,
  Beaker,
  Calendar,
} from "lucide-react"
import { labTestsApi, type LabTest } from "@/lib/api/lab-tests"
import { addToCart } from "@/lib/api/cart"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/auth-utils"

export default function LabTestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [test, setTest] = React.useState<LabTest | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [addingToCart, setAddingToCart] = React.useState(false)
  const [isHomeCollection, setIsHomeCollection] = React.useState(false)

  React.useEffect(() => {
    if (params.id) {
      loadTest(params.id as string)
    }
  }, [params.id])

  const loadTest = async (id: string) => {
    setLoading(true)
    try {
      const data = await labTestsApi.getById(id)
      if (data.success && data.data) {
        setTest(data.data)
        setIsHomeCollection(data.data.isHomeCollectionAvailable)
      }
    } catch (error) {
      console.error("Failed to load test:", error)
      toast({
        title: "Error",
        description: "Failed to load test details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!test) return

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
      const result = await addToCart({
        labTestId: test._id,
        quantity: 1,
        isHomeCollection,
      })

      if (result.message) {
        toast({
          title: "Success",
          description: `${test.testName} added to cart`,
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

  const calculateTotal = () => {
    if (!test) return 0
    let total = test.discountedPrice
    if (isHomeCollection && test.isHomeCollectionAvailable) {
      total += test.homeCollectionPrice
    }
    return total
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading test details...</p>
          </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Test Not Found</h2>
            <p className="mt-2 text-muted-foreground">The lab test you're looking for doesn't exist</p>
            <Button className="mt-4" onClick={() => router.push("/lab-tests")}>
              Browse Lab Tests
            </Button>
          </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
          {/* Breadcrumb */}
          <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{test.testName}</h1>
                    <p className="mt-2 text-muted-foreground">{test.category}</p>
                  </div>
                  <div className="flex gap-2">
                    {test.isPopular && (
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {test.isRecommended && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{test.testCode}</span>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-3 text-lg font-semibold">About This Test</h3>
                  <p className="text-muted-foreground leading-relaxed">{test.description}</p>
                </CardContent>
              </Card>

              {/* Detailed Information Tabs */}
              <Tabs defaultValue="parameters" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="preparation">Preparation</TabsTrigger>
                  <TabsTrigger value="sample">Sample Info</TabsTrigger>
                </TabsList>

                <TabsContent value="parameters" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-semibold">
                        Test Parameters ({test.parameters?.length || 0})
                      </h3>
                      {test.parameters && test.parameters.length > 0 ? (
                        <div className="space-y-3">
                          {test.parameters.map((param, index) => (
                            <div key={index} className="rounded-lg border p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{param.name}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {param.unit}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Info className="h-3 w-3" />
                                  <span>Normal Range: {param.normalRange}</span>
                                </div>
                                {param.description && (
                                  <p className="text-muted-foreground">{param.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No parameters information available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preparation" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-semibold">Preparation Instructions</h3>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-900 mb-2">Important Instructions</h4>
                            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-line">
                              {test.preparationInstructions}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Report Delivery Time</p>
                            <p className="font-medium">{test.reportDeliveryTime}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sample" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-4 text-lg font-semibold">Sample Information</h3>
                      <div className="space-y-4">
                        {test.sampleType && (
                          <div className="flex items-center gap-3 rounded-lg border p-4">
                            <Beaker className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Sample Type</p>
                              <p className="font-medium">{test.sampleType}</p>
                            </div>
                          </div>
                        )}

                        {test.sampleVolume && (
                          <div className="flex items-center gap-3 rounded-lg border p-4">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Sample Volume</p>
                              <p className="font-medium">{test.sampleVolume}</p>
                            </div>
                          </div>
                        )}

                        {test.isHomeCollectionAvailable && (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div className="flex gap-3">
                              <Home className="h-5 w-5 text-green-600 shrink-0" />
                              <div>
                                <h4 className="font-medium text-green-900">Home Sample Collection Available</h4>
                                <p className="text-sm text-green-800 mt-1">
                                  Our trained phlebotomist will visit your home to collect the sample
                                </p>
                                <p className="text-sm font-medium text-green-900 mt-2">
                                  Additional Charge: ₹{test.homeCollectionPrice}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Book This Test</h3>

                    {/* Pricing */}
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted-foreground">Test Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">₹{test.discountedPrice}</span>
                          {test.discount > 0 && (
                            <span className="text-sm text-muted-foreground line-through">₹{test.price}</span>
                          )}
                        </div>
                      </div>

                      {test.discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <Badge className="bg-primary">{test.discount}% OFF</Badge>
                        </div>
                      )}

                      {test.isHomeCollectionAvailable && (
                        <>
                          <Separator />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="homeCollection"
                              checked={isHomeCollection}
                              onCheckedChange={(checked) => setIsHomeCollection(checked as boolean)}
                            />
                            <Label htmlFor="homeCollection" className="cursor-pointer flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Home Collection</span>
                                <span className="text-sm font-medium">+₹{test.homeCollectionPrice}</span>
                              </div>
                            </Label>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{test.parameters?.length || 0} Parameters Tested</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Report in {test.reportDeliveryTime}</span>
                    </div>
                    {test.isHomeCollectionAvailable && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>Home Collection Available</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={() => router.push(`/lab-tests/book/${test._id}`)}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Now
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled={addingToCart}
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

                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="flex-1">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="flex-1">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Note:</strong> Fasting and preparation requirements may apply. Please read the
                      preparation instructions carefully.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
  )
}
