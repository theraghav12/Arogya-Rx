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
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { labTestsApi, type LabTest } from "@/lib/api/lab-tests"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/auth-utils"
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

  React.useEffect(() => {
    loadCategories()
  }, [])

  React.useEffect(() => {
    loadTests()
  }, [currentPage, sortBy, sortOrder, selectedCategories, filters, searchQuery])

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

  const handleAddToCart = async (test: LabTest) => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setAddingToCart(test._id)
    try {
      const { addToCart } = await import("@/lib/api/cart")
      const result = await addToCart({
        labTestId: test._id,
        quantity: 1,
        isHomeCollection: test.isHomeCollectionAvailable,
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
                        <Button
                          className="w-full"
                          size="sm"
                          disabled={addingToCart === test._id}
                          onClick={() => handleAddToCart(test)}
                        >
                          {addingToCart === test._id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
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

                              <Button
                                size="sm"
                                disabled={addingToCart === test._id}
                                onClick={() => handleAddToCart(test)}
                              >
                                {addingToCart === test._id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
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
        </div>
  )
}
