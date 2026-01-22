"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, Grid3x3, List, ShoppingCart, SlidersHorizontal, Loader2, Plus, Minus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { medicinesApi, type Medicine, type AlphabetIndexItem } from "@/lib/api/medicines"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { BannerCarousel } from "@/components/banner-carousel"

export default function MedicinesPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [medicines, setMedicines] = React.useState<Medicine[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [prescriptionFilter, setPrescriptionFilter] = React.useState<string>("")
  const [addingToCart, setAddingToCart] = React.useState<string | null>(null)
  const [cartItems, setCartItems] = React.useState<Record<string, number>>({})
  const [alphabetIndex, setAlphabetIndex] = React.useState<AlphabetIndexItem[]>([])
  const [selectedLetter, setSelectedLetter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalMedicines, setTotalMedicines] = React.useState(0)
  const [itemsPerPage] = React.useState(20)

  const categories = ["Pain Relief", "Antibiotics", "Vitamins", "Allergy", "Digestive", "Diabetes", "Cardiac", "Respiratory"]

  React.useEffect(() => {
    loadAlphabetIndex()
  }, [])

  React.useEffect(() => {
    loadMedicines()
    loadCartItems()
  }, [selectedLetter, currentPage, searchQuery, selectedCategories, prescriptionFilter])

  const loadAlphabetIndex = async () => {
    try {
      const response = await medicinesApi.getAlphabetIndex()
      if (response.success) {
        setAlphabetIndex(response.data)
      }
    } catch (error) {
      console.error("Failed to load alphabet index:", error)
    }
  }

  const loadCartItems = async () => {
    try {
      const { getCart } = await import("@/lib/api/cart")
      const cartData = await getCart()
      const items: Record<string, number> = {}
      cartData.cart.items.forEach((item) => {
        if (item.medicineId) {
          items[item.medicineId._id] = item.quantity
        }
      })
      setCartItems(items)
    } catch (error) {
      // Cart might be empty
    }
  }

  const loadMedicines = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (selectedLetter !== "all") {
        params.letter = selectedLetter
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      if (selectedCategories.length > 0) {
        params.category = selectedCategories.join(",")
      }

      if (prescriptionFilter === "no-rx") {
        params.prescriptionRequired = false
      } else if (prescriptionFilter === "rx") {
        params.prescriptionRequired = true
      }

      const response = await medicinesApi.getMedicines(params)
      
      console.log("API Response:", response) // Debug log
      
      if (response.success) {
        setMedicines(response.data)
        setTotalPages(response.totalPages || 1)
        setTotalMedicines(response.totalMedicines || response.data.length)
        console.log("Total Pages:", response.totalPages, "Total Medicines:", response.totalMedicines) // Debug log
      } else {
        setMedicines([])
        setTotalPages(1)
        setTotalMedicines(0)
      }
    } catch (error) {
      console.error("Failed to load medicines:", error)
      toast({
        title: "Error",
        description: "Failed to load medicines",
        variant: "destructive",
      })
      setMedicines([])
    } finally {
      setLoading(false)
    }
  }

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter)
    setCurrentPage(1)
    setSearchQuery("")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }

  const handleAddToCart = async (medicine: Medicine) => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setAddingToCart(medicine._id)
    try {
      const { addToCart } = await import("@/lib/api/cart")
      const result = await addToCart({
        medicineId: medicine._id,
        quantity: 1,
      })

      if (result.message) {
        setCartItems(prev => ({ ...prev, [medicine._id]: 1 }))
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
      setAddingToCart(null)
    }
  }

  const handleUpdateQuantity = async (medicineId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setAddingToCart(medicineId)
    try {
      try {
        const { updateCartQuantity } = await import("@/lib/api/cart")
        await updateCartQuantity({
          medicineId,
          quantity: newQuantity,
        })
        setCartItems(prev => ({ ...prev, [medicineId]: newQuantity }))
      } catch (updateError: any) {
        const { removeFromCart, addToCart } = await import("@/lib/api/cart")
        await removeFromCart({ medicineId })
        await addToCart({ medicineId, quantity: newQuantity })
        setCartItems(prev => ({ ...prev, [medicineId]: newQuantity }))
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      })
      loadCartItems()
    } finally {
      setAddingToCart(null)
    }
  }

  const handleRemoveFromCart = async (medicineId: string) => {
    setAddingToCart(medicineId)
    try {
      const { removeFromCart } = await import("@/lib/api/cart")
      await removeFromCart({ medicineId })
      setCartItems(prev => {
        const newItems = { ...prev }
        delete newItems[medicineId]
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
    setPrescriptionFilter("")
    setSearchQuery("")
    setSelectedLetter("all")
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
        <h3 className="mb-3 font-semibold">Prescription Required</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="no-rx"
              checked={prescriptionFilter === "no-rx"}
              onCheckedChange={(checked) => {
                setPrescriptionFilter(checked ? "no-rx" : "")
                setCurrentPage(1)
              }}
            />
            <Label htmlFor="no-rx" className="cursor-pointer text-sm">
              No Prescription
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="rx"
              checked={prescriptionFilter === "rx"}
              onCheckedChange={(checked) => {
                setPrescriptionFilter(checked ? "rx" : "")
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

  if (loading && medicines.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading medicines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-6">
        <BannerCarousel page="medicines" />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Medicines</h1>
        <p className="mt-2 text-muted-foreground">Browse and order prescription & OTC medicines</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center gap-2 pb-2">
          <Button
            variant={selectedLetter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleLetterClick("all")}
            className="shrink-0"
          >
            All
          </Button>
          {alphabetIndex.map((item) => (
            <Button
              key={item.letter}
              variant={selectedLetter === item.letter ? "default" : "outline"}
              size="sm"
              onClick={() => handleLetterClick(item.letter)}
              disabled={!item.hasData}
              className="shrink-0 min-w-[60px]"
            >
              {item.letter}
              {item.hasData && <span className="ml-1 text-xs">({item.count})</span>}
            </Button>
          ))}
        </div>
      </div>

      {(selectedLetter !== "all" || searchQuery || selectedCategories.length > 0 || prescriptionFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedLetter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Letter: {selectedLetter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleLetterClick("all")} />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(cat)} />
            </Badge>
          ))}
          {prescriptionFilter && (
            <Badge variant="secondary" className="gap-1">
              {prescriptionFilter === "rx" ? "Prescription Required" : "No Prescription"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setPrescriptionFilter("")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${selectedLetter !== "all" ? `in ${selectedLetter} medicines` : "all medicines"}...`}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className="flex items-center gap-2">
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
              <Button variant="outline" size="icon" className="md:hidden">
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

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
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

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedLetter !== "all" && `Medicines starting with "${selectedLetter}" • `}
              Showing {medicines.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, totalMedicines)} of {totalMedicines} medicine{totalMedicines !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : medicines.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No medicines found matching your criteria</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {medicines.map((medicine) => (
                <Card key={medicine._id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-4">
                    <Link href={`/medicines/${medicine._id}`}>
                      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                        <img
                          src={medicine.images[0] || "/placeholder.svg"}
                          alt={medicine.productName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {medicine.prescriptionRequired && (
                          <Badge className="absolute top-2 right-2" variant="destructive">Rx</Badge>
                        )}
                        {medicine.pricing.discount > 0 && (
                          <Badge className="absolute top-2 left-2 bg-primary">{medicine.pricing.discount}% OFF</Badge>
                        )}
                        {medicine.stock.quantity === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Badge variant="destructive">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="space-y-2">
                      <Link href={`/medicines/${medicine._id}`}>
                        <h3 className="font-semibold text-balance leading-tight hover:text-primary line-clamp-2">
                          {medicine.productName}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{medicine.brandName}</p>
                      {medicine.packaging?.packSize && (
                        <p className="text-xs text-muted-foreground">{medicine.packaging.packSize}</p>
                      )}

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">₹{medicine.pricing.sellingPrice}</span>
                        {medicine.pricing.discount > 0 && (
                          <span className="text-sm text-muted-foreground line-through">₹{medicine.pricing.mrp}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {cartItems[medicine._id] ? (
                      <div className="flex items-center gap-1 w-full border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-none hover:bg-primary hover:text-primary-foreground"
                          disabled={addingToCart === medicine._id}
                          onClick={() => {
                            if (cartItems[medicine._id] === 1) {
                              handleRemoveFromCart(medicine._id)
                            } else {
                              handleUpdateQuantity(medicine._id, cartItems[medicine._id] - 1)
                            }
                          }}
                        >
                          {cartItems[medicine._id] === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1 text-center font-semibold text-base bg-muted/50 h-10 flex items-center justify-center">
                          {addingToCart === medicine._id ? <Loader2 className="h-4 w-4 animate-spin" /> : cartItems[medicine._id]}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-none hover:bg-primary hover:text-primary-foreground"
                          disabled={addingToCart === medicine._id || cartItems[medicine._id] >= medicine.stock.quantity}
                          onClick={() => handleUpdateQuantity(medicine._id, cartItems[medicine._id] + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        size="sm"
                        disabled={medicine.stock.quantity === 0 || addingToCart === medicine._id}
                        onClick={() => handleAddToCart(medicine)}
                      >
                        {addingToCart === medicine._id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : medicine.stock.quantity === 0 ? (
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
              {medicines.map((medicine) => (
                <Card key={medicine._id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/medicines/${medicine._id}`} className="shrink-0">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-muted md:h-32 md:w-32">
                          <img
                            src={medicine.images[0] || "/placeholder.svg"}
                            alt={medicine.productName}
                            className="h-full w-full object-cover"
                          />
                          {medicine.stock.quantity === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Badge variant="destructive" className="text-xs">Out</Badge>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="mb-1 flex items-start gap-2">
                            <Link href={`/medicines/${medicine._id}`} className="flex-1">
                              <h3 className="font-semibold hover:text-primary">{medicine.productName}</h3>
                            </Link>
                            {medicine.prescriptionRequired && (
                              <Badge variant="destructive" className="shrink-0">Rx</Badge>
                            )}
                            {medicine.pricing.discount > 0 && (
                              <Badge className="shrink-0 bg-primary">{medicine.pricing.discount}% OFF</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {medicine.brandName}
                            {medicine.packaging?.packSize && ` • ${medicine.packaging.packSize}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Stock: {medicine.stock.quantity} {medicine.stock.unit}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">₹{medicine.pricing.sellingPrice}</span>
                            {medicine.pricing.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">₹{medicine.pricing.mrp}</span>
                            )}
                          </div>

                          {cartItems[medicine._id] ? (
                            <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none hover:bg-primary hover:text-primary-foreground"
                                disabled={addingToCart === medicine._id}
                                onClick={() => {
                                  if (cartItems[medicine._id] === 1) {
                                    handleRemoveFromCart(medicine._id)
                                  } else {
                                    handleUpdateQuantity(medicine._id, cartItems[medicine._id] - 1)
                                  }
                                }}
                              >
                                {cartItems[medicine._id] === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                              </Button>
                              <div className="min-w-[50px] text-center font-semibold bg-muted/50 h-9 flex items-center justify-center px-3">
                                {addingToCart === medicine._id ? <Loader2 className="h-4 w-4 animate-spin" /> : cartItems[medicine._id]}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-none hover:bg-primary hover:text-primary-foreground"
                                disabled={addingToCart === medicine._id || cartItems[medicine._id] >= medicine.stock.quantity}
                                onClick={() => handleUpdateQuantity(medicine._id, cartItems[medicine._id] + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              disabled={medicine.stock.quantity === 0 || addingToCart === medicine._id}
                              onClick={() => handleAddToCart(medicine)}
                            >
                              {addingToCart === medicine._id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Adding...
                                </>
                              ) : medicine.stock.quantity === 0 ? (
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

          {/* Pagination Controls */}
          {totalMedicines > itemsPerPage && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • Total: {totalMedicines} medicines
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
