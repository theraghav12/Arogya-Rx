"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  isAuthenticated: boolean
  checkAuth: () => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/doctors",
  "/medicines",
  "/lab-tests",
  "/search",
  "/products",
]

// Check if route is public or a dynamic public route
function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (PUBLIC_ROUTES.includes(pathname)) return true
  
  // Dynamic routes that are public
  if (pathname.startsWith("/doctors/") && !pathname.includes("/book")) return true
  if (pathname.startsWith("/medicines/")) return true
  if (pathname.startsWith("/lab-tests/") && !pathname.includes("/book")) return true
  if (pathname.startsWith("/products/")) return true
  
  return false
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isChecking: true,
  })

  const checkAuth = () => {
    return isAuthenticated()
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setAuthState({ isAuthenticated: false, isChecking: false })
    router.push("/login")
  }

  // Handle token expiration
  const handleTokenExpired = (event: CustomEvent) => {
    const { message } = event.detail
    
    // Update auth state
    setAuthState({ isAuthenticated: false, isChecking: false })
    
    // Show toast notification
    toast({
      title: "Session Expired",
      description: message,
      variant: "destructive",
    })
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  useEffect(() => {
    const authenticated = isAuthenticated()
    const isAuthPage = pathname === "/login" || pathname === "/register"
    const isPublic = isPublicRoute(pathname)

    setAuthState({
      isAuthenticated: authenticated,
      isChecking: false,
    })

    // If not authenticated and trying to access protected route
    if (!authenticated && !isPublic && !isAuthPage) {
      toast({
        title: "Authentication Required",
        description: "You are not logged in! Please login to continue.",
        variant: "destructive",
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }, [pathname, router, toast])

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpiredEvent = (event: Event) => {
      handleTokenExpired(event as CustomEvent)
    }

    window.addEventListener("token-expired", handleTokenExpiredEvent)
    
    return () => {
      window.removeEventListener("token-expired", handleTokenExpiredEvent)
    }
  }, [router, toast])

  if (authState.isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
