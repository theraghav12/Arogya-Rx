"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { labTestsApi, type LabTest } from "@/lib/api/lab-tests"
import { createLabTestOrder } from "@/lib/api/orders"
import { getUser } from "@/lib/auth-utils"
import { ChevronLeft, Calendar as CalendarIcon, Home, User, Phone, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function BookLabTestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const user = getUser()

  const [test, setTest] = useState<LabTest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [bookingFor, setBookingFor] = useState<"self" | "other">("self")
  const [patientName, setPatientName] = useState(user?.name || "")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [contactPhone, setContactPhone] = useState(user?.contact || "")
  const [contactEmail, setContactEmail] = useState(user?.email || "")
  const [address, setAddress] = useState("")
  const [homeCollection, setHomeCollection] = useState(true)
  const [preferredDate, setPreferredDate] = useState<Date>()
  const [preferredSlot, setPreferredSlot] = useState("")

  useEffect(() => {
    if (params.id) {
      loadTest(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (bookingFor === "self" && user) {
      setPatientName(user.name || "")
      setContactPhone(user.contact || "")
      setContactEmail(user.email || "")
    } else if (bookingFor === "other") {
      setPatientName("")
      setPatientAge("")
      setPatientGender("")
    }
  }, [bookingFor, user])

  const loadTest = async (id: string) => {
    setLoading(true)
    try {
      const data = await labTestsApi.getById(id)
      if (data.success && data.data) {
        setTest(data.data)
        setHomeCollection(data.data.isHomeCollectionAvailable)
      }
    } catch (error) {
      console.error("Failed to load test:", error)
      toast({
        title: "Error",
        description: "Failed to load test details",
        variant: "destructive",
      })
      router.push("/lab-tests")
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    { value: "09:00-11:00", label: "9:00 AM - 11:00 AM" },
    { value: "11:00-13:00", label: "11:00 AM - 1:00 PM" },
    { value: "14:00-16:00", label: "2:00 PM - 4:00 PM" },
    { value: "16:00-18:00", label: "4:00 PM - 6:00 PM" },
  ]

  const calculateTotal = () => {
    if (!test) return 0
    let total = test.discountedPrice
    if (homeCollection && test.isHomeCollectionAvailable) {
      total += test.homeCollectionPrice
    }
    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!test) return

    // Validation
    if (!patientName || !patientAge || !patientGender || !contactPhone || !address) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (homeCollection && (!preferredDate || !preferredSlot)) {
      toast({
        title: "Validation Error",
        description: "Please select preferred date and time slot for home collection",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const [startTime, endTime] = preferredSlot.split("-")

      const orderData = {
        tests: [{ labTestId: test._id }],
        patientName,
        patientAge: parseInt(patientAge),
        patientGender,
        contactPhone,
        contactEmail: contactEmail || undefined,
        address,
        homeCollection,
        preferredDate: preferredDate ? format(preferredDate, "yyyy-MM-dd") : undefined,
        preferredSlot: preferredSlot ? { start: startTime, end: endTime } : undefined,
        payment: { method: "online" },
      }

      const result = await createLabTestOrder(orderData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Lab test booked successfully!",
        })
        router.push("/orders")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book lab test",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!test) {
    return null
  }

  return (
    <div className="container px-4 py-8 md:px-6 max-w-4xl">
      <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Book Lab Test</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to book your test</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Details */}
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{test.testName}</h3>
                  <p className="text-sm text-muted-foreground">{test.category}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{test.parameters?.length || 0} Parameters</Badge>
                  <span className="text-muted-foreground">Report in {test.reportDeliveryTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Booking For */}
            <Card>
              <CardHeader>
                <CardTitle>Who is this test for?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={bookingFor} onValueChange={(value: "self" | "other") => setBookingFor(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self" className="cursor-pointer">Myself</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">Someone Else (Family/Friend)</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Patient Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Full Name *</Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Age *</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Enter age"
                      required
                      min="1"
                      max="120"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientGender">Gender *</Label>
                  <Select value={patientGender} onValueChange={setPatientGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email (Optional)</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Collection Details */}
            {test.isHomeCollectionAvailable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Sample Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="homeCollection"
                      checked={homeCollection}
                      onCheckedChange={(checked) => setHomeCollection(checked as boolean)}
                    />
                    <Label htmlFor="homeCollection" className="cursor-pointer">
                      Home Sample Collection (+₹{test.homeCollectionPrice})
                    </Label>
                  </div>

                  {homeCollection && (
                    <>
                      <Separator />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Preferred Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !preferredDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {preferredDate ? format(preferredDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={preferredDate}
                                onSelect={setPreferredDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredSlot">Preferred Time Slot *</Label>
                          <Select value={preferredSlot} onValueChange={setPreferredSlot} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : (
                `Book Test - ₹${calculateTotal()}`
              )}
            </Button>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Test Price</span>
                  <span className="font-medium">₹{test.discountedPrice}</span>
                </div>
                {test.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">-₹{test.price - test.discountedPrice}</span>
                  </div>
                )}
                {homeCollection && test.isHomeCollectionAvailable && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Home Collection</span>
                    <span className="font-medium">₹{test.homeCollectionPrice}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-primary">₹{calculateTotal()}</span>
              </div>

              <Separator />

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ NABL Certified Lab</p>
                <p>✓ Digital Report</p>
                <p>✓ Free Home Collection</p>
                <p>✓ Report in {test.reportDeliveryTime}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
