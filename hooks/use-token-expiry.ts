"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"
import { isTokenExpired, getAuthToken, clearAuth } from "@/lib/auth-utils"

export function useTokenExpiry() {
  const router = useRouter()
  const { toast } = useToast()

  const checkTokenExpiry = useCallback(() => {
    const token = getAuthToken()
    if (token && isTokenExpired(token)) {
      clearAuth()
      
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 2000)
      
      return true
    }
    return false
  }, [router, toast])

  // Check token expiry on mount and periodically
  useEffect(() => {
    // Initial check
    checkTokenExpiry()
    
    // Check every 5 minutes
    const interval = setInterval(() => {
      checkTokenExpiry()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [checkTokenExpiry])

  return { checkTokenExpiry }
}