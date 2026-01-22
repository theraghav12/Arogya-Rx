"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Grid3x3,
  List,
  ShoppingCart,
  SlidersHorizontal,
  Loader2,
  Home,
  Clock,
  FileText,
  TrendingUp,
  Award,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  User,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"
import { labTestsApi, type LabTest } from "@/lib/api/lab-tests"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, getUser } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { BannerCarousel } from "@/components/banner-carousel"

export default function LabTestsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [tests, setTests] = React.useState<LabTest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [categories, setCategories] = React.useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [filters, setFilters] = React.useState({
    isHomeCollection: false,
    isPopular: false,
    isRecommended: false,
    minPrice: "",
    maxPrice: "",
  })
  const [sortBy, setSortBy] = React.useState("testName")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [pagination, setPagination] = React.useState<any>(null)
  const [statistics, setStatistics] = React.useState<any>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null)
  const [cartItems, setCartItems] = React.useState<Record<string, number>>({})
  
  // Patient details dialog state
  const [showPatientDialog, setShowPatientDialog] = React.useState(false)
  const [selectedTest, setSelectedTest] = React.useState<LabTest | null>(null)
  const [bookingFor, setBookingFor] = React.useState<"self" | "other">("self")
  const [patientName, setPatientName] = React.useState("")
  const [patientAge, setPatientAge] = React.useState("")
  const [patientGender, setPatientGender] = React.useState("")
  const [patientPhone, setPatientPhone] = React.useState("")
  const [patientDisease, setPatientDisease] = React.useState("")
  
  const user = getUser()

  React.useEffect(() => {
    loadCategories()
    loadCartItems()
  }, [])

  React.useEffect(() => {
    loadTests()
  }, [currentPage, sortBy, sortOrder, selectedCategories, filters, searchQuery])

  const loadCartItems = async () => {
    try {
      const { getCart } = await import("@/lib/api/cart")
      const cartData = await getCart()
      const items: Record<string, number> = {}
      cartData.cart.items.forEach((item) => {
        if (item.labTestId) {
          items[item.labTestId._id] = item.quantity
        }
      })
      setCartItems(items)
    } catch (error) {
      // Cart might be empty or user not logged in
    }
  }

  const loadCategories = async () => {
    try {
      const data = await labTestsApi.getCategories()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadTests = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      }

      if (searchQuery.trim()) {
        params.search = searchQuery
      }

      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(",")
      }

      if (filters.isHomeCollection) {
        params.isHomeCollection = true
      }

      if (filters.isPopular) {
        params.isPopular = true
      }

      if (filters.isRecommended) {
        params.isRecommended = true
      }

      const data = await labTestsApi.getAllTypes(params)

      if (data.success) {
        setTests(data.data.tests)
        setPagination(data.data.pagination)
        setStatistics(data.data.statistics)
      }
    } catch (error) {
      console.error("Failed to load tests:", error)
      toast({
        title: "Error",
        description: "Failed to load lab tests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }

  const openPatientDialog = (test: LabTest) => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setSelectedTest(test)
    setBookingFor("self")
    setPatientName(user?.name || "")
    setPatientAge("")
    setPatientGender("")
    setPatientPhone(user?.contact || "")
    setPatientDisease("")
    setShowPatientDialog(true)
  }

  const handleAddToCart = async () => {
    if (!selectedTest) return

    // Validation
    if (!patientName || !patientAge || !patientGender || !patientPhone) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setAddingToCart(selectedTest._id)
    try {
      const { addToCart } = await import("@/lib/api/cart")
      const result = await addToCart({
        labTestId: selectedTest._id,
        quantity: 1,
        isHomeCollection: selectedTest.isHomeCollectionAvailable,
        labTestPatientDetails: {
          name: patientName,
          phone: patientPhone,
          gender: patientGender,
          age: parseInt(patientAge),
          disease: patientDisease || undefined,
        },
      })

      if (result.message) {
        setCartItems(prev => ({ ...prev, [selectedTest._id]: 1 }))
        toast({
          title: "Success",
          description: `${selectedTest.testName} added to cart`,
        })
        setShowPatientDialog(false)
        setSelectedTest(null)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  React.useEffect(() => {
    if (bookingFor === "self" && user) {
      setPatientName(user.name || "")
      setPatientPhone(user.contact || "")
    } else if (bookingFor === "other") {
      setPatientName("")
      setPatientPhone("")
    }
  }, [bookingFor, user])

  const handleUpdateQuantity = async (testId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setAddingToCart(testId)
    try {
      // Try the update endpoint first
      try {
        const { updateCartQuantity } = await import("@/lib/api/cart")
        await updateCartQuantity({
          labTestId: testId,
          quantity: newQuantity,
        })
        setCartItems(prev => ({ ...prev, [testId]: newQuantity }))
      } catch (updateError: any) {
        // If update fails, use remove and re-add approach
        console.log('Update failed, using fallback method:', updateError.message)
        const { removeFromCart, addToCart } = await import("@/lib/api/cart")
        await removeFromCart({ labTestId: testId })
        await addToCart({ labTestId: testId, quantity: newQuantity })
        setCartItems(prev => ({ ...prev, [testId]: newQuantity }))
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      })
      // Reload cart to sync state
      loadCartItems()
    } finally {
      setAddingToCart(null)
    }
  }

  const handleRemoveFromCart = async (testId: string) => {
    setAddingToCart(testId)
    try {
      const { removeFromCart } = await import("@/lib/api/cart")
      await removeFromCart({ labTestId: testId })
      setCartItems(prev => {
        const newItems = { ...prev }
        delete newItems[testId]
        return newItems
      })
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
      setAddingToCart(null)
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setFilters({
      isHomeCollection: false,
      isPopular: false,
      isRecommended: false,
      minPrice: "",
      maxPrice: "",
    })
    setSearchQuery("")
    setCurrentPage(1)
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label htmlFor={category} className="cursor-pointer text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Features</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="homeCollection"
              checked={filters.isHomeCollection}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, isHomeCollection: checked as boolean })
              }
            />
            <Label htmlFor="homeCollection" className="cursor-pointer text-sm">
              Home Collection Available
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="popular"
              checked={filters.isPopular}
              onCheckedChange={(checked) => setFilters({ ...filters, isPopular: checked as boolean })}
            />
            <Label htmlFor="popular" className="cursor-pointer text-sm">
              Popular Tests
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="recommended"
              checked={filters.isRecommended}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, isRecommended: checked as boolean })
              }
            />
            <Label htmlFor="recommended" className="cursor-pointer text-sm">
              Recommended Tests
            </Label>
          </div>
        </div>
      </div>

      {statistics && (
        <>
          <Separator />
          <div>
            <h3 className="mb-3 font-semibold">Price Range</h3>
            <p className="text-sm text-muted-foreground">
              ₹{statistics.priceRange.minPrice} - ₹{statistics.priceRange.maxPrice}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Average: ₹{Math.round(statistics.priceRange.avgPrice)}
            </p>
          </div>
        </>
      )}
    </div>
  )

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading lab tests...</p>
          </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
          {/* Banner Carousel */}
          <div className="mb-6">
            <BannerCarousel page="labtests" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Lab Tests</h1>
            <p className="mt-2 text-muted-foreground">Book diagnostic tests with home sample collection</p>
          </div>

          {/* Search & Filters Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lab tests..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field)
                  setSortOrder(order as "asc" | "desc")
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testName-asc">Name: A to Z</SelectItem>
                  <SelectItem value="testName-desc">Name: Z to A</SelectItem>
                  <SelectItem value="discountedPrice-asc">Price: Low to High</SelectItem>
                  <SelectItem value="discountedPrice-desc">Price: High to Low</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            {/* Desktop Filters */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Tests Grid/List */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pagination ? `Showing ${tests.length} of ${pagination.totalTests} test${pagination.totalTests !== 1 ? "s" : ""}` : `${tests.length} test${tests.length !== 1 ? "s" : ""} found`}
                </div>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>

              {tests.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No lab tests found matching your criteria</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tests.map((test) => (
                    <Card key={test._id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <Link href={`/lab-tests/${test._id}`}>
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-balance leading-tight hover:text-primary line-clamp-2 flex-1">
                                {test.testName}
                              </h3>
                              <div className="flex flex-col gap-1 ml-2">
                                {test.isPopular && (
                                  <Badge variant="secondary" className="text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Popular
                                  </Badge>
                                )}
                                {test.isRecommended && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{test.category}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{test.description}</p>
                          </div>
                        </Link>

                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold">₹{test.discountedPrice}</span>
                            {test.discount > 0 && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">₹{test.price}</span>
                                <Badge className="bg-primary text-xs">{test.discount}% OFF</Badge>
                              </>
                            )}
                          </div>

                          <div className="space-y-2 text-xs text-muted-foreground">
                            {test.isHomeCollectionAvailable && (
                              <div className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                <span>Home Collection: +₹{test.homeCollectionPrice}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Report in {test.reportDeliveryTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{test.parameters?.length || 0} Parameters</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {cartItems[test._id] ? (
                          <div className="flex items-center gap-1 w-full border rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none hover:bg-primary hover:text-primary-foreground"
                              disabled={addingToCart === test._id}
                              onClick={() => {
                                if (cartItems[test._id] === 1) {
                                  handleRemoveFromCart(test._id)
                                } else {
                                  handleUpdateQuantity(test._id, cartItems[test._id] - 1)
                                }
                              }}
                            >
                              {cartItems[test._id] === 1 ? (
                                <Trash2 className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1 text-center font-semibold text-base bg-muted/50 h-10 flex items-center justify-center">
                              {addingToCart === test._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                cartItems[test._id]
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-none hover:bg-primary hover:text-primary-foreground"
                              disabled={addingToCart === test._id}
                              onClick={() => handleUpdateQuantity(test._id, cartItems[test._id] + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            onClick={() => openPatientDialog(test)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <Card key={test._id} className="overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <Link href={`/lab-tests/${test._id}`} className="flex-1">
                                <h3 className="font-semibold hover:text-primary">{test.testName}</h3>
                              </Link>
                              <div className="flex gap-1 ml-2">
                                {test.isPopular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                                {test.isRecommended && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Recommended</Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-2">{test.category}</p>
                            <p className="text-sm text-muted-foreground mb-3">{test.description}</p>

                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                              {test.isHomeCollectionAvailable && (
                                <div className="flex items-center gap-1">
                                  <Home className="h-3 w-3" />
                                  <span>Home Collection: +₹{test.homeCollectionPrice}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{test.reportDeliveryTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span>{test.parameters?.length || 0} Parameters</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold">₹{test.discountedPrice}</span>
                                {test.discount > 0 && (
                                  <>
                                    <span className="text-sm text-muted-foreground line-through">
                                      ₹{test.price}
                                    </span>
                                    <Badge className="bg-primary">{test.discount}% OFF</Badge>
                                  </>
                                )}
                              </div>

                              {cartItems[test._id] ? (
                                <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-none hover:bg-primary hover:text-primary-foreground"
                                    disabled={addingToCart === test._id}
                                    onClick={() => {
                                      if (cartItems[test._id] === 1) {
                                        handleRemoveFromCart(test._id)
                                      } else {
                                        handleUpdateQuantity(test._id, cartItems[test._id] - 1)
                                      }
                                    }}
                                  >
                                    {cartItems[test._id] === 1 ? (
                                      <Trash2 className="h-4 w-4" />
                                    ) : (
                                      <Minus className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <div className="min-w-[50px] text-center font-semibold bg-muted/50 h-9 flex items-center justify-center px-3">
                                    {addingToCart === test._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      cartItems[test._id]
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-none hover:bg-primary hover:text-primary-foreground"
                                    disabled={addingToCart === test._id}
                                    onClick={() => handleUpdateQuantity(test._id, cartItems[test._id] + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => openPatientDialog(test)}
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Patient Details Dialog */}
          <Dialog open={showPatientDialog} onOpenChange={(open) => {
            setShowPatientDialog(open)
            if (!open) {
              setSelectedTest(null)
            }
          }}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
                <DialogDescription>
                  Please provide patient information for the lab test
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Booking For */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Who is this test for?</Label>
                  <RadioGroup value={bookingFor} onValueChange={(value: "self" | "other") => setBookingFor(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="self" id="dialog-self" />
                      <Label htmlFor="dialog-self" className="cursor-pointer font-normal">Myself</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="dialog-other" />
                      <Label htmlFor="dialog-other" className="cursor-pointer font-normal">Someone Else</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Patient Name */}
                <div className="space-y-2">
                  <Label htmlFor="dialog-patient-name">Patient Name *</Label>
                  <Input
                    id="dialog-patient-name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    disabled={false}
                  />
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-patient-age">Age *</Label>
                    <Input
                      id="dialog-patient-age"
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Enter age"
                      min="1"
                      max="120"
                      disabled={false}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-patient-gender">Gender *</Label>
                    <Select value={patientGender} onValueChange={setPatientGender}>
                      <SelectTrigger id="dialog-patient-gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="dialog-patient-phone">Phone Number *</Label>
                  <Input
                    id="dialog-patient-phone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Enter phone number"
                    disabled={false}
                  />
                </div>

                {/* Disease (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="dialog-patient-disease">Disease/Condition (Optional)</Label>
                  <Input
                    id="dialog-patient-disease"
                    value={patientDisease}
                    onChange={(e) => setPatientDisease(e.target.value)}
                    placeholder="e.g., Diabetes, Hypertension"
                    disabled={false}
                  />
                </div>

                {/* Test Info */}
                {selectedTest && (
                  <div className="rounded-lg bg-muted p-3 space-y-1">
                    <p className="text-sm font-medium">{selectedTest.testName}</p>
                    <p className="text-sm text-muted-foreground">₹{selectedTest.discountedPrice}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPatientDialog(false)
                    setSelectedTest(null)
                  }}
                  disabled={addingToCart !== null}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addingToCart !== null}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
  )
}
