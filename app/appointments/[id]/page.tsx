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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Video,
  ArrowLeft,
  ExternalLink,
  FileText,
  User,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { getAppointmentById, cancelAppointment, type Appointment } from "@/lib/api/appointments"

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.id as string
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true)
      const response = await getAppointmentById(appointmentId)

      if (response.success) {
        setAppointment(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch appointment details",
          variant: "destructive",
        })
        router.push("/appointments")
      }
    } catch (error) {
      console.error("Error fetching appointment:", error)
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      })
      router.push("/appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!appointment) return

    try {
      setCancelling(true)
      const response = await cancelAppointment(appointment._id)

      if (response.success) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        })
        fetchAppointmentDetails()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to cancel appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white"
      case "accepted":
        return "bg-green-500 text-white"
      case "completed":
        return "bg-blue-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      case "missed":
        return "bg-gray-500 text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case "online":
        return "Online Consultation"
      case "offline":
        return "In-Clinic Visit"
      case "virtual":
        return "Virtual (Video Call)"
      default:
        return type
    }
  }

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.status === "pending" || appointment.status === "accepted"
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

  if (!appointment) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">Appointment not found</h2>
            <p className="mb-6 text-muted-foreground">The appointment you're looking for doesn't exist</p>
            <Button asChild>
              <Link href="/appointments">Back to Appointments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const doctor = appointment.doctor
  const patient = appointment.patient

  return (
    <div className="container px-4 py-8 md:px-6">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          {patient && (
            <p className="text-muted-foreground">
              Patient: {patient.name} • Appointment ID: {appointment._id.slice(-8)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
          {appointment.paymentStatus === "paid" && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              PAID
            </Badge>
          )}
          {appointment.paymentStatus === "pending" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              PAYMENT PENDING
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Information */}
          {doctor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Doctor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Avatar className="h-20 w-20 shrink-0">
                    <AvatarImage 
                      src={doctor.profileImage || undefined} 
                      alt={doctor.name}
                      onError={(e) => {
                        console.log("Doctor image failed to load:", doctor.profileImage)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <AvatarFallback className="text-lg bg-primary/10">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                    <p className="text-muted-foreground">{doctor.specialization}</p>
                    <p className="text-sm text-muted-foreground">{doctor.qualification}</p>

                    <div className="pt-2 space-y-1">
                      {doctor.contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{doctor.contact}</span>
                        </div>
                      )}
                      {doctor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{doctor.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{format(new Date(appointment.date), "PPP")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{appointment.time}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{appointment.duration} minutes</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Consultation Type</div>
                  <div className="font-medium">{getConsultationTypeLabel(appointment.consultationType)}</div>
                </div>
              </div>

              {appointment.reason && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Reason for Visit</div>
                    <p className="text-sm">{appointment.reason}</p>
                  </div>
                </>
              )}

              {appointment.notes && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Doctor's Notes</div>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                </>
              )}

              {appointment.virtualMeeting?.meetLink && appointment.status === "accepted" && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Virtual Meeting</div>
                    <Button asChild>
                      <a href={appointment.virtualMeeting.meetLink} target="_blank" rel="noopener noreferrer">
                        <Video className="mr-2 h-4 w-4" />
                        Join Meeting
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Prescription */}
          {appointment.prescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-sm">{appointment.prescription}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Information */}
          {patient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={patient.profileImage || "/placeholder.svg"} alt={patient.name} />
                    <AvatarFallback className="text-lg">
                      {patient.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{patient.name}</h3>
                    {patient.email && (
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {patient.age && (
                      <div>
                        <div className="text-sm text-muted-foreground">Age</div>
                        <div className="font-medium">{patient.age} years</div>
                      </div>
                    )}
                    {patient.gender && (
                      <div>
                        <div className="text-sm text-muted-foreground">Gender</div>
                        <div className="font-medium capitalize">{patient.gender}</div>
                      </div>
                    )}
                    {patient.contact && (
                      <div>
                        <div className="text-sm text-muted-foreground">Contact</div>
                        <div className="font-medium">{patient.contact}</div>
                      </div>
                    )}
                  </div>
                  {patient.address && (
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="text-sm">
                        {patient.address.street}, {patient.address.city}, {patient.address.state} -{" "}
                        {patient.address.pincode}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="text-2xl font-bold">₹{appointment.fee}</span>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    variant={appointment.paymentStatus === "paid" ? "default" : "outline"}
                    className={
                      appointment.paymentStatus === "paid"
                        ? "bg-green-500"
                        : appointment.paymentStatus === "pending"
                          ? "bg-yellow-500"
                          : ""
                    }
                  >
                    {appointment.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booked On</span>
                  <span>{format(new Date(appointment.createdAt), "PP")}</span>
                </div>
              </div>

              {appointment.paymentStatus === "pending" && appointment.status !== "cancelled" && (
                <>
                  <Separator />
                  <Button className="w-full" asChild>
                    <Link href={`/appointments/${appointment._id}/payment`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Link>
                  </Button>
                </>
              )}

              {canCancelAppointment(appointment) && (
                <>
                  <Separator />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Appointment"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAppointment} className="bg-destructive text-destructive-foreground">
              Yes, Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
