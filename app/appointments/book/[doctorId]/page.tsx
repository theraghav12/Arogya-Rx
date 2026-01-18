"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, ArrowLeft, Video, MapPin, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"
import { getDoctors, getDoctorAvailability, bookAppointment, type Doctor, type DoctorAvailability, type BookAppointmentRequest } from "@/lib/api/appointments"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [consultationType, setConsultationType] = useState<"offline" | "virtual">("offline")
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails()
      fetchDoctorAvailability()
    }
  }, [doctorId])

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

  const getAvailabilityForDate = (date: Date) => {
    const dayName = DAYS_OF_WEEK[date.getDay()]
    return availability.find((slot) => slot.dayOfWeek === dayName && slot.isActive)
  }

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      // Fetch all doctors and find the one with matching ID
      const response = await getDoctors({ limit: 1000 })

      if (response.success && response.data.doctors.length > 0) {
        const foundDoctor = response.data.doctors.find((d: Doctor) => d._id === doctorId)
        if (foundDoctor) {
          setDoctor(foundDoctor)
          // Set default consultation type based on doctor's availability
          if (foundDoctor.consultationType === "online") {
            setConsultationType("online")
          } else if (foundDoctor.consultationType === "offline") {
            setConsultationType("offline")
          }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate) {
      toast({
        title: "Validation Error",
        description: "Please select a date",
        variant: "destructive",
      })
      return
    }

    if (!time) {
      toast({
        title: "Validation Error",
        description: "Please select a time",
        variant: "destructive",
      })
      return
    }

    // Check if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please login to book an appointment",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      setSubmitting(true)

      const bookingData: BookAppointmentRequest = {
        doctorId: doctorId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: time,
        consultationType: consultationType,
        reason: reason || undefined,
      }

      const response = await bookAppointment(bookingData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Appointment booked successfully!",
        })
        // Redirect to appointments page or payment page
        router.push("/appointments")
      } else {
        toast({
          title: "Booking Failed",
          description: response.message || "Failed to book appointment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isConsultationTypeAvailable = (type: string) => {
    if (!doctor) return false
    if (doctor.consultationType === "both") return true
    return doctor.consultationType === type
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
            <p className="mb-6 text-muted-foreground">The doctor you're trying to book doesn't exist</p>
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
        <Link href={`/doctors/${doctorId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Doctor Details
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          setTime("") // Reset time when date changes
                        }}
                        disabled={(date) => {
                          // Disable past dates
                          if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                          // Disable dates when doctor is not available
                          const dayName = DAYS_OF_WEEK[date.getDay()]
                          const dayAvailability = availability.find(
                            (slot) => slot.dayOfWeek === dayName && slot.isActive
                          )
                          return !dayAvailability || dayAvailability.timeSlots.length === 0
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {DAYS_OF_WEEK[selectedDate.getDay()]}
                    </p>
                  )}
                </div>

                {/* Time Selection - Show available slots */}
                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Select Time Slot *</Label>
                    {(() => {
                      const dayAvailability = getAvailabilityForDate(selectedDate)
                      if (dayAvailability && dayAvailability.timeSlots.length > 0) {
                        const availableSlots = dayAvailability.timeSlots.filter((slot) => slot.isAvailable)
                        return (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => {
                              // Generate time options within the slot
                              const startHour = parseInt(slot.startTime.split(":")[0])
                              const startMin = parseInt(slot.startTime.split(":")[1])
                              const endHour = parseInt(slot.endTime.split(":")[0])
                              const endMin = parseInt(slot.endTime.split(":")[1])
                              
                              const startMinutes = startHour * 60 + startMin
                              const endMinutes = endHour * 60 + endMin
                              const duration = slot.duration || 30
                              
                              const timeOptions = []
                              for (let minutes = startMinutes; minutes < endMinutes; minutes += duration) {
                                const hours = Math.floor(minutes / 60)
                                const mins = minutes % 60
                                const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
                                timeOptions.push(timeStr)
                              }
                              
                              return timeOptions.map((timeOption) => (
                                <Button
                                  key={timeOption}
                                  type="button"
                                  variant={time === timeOption ? "default" : "outline"}
                                  className="w-full"
                                  onClick={() => setTime(timeOption)}
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  {timeOption}
                                </Button>
                              ))
                            })}
                          </div>
                        )
                      } else {
                        return (
                          <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted">
                            No available time slots for this date
                          </div>
                        )
                      }
                    })()}
                  </div>
                )}

                {/* Consultation Type */}
                <div className="space-y-3">
                  <Label>Consultation Type *</Label>
                  <RadioGroup value={consultationType} onValueChange={(value: any) => setConsultationType(value)}>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline" className="flex flex-1 cursor-pointer items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <div>
                          <div className="font-medium">In-Clinic Visit</div>
                          <div className="text-sm text-muted-foreground">Visit doctor at clinic</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="virtual" id="virtual" />
                      <Label htmlFor="virtual" className="flex flex-1 cursor-pointer items-center gap-2">
                        <Video className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Virtual (Video Call)</div>
                          <div className="text-sm text-muted-foreground">Video consultation via Google Meet</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Doctor Availability Info */}
                {selectedDate && (
                  <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
                    <Info className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="text-green-900 flex-1">
                      <p className="font-medium">Selected Date: {format(selectedDate, "PPP")}</p>
                      <p className="text-green-800 mt-1">
                        {time ? `Selected Time: ${time}` : "Please select a time slot above"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for consultation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Info Alert */}
                <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="text-blue-900">
                    <p className="font-medium">Important Information</p>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-blue-800">
                      <li>Your appointment will be pending until confirmed by the doctor</li>
                      <li>You'll receive a confirmation notification once accepted</li>
                      <li>Payment can be made after booking</li>
                      {consultationType === "virtual" && (
                        <li>Virtual meeting link will be provided after doctor accepts</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Booking...
                    </>
                  ) : (
                    "Book Appointment"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Summary Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Doctor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-16 w-16 shrink-0">
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
                <div>
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  <p className="text-xs text-muted-foreground">{doctor.experience}</p>
                </div>
              </div>

              <Separator />

              {/* Doctor Availability Schedule */}
              {availability.length > 0 && (
                <>
                  <div>
                    <div className="text-sm font-medium mb-2">Weekly Availability</div>
                    <div className="space-y-2">
                      {availability
                        .filter((slot) => slot.isActive)
                        .sort((a, b) => {
                          const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                          return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
                        })
                        .map((slot) => (
                          <div key={slot._id} className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">{slot.dayOfWeek}</div>
                            <div className="flex flex-wrap gap-1">
                              {slot.timeSlots
                                .filter((ts) => ts.isAvailable)
                                .map((ts) => (
                                  <Badge key={ts._id} variant="outline" className="text-xs">
                                    {ts.startTime}-{ts.endTime}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Qualification</span>
                  <span className="font-medium text-right">{doctor.qualification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="text-xl font-bold">₹{doctor.fee}</span>
                </div>
              </div>

              {doctor.address && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Clinic Address</div>
                    <p className="text-sm">
                      {doctor.address.street}, {doctor.address.city}, {doctor.address.state} - {doctor.address.pincode}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
