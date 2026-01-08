"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      const isAuthPage = pathname === "/login" || pathname === "/register"

      if (!authenticated && !isAuthPage) {
        // Not authenticated and trying to access protected page
        router.push("/login")
      } else if (authenticated && isAuthPage) {
        // Authenticated but on auth page, redirect to home
        router.push("/")
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
