"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Pill, FlaskConical, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { searchApi } from "@/lib/api/search"

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults(null)
        setShowResults(false)
        return
      }

      setLoading(true)
      try {
        const data = await searchApi.search(query, { limit: 5 })
        if (data.success) {
          setResults(data.results)
          setShowResults(true)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleResultClick = (type: string, id: string) => {
    setShowResults(false)
    setQuery("")
    
    switch (type) {
      case "medicine":
        router.push(`/medicines/${id}`)
        break
      case "labTest":
        router.push(`/lab-tests/${id}`)
        break
      case "categoryProduct":
        router.push(`/products/${id}`)
        break
      case "category":
        router.push(`/products?category=${id}`)
        break
      case "doctor":
        router.push(`/doctors/${id}`)
        break
    }
  }

  const getTotalResults = () => {
    if (!results) return 0
    return (
      results.medicines.count +
      results.labTests.count +
      results.categoryProducts.count +
      results.categories.count +
      results.doctors.count
    )
  }

  const clearSearch = () => {
    setQuery("")
    setResults(null)
    setShowResults(false)
  }

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container px-4 py-16 md:px-6 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
                Your Health,
                <br />
                <span className="text-primary">Our Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground text-balance leading-relaxed md:text-xl">
                Order medicines, book lab tests, and consult with top doctors from the comfort of your home.
              </p>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medicines, tests, doctors..."
                  className="h-12 pl-12 pr-12 text-base shadow-md"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length >= 2 && setShowResults(true)}
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {loading && (
                  <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-primary" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && results && getTotalResults() > 0 && (
                <Card className="absolute z-50 mt-2 w-full max-h-[500px] overflow-y-auto shadow-xl">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Found {getTotalResults()} results
                    </div>

                    {/* Medicines */}
                    {results.medicines.count > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Medicines ({results.medicines.count})
                        </div>
                        {results.medicines.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick("medicine", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.images?.[0] || "/placeholder.svg"}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.brandName} • ₹{item.pricing?.sellingPrice}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">Medicine</Badge>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lab Tests */}
                    {results.labTests.count > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Lab Tests ({results.labTests.count})
                        </div>
                        {results.labTests.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick("labTest", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                              <FlaskConical className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.category} • ₹{item.discountedPrice}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">Lab Test</Badge>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category Products */}
                    {results.categoryProducts.count > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Products ({results.categoryProducts.count})
                        </div>
                        {results.categoryProducts.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick("categoryProduct", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.images?.[0] || "/placeholder.svg"}
                              alt={item.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.category?.name} • ₹{item.pricing?.sellingPrice}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">Product</Badge>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Doctors */}
                    {results.doctors.count > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Doctors ({results.doctors.count})
                        </div>
                        {results.doctors.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleResultClick("doctor", item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.profileImage || "/placeholder.svg"}
                              alt={item.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.specialization} • ₹{item.fee}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">Doctor</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {showResults && results && getTotalResults() === 0 && (
                <Card className="absolute z-50 mt-2 w-full shadow-xl">
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </div>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/medicines">
                  <Pill className="mr-2 h-4 w-4" />
                  Order Medicines
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/lab-tests">
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Book Lab Test
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Licensed Pharmacy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>NABL Labs</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl" />
            <img
              src="/public/healthcare-professional-with-medical-equipment.jpg"
              alt="Healthcare Professional"
              className="relative z-10 h-full w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
