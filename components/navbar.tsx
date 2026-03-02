"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, ShoppingCart, User, Menu, Pill, FlaskConical, Stethoscope, Package, LogOut, LogIn, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth-utils"
import { getCart } from "@/lib/api/cart"
import { searchApi } from "@/lib/api/search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [authenticated, setAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [cartCount, setCartCount] = React.useState(0)
  const [searchResults, setSearchResults] = React.useState<any>(null)
  const [searchLoading, setSearchLoading] = React.useState(false)
  const [showSearchResults, setShowSearchResults] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    const authStatus = isAuthenticated()
    setAuthenticated(authStatus)
    const userData = getUser()
    // Combine firstName and lastName if they exist
    if (userData && (userData.firstName || userData.lastName)) {
      userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    }
    setUser(userData)
    
    if (authStatus) {
      fetchCartCount()
    }
  }, [pathname])

  // Listen for storage changes to update user data
  React.useEffect(() => {
    const handleStorageChange = () => {
      const userData = getUser()
      // Combine firstName and lastName if they exist
      if (userData && (userData.firstName || userData.lastName)) {
        userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      }
      setUser(userData)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Debounced search
  React.useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults(null)
        setShowSearchResults(false)
        return
      }

      setSearchLoading(true)
      try {
        const data = await searchApi.search(searchQuery, { limit: 10, page: 1 })
        if (data.success) {
          setSearchResults(data.results)
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setSearchLoading(false)
      }
    }, 100)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  // Close results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchCartCount = async () => {
    try {
      const data = await getCart()
      setCartCount(data.totalItems || 0)
    } catch (error) {
      // Silently fail - cart might be empty
      setCartCount(0)
    }
  }

  const handleLogout = () => {
    clearAuth()
    setAuthenticated(false)
    setUser(null)
    router.push("/login")
  }

  const handleSearchResultClick = (type: string, id: string) => {
    setShowSearchResults(false)
    setSearchQuery("")
    
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
    if (!searchResults) return 0
    return (
      (searchResults.medicines?.total || 0) +
      (searchResults.labTests?.total || 0) +
      (searchResults.categoryProducts?.total || 0) +
      (searchResults.categories?.total || 0) +
      (searchResults.doctors?.total || 0)
    )
  }

  const hasMoreResults = () => {
    if (!searchResults) return false
    return (
      searchResults.medicines?.hasMore ||
      searchResults.labTests?.hasMore ||
      searchResults.categoryProducts?.hasMore ||
      searchResults.categories?.hasMore ||
      searchResults.doctors?.hasMore
    )
  }

  const handleViewAll = () => {
    setShowSearchResults(false)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults(null)
    setShowSearchResults(false)
  }

  const navLinks = [
    { href: "/medicines", label: "Medicines", icon: Pill },
    { href: "/lab-tests", label: "Lab Tests", icon: FlaskConical },
    { href: "/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/products", label: "Products", icon: Package },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img 
            src="/logo.png" 
            alt="ArogyaRx Logo" 
            className="h-8 w-auto"
          />
          <span className="hidden text-lg font-bold text-primary sm:inline-block">ArogyaRx</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-primary",
                pathname === link.href ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar with Autocomplete */}
        <div className="ml-auto flex flex-1 items-center gap-2 md:ml-4 md:max-w-md" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medicines, tests, doctors..."
              className="w-full pl-9 pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {searchLoading && (
              <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-primary" />
            )}

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults && getTotalResults() > 0 && (
                <Card className="absolute z-50 mt-2 w-full max-h-[500px] overflow-y-auto shadow-xl">
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                      <span className="text-xs text-muted-foreground">
                        Showing {Math.min(10, getTotalResults())} of {getTotalResults()} results
                      </span>
                      {(getTotalResults() > 10 || hasMoreResults()) && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={handleViewAll}
                        >
                          View All →
                        </Button>
                      )}
                    </div>

                    {/* Medicines */}
                    {searchResults.medicines.count > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Medicines
                        </div>
                        {searchResults.medicines.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchResultClick("medicine", item.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.images?.[0] || "/placeholder.svg"}
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                ₹{item.pricing?.sellingPrice}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lab Tests */}
                    {searchResults.labTests.count > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Lab Tests
                        </div>
                        {searchResults.labTests.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchResultClick("labTest", item.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                              <FlaskConical className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                ₹{item.discountedPrice}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Category Products */}
                    {searchResults.categoryProducts.count > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Products
                        </div>
                        {searchResults.categoryProducts.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchResultClick("categoryProduct", item.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.images?.[0] || "/placeholder.svg"}
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                ₹{item.pricing?.sellingPrice}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Doctors */}
                    {searchResults.doctors.count > 0 && (
                      <div className="mb-1">
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                          Doctors
                        </div>
                        {searchResults.doctors.data.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => handleSearchResultClick("doctor", item.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors text-left"
                          >
                            <img
                              src={item.profileImage || "/placeholder.svg"}
                              alt={item.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.specialization}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {showSearchResults && searchResults && getTotalResults() === 0 && (
                <Card className="absolute z-50 mt-2 w-full shadow-xl">
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No results found
                  </div>
                </Card>
              )}
            </div>
          </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {authenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:inline-flex rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.profileImage?.url || user?.profileImage || "/placeholder-user.jpg"} 
                        alt={user?.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.profileImage?.url || user?.profileImage || "/placeholder-user.jpg"} 
                          alt={user?.name || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/appointments" className="cursor-pointer">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Appointments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
              <div className="flex flex-col h-full">
                {authenticated ? (
                  <>
                    {/* User Profile Header */}
                    <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage 
                            src={user?.profileImage?.url || user?.profileImage || "/placeholder-user.jpg"} 
                            alt={user?.name || "User"}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate">{user?.name || "User"}</p>
                          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-1">
                        {/* My Profile */}
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base font-medium">My Profile</span>
                        </Link>

                        {/* My Orders */}
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base font-medium">My Orders</span>
                        </Link>

                        {/* Appointments */}
                        <Link
                          href="/appointments"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base font-medium">Appointments</span>
                        </Link>

                        <Separator className="my-3" />

                        {/* Main Navigation Links */}
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              pathname === link.href 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "hover:bg-accent"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              pathname === link.href ? "bg-primary/20" : "bg-muted"
                            )}>
                              <link.icon className="h-5 w-5" />
                            </div>
                            <span className="text-base">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t bg-muted/30">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="text-base font-medium">Logout</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Navigation Links for Non-Authenticated Users */}
                    <nav className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-1">
                        {/* Main Navigation Links */}
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              pathname === link.href 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "hover:bg-accent"
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg",
                              pathname === link.href ? "bg-primary/20" : "bg-muted"
                            )}>
                              <link.icon className="h-5 w-5" />
                            </div>
                            <span className="text-base">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    {/* Login Button */}
                    <div className="p-4 border-t bg-muted/30">
                      <Button asChild className="w-full" size="lg">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <LogIn className="mr-2 h-5 w-5" />
                          Login to Continue
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

