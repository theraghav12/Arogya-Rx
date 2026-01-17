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
  Package,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { categoriesApi, categoryProductsApi, type CategoryProduct, type CategoryWithCount } from "@/lib/api/categories"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { BannerCarousel } from "@/components/banner-carousel"
import { format } from "date-fns"

export default function ProductsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [products, setProducts] = React.useState<CategoryProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [categories, setCategories] = React.useState<CategoryWithCount[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")
  const [filters, setFilters] = React.useState({
    inStock: false,
    prescriptionRequired: "",
    minPrice: "",
    maxPrice: "",
  })
  const [sortBy, setSortBy] = React.useState("sortOrder")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [pagination, setPagination] = React.useState<any>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null)
  const [cartItems, setCartItems] = React.useState<Map<string, number>>(new Map())

  React.useEffect(() => {
    loadCategories()
    loadCartItems()
  }, [])

  React.useEffect(() => {
    loadProducts()
  }, [currentPage, sortBy, sortOrder, selectedCategory, filters, searchQuery])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getCategoriesWithCounts()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadCartItems = async () => {
    if (!isAuthenticated()) return
    
    try {
      const { getCart } = await import("@/lib/api/cart")
      const cartData = await getCart()
      
      if (cartData.cart?.items) {
        const itemsMap = new Map<string, number>()
        cartData.cart.items.forEach((item: any) => {
          if (item.productType === 'categoryProduct' && item.categoryProductId?._id) {
            itemsMap.set(item.categoryProductId._id, item.quantity)
          }
        })
        setCartItems(itemsMap)
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    }
  }

  const loadProducts = async () => {
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

      if (selectedCategory) {
        params.categoryId = selectedCategory
      }

      if (filters.inStock) {
        params.inStock = true
      }

      if (filters.prescriptionRequired) {
        params.prescriptionRequired = filters.prescriptionRequired === "true"
      }

      if (filters.minPrice) {
        params.minPrice = parseFloat(filters.minPrice)
      }

      if (filters.maxPrice) {
        params.maxPrice = parseFloat(filters.maxPrice)
      }

      const data = await categoryProductsApi.getAll(params)

      if (data.success) {
        setProducts(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to load products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (product: CategoryProduct) => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setAddingToCart(product.id)
    try {
      const { addToCart } = await import("@/lib/api/cart")
      const result = await addToCart({
        categoryProductId: product.id,
        quantity: 1,
      })

      if (result.message) {
        toast({
          title: "Success",
          description: `${product.productName} added to cart`,
        })
        // Update local cart state
        setCartItems(prev => new Map(prev).set(product.id, 1))
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

  const handleUpdateQuantity = async (product: CategoryProduct, newQuantity: number) => {
    if (newQuantity < 1) return

    setAddingToCart(product.id)
    try {
      const { updateCartQuantity, removeFromCart, addToCart } = await import("@/lib/api/cart")
      
      // Try update first
      try {
        await updateCartQuantity({
          categoryProductId: product.id,
          quantity: newQuantity,
        })
      } catch (updateError) {
        // Fallback: remove and add
        await removeFromCart({ categoryProductId: product.id })
        await addToCart({
          categoryProductId: product.id,
          quantity: newQuantity,
        })
      }

      setCartItems(prev => new Map(prev).set(product.id, newQuantity))
      
      toast({
        title: "Success",
        description: "Cart updated",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const handleRemoveFromCart = async (product: CategoryProduct) => {
    setAddingToCart(product.id)
    try {
      const { removeFromCart } = await import("@/lib/api/cart")
      await removeFromCart({ categoryProductId: product.id })

      setCartItems(prev => {
        const newMap = new Map(prev)
        newMap.delete(product.id)
        return newMap
      })

      toast({
        title: "Success",
        description: `${product.productName} removed from cart`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from cart",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  const clearFilters = () => {
    setSelectedCategory("")
    setFilters({
      inStock: false,
      prescriptionRequired: "",
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="all-categories"
              checked={!selectedCategory}
              onCheckedChange={() => {
                setSelectedCategory("")
                setCurrentPage(1)
              }}
            />
            <Label htmlFor="all-categories" className="cursor-pointer text-sm">
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={category.id}
                checked={selectedCategory === category.id}
                onCheckedChange={() => {
                  setSelectedCategory(category.id)
                  setCurrentPage(1)
                }}
              />
              <Label htmlFor={category.id} className="cursor-pointer text-sm flex-1">
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">({category.productCount})</span>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Price Range</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="text-sm">
              Min Price
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="₹0"
              value={filters.minPrice}
              onChange={(e) => {
                setFilters({ ...filters, minPrice: e.target.value })
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="text-sm">
              Max Price
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="₹10000"
              value={filters.maxPrice}
              onChange={(e) => {
                setFilters({ ...filters, maxPrice: e.target.value })
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Filters</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => {
                setFilters({ ...filters, inStock: checked as boolean })
                setCurrentPage(1)
              }}
            />
            <Label htmlFor="inStock" className="cursor-pointer text-sm">
              In Stock Only
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-semibold">Prescription</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="no-rx"
              checked={filters.prescriptionRequired === "false"}
              onCheckedChange={(checked) => {
                setFilters({ ...filters, prescriptionRequired: checked ? "false" : "" })
                setCurrentPage(1)
              }}
            />
            <Label htmlFor="no-rx" className="cursor-pointer text-sm">
              No Prescription Required
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rx"
              checked={filters.prescriptionRequired === "true"}
              onCheckedChange={(checked) => {
                setFilters({ ...filters, prescriptionRequired: checked ? "true" : "" })
                setCurrentPage(1)
              }}
            />
            <Label htmlFor="rx" className="cursor-pointer text-sm">
              Prescription Required
            </Label>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
          {/* Banner Carousel */}
          <div className="mb-6">
            <BannerCarousel page="category-products" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("")
                    setCurrentPage(1)
                    clearFilters()
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Categories
                </Button>
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name || "Products"
                : "Healthcare Products"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {selectedCategory
                ? `Browse ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} products`
                : "Browse personal care, baby care, and wellness products"}
            </p>
          </div>

          {/* Categories Grid - Only show when no category selected */}
          {!selectedCategory && categories.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Shop by Category</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-muted">
                        <img
                          src={category.image.url || "/placeholder.svg"}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">{category.productCount} products</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filters Bar - Only show when category is selected */}
          {selectedCategory && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                  <SelectItem value="sortOrder-asc">Featured</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
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
          )}

          {/* Main Content - Only show when category is selected */}
          {selectedCategory && (
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

            {/* Products Grid/List */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pagination?.totalCount || 0} product{pagination?.totalCount !== 1 ? "s" : ""} found
                </div>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>

              {products.length === 0 ? (
                <Card className="p-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No products found matching your criteria</p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <Link href={`/products/${product.category._id}/${product.id}`}>
                          <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.productName}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                            {product.prescriptionRequired && (
                              <Badge className="absolute top-2 right-2" variant="destructive">
                                Rx
                              </Badge>
                            )}
                            {product.pricing.discount > 0 && (
                              <Badge className="absolute top-2 left-2 bg-primary">
                                {product.pricing.discount}% OFF
                              </Badge>
                            )}
                            {!product.stock.available && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Badge variant="destructive">Out of Stock</Badge>
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="space-y-2">
                          <Link href={`/products/${product.category._id}/${product.id}`}>
                            <h3 className="font-semibold text-balance leading-tight hover:text-primary line-clamp-2">
                              {product.productName}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{product.brandName}</p>
                          {product.packaging?.packSize && (
                            <p className="text-xs text-muted-foreground">{product.packaging.packSize}</p>
                          )}

                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold">₹{product.pricing.sellingPrice}</span>
                            {product.pricing.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{product.pricing.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        {cartItems.has(product.id) ? (
                          <div className="w-full flex items-center justify-center gap-0 border rounded-md overflow-hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-3 rounded-none hover:bg-primary hover:text-primary-foreground"
                              disabled={addingToCart === product.id}
                              onClick={() => {
                                const currentQty = cartItems.get(product.id) || 1
                                if (currentQty === 1) {
                                  handleRemoveFromCart(product)
                                } else {
                                  handleUpdateQuantity(product, currentQty - 1)
                                }
                              }}
                            >
                              {cartItems.get(product.id) === 1 ? (
                                <Trash2 className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="h-9 px-4 flex items-center justify-center bg-muted min-w-[60px] font-medium">
                              {addingToCart === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                cartItems.get(product.id)
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-3 rounded-none hover:bg-primary hover:text-primary-foreground"
                              disabled={addingToCart === product.id || !product.stock.available}
                              onClick={() => {
                                const currentQty = cartItems.get(product.id) || 1
                                handleUpdateQuantity(product, currentQty + 1)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full"
                            size="sm"
                            disabled={!product.stock.available || addingToCart === product.id}
                            onClick={() => handleAddToCart(product)}
                          >
                            {addingToCart === product.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : !product.stock.available ? (
                              "Out of Stock"
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link
                            href={`/products/${product.category._id}/${product.id}`}
                            className="shrink-0"
                          >
                            <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-muted md:h-32 md:w-32">
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.productName}
                                className="h-full w-full object-cover"
                              />
                              {!product.stock.available && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Badge variant="destructive" className="text-xs">
                                    Out
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="mb-1 flex items-start gap-2">
                                <Link
                                  href={`/products/${product.category._id}/${product.id}`}
                                  className="flex-1"
                                >
                                  <h3 className="font-semibold hover:text-primary">{product.productName}</h3>
                                </Link>
                                {product.prescriptionRequired && (
                                  <Badge variant="destructive" className="shrink-0">
                                    Rx
                                  </Badge>
                                )}
                                {product.pricing.discount > 0 && (
                                  <Badge className="shrink-0 bg-primary">{product.pricing.discount}% OFF</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {product.brandName}
                                {product.packaging?.packSize && ` • ${product.packaging.packSize}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Stock: {product.stock.quantity} units
                              </p>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold">₹{product.pricing.sellingPrice}</span>
                                {product.pricing.discount > 0 && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ₹{product.pricing.mrp}
                                  </span>
                                )}
                              </div>

                              {cartItems.has(product.id) ? (
                                <div className="flex items-center gap-0 border rounded-md overflow-hidden">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 rounded-none hover:bg-primary hover:text-primary-foreground"
                                    disabled={addingToCart === product.id}
                                    onClick={() => {
                                      const currentQty = cartItems.get(product.id) || 1
                                      if (currentQty === 1) {
                                        handleRemoveFromCart(product)
                                      } else {
                                        handleUpdateQuantity(product, currentQty - 1)
                                      }
                                    }}
                                  >
                                    {cartItems.get(product.id) === 1 ? (
                                      <Trash2 className="h-3 w-3" />
                                    ) : (
                                      <Minus className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <div className="h-8 px-3 flex items-center justify-center bg-muted min-w-[50px] text-sm font-medium">
                                    {addingToCart === product.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      cartItems.get(product.id)
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 rounded-none hover:bg-primary hover:text-primary-foreground"
                                    disabled={addingToCart === product.id || !product.stock.available}
                                    onClick={() => {
                                      const currentQty = cartItems.get(product.id) || 1
                                      handleUpdateQuantity(product, currentQty + 1)
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={!product.stock.available || addingToCart === product.id}
                                  onClick={() => handleAddToCart(product)}
                                >
                                  {addingToCart === product.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Adding...
                                    </>
                                  ) : !product.stock.available ? (
                                    "Out of Stock"
                                  ) : (
                                    <>
                                      <ShoppingCart className="mr-2 h-4 w-4" />
                                      Add to Cart
                                    </>
                                  )}
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
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
  )
}
