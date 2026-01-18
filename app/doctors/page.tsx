"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { Search, Video, MapPin, Stethoscope, ChevronLeft, ChevronRight } from "lucide-react"
import { getDoctors, type Doctor } from "@/lib/api/appointments"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [consultationType, setConsultationType] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchDoctors()
  }, [searchQuery, specialization, consultationType, sortBy, sortOrder, currentPage])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 12,
      }

      if (searchQuery) params.search = searchQuery
      if (specialization && specialization !== "all") params.specialization = specialization
      if (consultationType && consultationType !== "all") params.consultationType = consultationType
      if (sortBy) params.sortBy = sortBy
      if (sortOrder) params.sortOrder = sortOrder

      const response = await getDoctors(params)

      if (response.success) {
        setDoctors(response.data.doctors)
        setPagination(response.data.pagination)
        if (response.data.filters?.availableSpecializations) {
          setAvailableSpecializations(response.data.filters.availableSpecializations)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch doctors",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleSpecializationChange = (value: string) => {
    setSpecialization(value)
    setCurrentPage(1)
  }

  const handleConsultationTypeChange = (value: string) => {
    setConsultationType(value)
    setCurrentPage(1)
  }

  const getConsultationBadge = (type: string) => {
    if (type === "online" || type === "both") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Video className="h-3 w-3" />
          {type === "both" ? "Online & Offline" : "Online"}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1">
        <MapPin className="h-3 w-3" />
        In-Clinic
      </Badge>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Consult Doctors</h1>
        <p className="mt-2 text-muted-foreground">Book online or offline consultations with verified doctors</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialization..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={specialization} onValueChange={handleSpecializationChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {availableSpecializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={consultationType} onValueChange={handleConsultationTypeChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Consultation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">In-Clinic</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {pagination && (
            <div className="text-sm text-muted-foreground">
              Showing {doctors.length} of {pagination.totalDoctors} doctors
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Stethoscope className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No doctors found</h2>
            <p className="mb-6 text-muted-foreground">Try adjusting your filters or search query</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSpecialization("")
                setConsultationType("")
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor._id} className="transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={doctor.profileImage || undefined} 
                        alt={doctor.name}
                        onError={(e) => {
                          console.log("Doctor image failed to load:", doctor.profileImage)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <AvatarFallback className="bg-primary/10">
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-balance leading-tight">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{doctor.experience}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{doctor.qualification}</p>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    {getConsultationBadge(doctor.consultationType)}
                  </div>

                  {doctor.address && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {doctor.address.city}, {doctor.address.state}
                    </div>
                  )}

                  <div className="mb-4 text-lg font-bold">₹{doctor.fee} consultation fee</div>

                  <Button className="w-full" asChild>
                    <Link href={`/doctors/${doctor._id}`}>View Details & Book</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
