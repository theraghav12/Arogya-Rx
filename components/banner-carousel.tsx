"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllBanners, getMedicineBanners, getLabTestBanners, getCategoryProductBanners, type Banner } from "@/lib/api/banners"

interface BannerCarouselProps {
  page?: "all" | "medicines" | "labtests" | "category-products"
}

export function BannerCarousel({ page = "all" }: BannerCarouselProps) {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [page])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length, currentIndex])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      let response

      switch (page) {
        case "medicines":
          response = await getMedicineBanners()
          break
        case "labtests":
          response = await getLabTestBanners()
          break
        case "category-products":
          response = await getCategoryProductBanners()
          break
        default:
          response = await getAllBanners()
      }

      if (response.success) {
        setBanners(response.data)
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleBannerClick = (banner: Banner) => {
    if (banner.itemId && banner.itemType) {
      switch (banner.itemType) {
        case "medicine":
          router.push(`/medicines/${banner.itemId}`)
          break
        case "labtest":
          router.push(`/lab-tests/${banner.itemId}`)
          break
        case "category":
          router.push(`/products?category=${banner.itemId}`)
          break
        case "product":
          router.push(`/products/${banner.itemId}`)
          break
      }
    }
  }

  if (loading) {
    return (
      <div className="relative w-full h-[300px] md:h-[400px] bg-muted animate-pulse rounded-xl" />
    )
  }

  if (banners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden group">
      {/* Banner Images */}
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => handleBannerClick(banner)}
          style={{ cursor: banner.itemId ? "pointer" : "default" }}
        >
          <img
            src={banner.image.url}
            alt={banner.offerName}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Banner Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
            <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
              {banner.offerName}
            </h2>
            <p className="text-sm md:text-lg mb-4 max-w-2xl drop-shadow-md">
              {banner.description}
            </p>
            {banner.itemId && (
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={(e) => {
                  e.stopPropagation()
                  handleBannerClick(banner)
                }}
              >
                View Offer
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
