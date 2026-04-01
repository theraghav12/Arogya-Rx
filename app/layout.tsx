"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AIChatbotFloat } from "@/components/ai-chatbot-float"
import { AuthProvider } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { useTokenExpiry } from "@/hooks/use-token-expiry"
import { CartProvider } from "@/lib/cart-context"
import { useEffect } from "react"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
})

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Initialize token expiry checking
  useTokenExpiry()
  
  // Hide navbar and footer on auth pages
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")

  // Listen for auth errors from API calls
  useEffect(() => {
    const handleAuthError = (event: any) => {
      toast({
        title: "Authentication Required",
        description: event.detail.message,
        variant: "destructive",
      })
    }

    window.addEventListener("auth-error", handleAuthError)
    return () => window.removeEventListener("auth-error", handleAuthError)
  }, [toast])

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <AIChatbotFloat />}
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Primary Meta Tags */}
        <title>ArogyaRx - Online Pharmacy & Healthcare Platform | Buy Medicines, Book Lab Tests & Consult Doctors</title>
        <meta name="title" content="ArogyaRx - Online Pharmacy & Healthcare Platform | Buy Medicines, Book Lab Tests & Consult Doctors" />
        <meta name="description" content="ArogyaRx is Prayagraj's trusted online pharmacy and healthcare platform. Buy medicines online, book lab tests at home, consult with verified doctors, and get doorstep delivery. Your complete healthcare solution." />
        <meta name="keywords" content="online pharmacy, buy medicines online, book lab tests, consult doctors online, healthcare platform, medicine delivery, ArogyaRx, prescription medicines, OTC medicines, health checkup" />
        <meta name="author" content="ArogyaRx" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://arogyarx.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://arogyarx.com" />
        <meta property="og:title" content="ArogyaRx - Online Pharmacy & Healthcare Platform" />
        <meta property="og:description" content="Buy medicines online, book lab tests, and consult with doctors. India's trusted healthcare platform with doorstep delivery." />
        <meta property="og:image" content="https://arogyarx.com/logo.png" />
        <meta property="og:site_name" content="ArogyaRx" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://arogyarx.com" />
        <meta property="twitter:title" content="ArogyaRx - Online Pharmacy & Healthcare Platform" />
        <meta property="twitter:description" content="Buy medicines online, book lab tests, and consult with doctors. India's trusted healthcare platform with doorstep delivery." />
        <meta property="twitter:image" content="https://arogyarx.com/logo.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-light-32x32.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-dark-32x32.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#10b981" />
        <meta name="application-name" content="ArogyaRx" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ArogyaRx" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Razorpay */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ArogyaRx",
            "url": "https://arogyarx.com",
            "logo": "https://arogyarx.com/logo.png",
            "description": "India's trusted online pharmacy and healthcare platform",
            "sameAs": [
              "https://www.facebook.com/arogyarx",
              "https://twitter.com/arogyarx",
              "https://www.instagram.com/arogyarx"
            ]
          })}
        </script>
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ArogyaRx",
            "url": "https://arogyarx.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://arogyarx.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        {/* Structured Data - Medical Business */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalBusiness",
            "name": "ArogyaRx",
            "description": "Online Pharmacy and Healthcare Platform",
            "url": "https://arogyarx.com",
            "logo": "https://arogyarx.com/logo.png",
            "image": "https://arogyarx.com/logo.png",
            "priceRange": "₹₹",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Healthcare Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Buy Medicines Online",
                    "description": "Order prescription and OTC medicines with doorstep delivery",
                    "url": "https://arogyarx.com/medicines"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Book Lab Tests",
                    "description": "Book diagnostic tests and health checkups at home",
                    "url": "https://arogyarx.com/lab-tests"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Consult Doctors Online",
                    "description": "Online consultation with verified doctors",
                    "url": "https://arogyarx.com/doctors"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Order Medicines",
                    "description": "Track and manage your medicine orders",
                    "url": "https://arogyarx.com/orders"
                  }
                }
              ]
            }
          })}
        </script>
        
        {/* Structured Data - Breadcrumb List for Main Pages */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://arogyarx.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Buy Medicines",
                "item": "https://arogyarx.com/medicines"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Book Lab Tests",
                "item": "https://arogyarx.com/lab-tests"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "Consult Doctors",
                "item": "https://arogyarx.com/doctors"
              },
              {
                "@type": "ListItem",
                "position": 5,
                "name": "My Orders",
                "item": "https://arogyarx.com/orders"
              }
            ]
          })}
        </script>
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
            </CartProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}


