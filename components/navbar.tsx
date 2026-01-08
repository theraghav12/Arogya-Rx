"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, ShoppingCart, User, Menu, Pill, FlaskConical, Stethoscope, Package, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { isAuthenticated, clearAuth, getUser } from "@/lib/auth-utils"
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
  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    setAuthenticated(isAuthenticated())
    setUser(getUser())
  }, [pathname])

  const handleLogout = () => {
    clearAuth()
    setAuthenticated(false)
    setUser(null)
    router.push("/login")
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Pill className="h-5 w-5" />
          </div>
          <span className="hidden text-lg font-bold text-primary sm:inline-block">ArogyaRx</span>
        </Link>

        {/* Desktop Navigation */}
        {authenticated && (
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
        )}

        {/* Search Bar */}
        {authenticated && (
          <div className="ml-auto flex flex-1 items-center gap-2 md:ml-4 md:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medicines, tests, doctors..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {authenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    3
                  </Badge>
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>

              {/* Desktop User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                {authenticated ? (
                  <>
                    <div className="flex flex-col space-y-1 pb-4 border-b">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-lg font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      My Profile
                    </Link>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 text-lg font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    ))}
                    <Button
                      variant="outline"
                      className="justify-start text-red-600 hover:text-red-700"
                      onClick={() => {
                        setIsOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

