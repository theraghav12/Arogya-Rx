"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
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
import { Calendar, Video, MapPin, Clock, ChevronRight, Stethoscope, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { getMyAppointments, cancelAppointment, type Appointment } from "@/lib/api/appointments"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchAppointments()
  }, [activeTab])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const statusFilter = activeTab === "all" ? undefined : activeTab
      const response = await getMyAppointments(statusFilter)

      if (response.success) {
        setAppointments(response.data || [])
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch appointments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId)
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    try {
      setCancellingId(appointmentToCancel)
      const response = await cancelAppointment(appointmentToCancel)

      if (response.success) {
        toast({
          title: "Success",
          description: "Appointment cancelled successfully",
        })
        fetchAppointments()
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
      setCancellingId(null)
      setShowCancelDialog(false)
      setAppointmentToCancel(null)
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
        return "Online"
      case "offline":
        return "In-Clinic"
      case "virtual":
        return "Virtual (Video)"
      default:
        return type
    }
  }

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.status === "pending" || appointment.status === "accepted"
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="mb-8 text-3xl font-bold">My Appointments</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {["all", "pending", "accepted", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                      <Stethoscope className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h2 className="mb-2 text-xl font-semibold">No appointments found</h2>
                      <p className="mb-6 text-muted-foreground">
                        {tab === "all"
                          ? "You haven't booked any appointments yet"
                          : `You don't have any ${tab} appointments`}
                      </p>
                      <Button asChild>
                        <Link href="/doctors">Find Doctors</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  appointments.map((appointment) => {
                    const doctor = appointment.doctor
                    if (!doctor) return null

                    return (
                      <Card key={appointment._id} className="transition-shadow hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex gap-4">
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

                              <div className="flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-semibold">{doctor.name}</h3>
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status.toUpperCase()}
                                  </Badge>
                                  {appointment.paymentStatus === "paid" && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      PAID
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(new Date(appointment.date), "PPP")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{appointment.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    {appointment.consultationType === "virtual" ||
                                    appointment.consultationType === "online" ? (
                                      <>
                                        <Video className="h-4 w-4 text-primary" />
                                        <span className="text-primary">
                                          {getConsultationTypeLabel(appointment.consultationType)}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">In-Clinic Visit</span>
                                      </>
                                    )}
                                  </div>
                                  {appointment.reason && (
                                    <div className="text-sm text-muted-foreground">
                                      <span className="font-medium">Reason:</span> {appointment.reason}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 text-lg font-bold">₹{appointment.fee}</div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {appointment.virtualMeeting?.meetLink && appointment.status === "accepted" && (
                                <Button size="sm" asChild>
                                  <a href={appointment.virtualMeeting.meetLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="mr-2 h-4 w-4" />
                                    Join Meeting
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/appointments/${appointment._id}`}>
                                  View Details
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                              </Button>
                              {canCancelAppointment(appointment) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleCancelClick(appointment._id)}
                                  disabled={cancellingId === appointment._id}
                                >
                                  {cancellingId === appointment._id ? (
                                    <>
                                      <Spinner className="mr-2 h-3 w-3" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    "Cancel Appointment"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

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
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground">
              Yes, Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
