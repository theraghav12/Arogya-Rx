'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCart } from '@/lib/api/cart'
import { isAuthenticated } from '@/lib/auth-utils'

interface CartContextType {
  cartCount: number
  updateCartCount: () => Promise<void>
  setCartCount: (count: number) => void
  incrementCartCount: (amount?: number) => void
  decrementCartCount: (amount?: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = async () => {
    if (!isAuthenticated()) {
      setCartCount(0)
      return
    }

    try {
      const data = await getCart()
      setCartCount(data.totalItems || 0)
    } catch (error) {
      // Silently fail - cart might be empty
      console.warn('Failed to update cart count:', error)
      setCartCount(0)
    }
  }

  const incrementCartCount = (amount: number = 1) => {
    setCartCount(prev => prev + amount)
  }

  const decrementCartCount = (amount: number = 1) => {
    setCartCount(prev => Math.max(0, prev - amount))
  }

  // Initial load
  useEffect(() => {
    updateCartCount()
  }, [])

  // Listen for storage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      updateCartCount()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Listen for custom cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  return (
    <CartContext.Provider value={{
      cartCount,
      updateCartCount,
      setCartCount,
      incrementCartCount,
      decrementCartCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Utility function to dispatch cart update events
export function dispatchCartUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
}