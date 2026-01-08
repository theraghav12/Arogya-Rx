"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { CategoryCards } from "@/components/home/category-cards"
import { PopularMedicines } from "@/components/home/popular-medicines"
import { LabTestsSection } from "@/components/home/lab-tests-section"
import { DoctorsSection } from "@/components/home/doctors-section"
import { FeaturesSection } from "@/components/home/features-section"
import { isAuthenticated } from "@/lib/auth-utils"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [router])

  // Show loading while checking auth
  if (!isAuthenticated()) {
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoryCards />
        <PopularMedicines />
        <LabTestsSection />
        <DoctorsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
