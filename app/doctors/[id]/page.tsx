"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Video,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { getDoctors, getDoctorAvailability, type Doctor, type DoctorAvailability } from "@/lib/api/appointments"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function DoctorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.id as string
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails()
      fetchDoctorAvailability()
    }
  }, [doctorId])

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      // Fetch all doctors and find the one with matching ID
      const response = await getDoctors({ limit: 1000 })
      
      if (response.success && response.data.doctors.length > 0) {
        // Try to find exact match by ID
        const foundDoctor = response.data.doctors.find((d: Doctor) => d._id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
        } else {
          toast({
            title: "Error",
            description: "Doctor not found",
            variant: "destructive",
          })
          router.push("/doctors")
        }
      } else {
        toast({
          title: "Error",
          description: "Doctor not found",
          variant: "destructive",
        })
        router.push("/doctors")
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error)
      toast({
        title: "Error",
        description: "Failed to load doctor details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDoctorAvailability = async () => {
    try {
      const response = await getDoctorAvailability(doctorId)
      if (response.success) {
        setAvailability(response.data || [])
      }
    } catch (error) {
      console.error("Error fetching availability:", error)
    }
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
        In-Clinic Only
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">Doctor not found</h2>
            <p className="mb-6 text-muted-foreground">The doctor you're looking for doesn't exist</p>
            <Button asChild>
              <Link href="/doctors">Back to Doctors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/doctors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Doctors
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doctor Info Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <Avatar className="h-32 w-32 shrink-0">
                  <AvatarImage 
                    src={doctor.profileImage || undefined} 
                    alt={doctor.name}
                    onError={(e) => {
                      console.log("Doctor image failed to load:", doctor.profileImage)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">{doctor.name}</h1>
                    {getConsultationBadge(doctor.consultationType)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-medium">{doctor.specialization}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{doctor.qualification}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.experience}</span>
                    </div>

                    {doctor.contact && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.contact}</span>
                      </div>
                    )}

                    {doctor.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{doctor.email}</span>
                      </div>
                    )}

                    {doctor.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          {doctor.address.street}, {doctor.address.city}, {doctor.address.state} -{" "}
                          {doctor.address.pincode}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="mb-2 font-semibold">About</h3>
                    <p className="text-muted-foreground">{doctor.bio || "No bio available"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Card */}
          {availability.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Availability Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availability
                    .filter((slot) => slot.isActive)
                    .sort((a, b) => {
                      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                      return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
                    })
                    .map((slot) => (
                      <div key={slot._id} className="rounded-lg border p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{slot.dayOfWeek}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-7">
                          {slot.timeSlots
                            .filter((ts) => ts.isAvailable)
                            .map((ts) => (
                              <Badge key={ts._id} variant="secondary" className="text-xs">
                                {ts.startTime} - {ts.endTime}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="text-sm text-muted-foreground">Consultation Fee</div>
                <div className="text-3xl font-bold">₹{doctor.fee}</div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href={`/appointments/book/${doctor._id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Link>
              </Button>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Consultation Type</span>
                  <span className="font-medium capitalize">{doctor.consultationType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{doctor.experience}</span>
                </div>
                {availability.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Days</span>
                    <span className="font-medium">{availability.filter((s) => s.isActive).length} days/week</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
