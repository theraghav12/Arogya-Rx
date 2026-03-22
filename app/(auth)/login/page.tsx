"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Phone, Pill, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi } from "@/lib/api/auth"
import { useToast } from "@/hooks/use-toast"
import { usePhoneAuth } from "@/hooks/use-phone-auth"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [recaptchaContainerId, setRecaptchaContainerId] = React.useState("recaptcha-container")
  const [otpExpiryTime, setOtpExpiryTime] = React.useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = React.useState<number>(0)

  const [emailLogin, setEmailLogin] = React.useState({ email: "", password: "" })
  const [phoneLogin, setPhoneLogin] = React.useState({ phone: "" })
  const [otpSent, setOtpSent] = React.useState(false)
  const [otp, setOtp] = React.useState("")

  const { 
    loading: phoneLoading, 
    error: phoneError, 
    sendOTP, 
    verifyOTP, 
    loginWithPhone,
    cleanup,
    reset 
  } = usePhoneAuth()

  React.useEffect(() => {
    if (phoneError) {
      setError(phoneError)
    }
  }, [phoneError])

  // Cleanup on unmount only
  React.useEffect(() => {
    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // OTP Timer countdown
  React.useEffect(() => {
    if (!otpExpiryTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((otpExpiryTime - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        setError("OTP expired. Please request a new one.")
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [otpExpiryTime])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await authApi.login({
        email: emailLogin.email,
        password: emailLogin.password,
      })

      if (result.success && result.token) {
        toast({
          title: "Login successful",
          description: "Welcome back to ArogyaRx!",
        })
        router.push("/")
      } else {
        setError(result.message || "Invalid credentials")
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otpSent) {
      // Send OTP
      setLoading(true)
      
      // Generate unique container ID
      const newContainerId = `recaptcha-container-${Date.now()}`
      setRecaptchaContainerId(newContainerId)
      
      // Wait for DOM to update with new container
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const phoneNumber = `+91${phoneLogin.phone}`
      const result = await sendOTP(phoneNumber, newContainerId)
      setLoading(false)

      if (result.success) {
        setOtpSent(true)
        // Set OTP expiry time (5 minutes from now)
        setOtpExpiryTime(Date.now() + 5 * 60 * 1000)
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        })
      } else {
        setError(result.error || "Failed to send OTP")
      }
    } else {
      // Verify OTP and login
      setLoading(true)
      const verifyResult = await verifyOTP(otp)
      
      if (verifyResult.success && verifyResult.idToken) {
        const loginResult = await loginWithPhone(verifyResult.idToken)
        
        if (loginResult.success) {
          toast({
            title: "Login successful",
            description: "Welcome back to ArogyaRx!",
          })
          router.push("/")
        } else if (loginResult.needsRegistration) {
          // Redirect to signup with phone number and idToken
          toast({
            title: "Account not found",
            description: "Redirecting to signup...",
          })
          
          // Store phone number and idToken in sessionStorage for signup page
          sessionStorage.setItem("signupPhone", phoneLogin.phone)
          sessionStorage.setItem("signupIdToken", verifyResult.idToken)
          
          // Redirect to register page
          setTimeout(() => {
            router.push("/register?verified=true")
          }, 1000)
        } else {
          setError(loginResult.error || "Login failed")
        }
      } else {
        // Show user-friendly error message for wrong OTP
        const errorMsg = verifyResult.error || "Invalid OTP"
        if (errorMsg.includes("invalid-verification-code") || errorMsg.includes("auth/invalid-verification-code")) {
          setError("Wrong OTP. Please try again.")
        } else if (errorMsg.includes("code-expired")) {
          setError("OTP expired. Please request a new one.")
        } else {
          setError("Invalid OTP. Please check and try again.")
        }
      }
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setOtp("") // Clear OTP input
    
    // Clear existing reCAPTCHA before resending
    cleanup()
    
    // Generate unique container ID
    const newContainerId = `recaptcha-container-${Date.now()}`
    setRecaptchaContainerId(newContainerId)
    
    // Wait for DOM to update with new container
    await new Promise(resolve => setTimeout(resolve, 200))
    
    setLoading(true)
    const phoneNumber = `+91${phoneLogin.phone}`
    const result = await sendOTP(phoneNumber, newContainerId)
    setLoading(false)

    if (result.success) {
      // Reset OTP expiry time (5 minutes from now)
      setOtpExpiryTime(Date.now() + 5 * 60 * 1000)
      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your phone.",
      })
    } else {
      setError(result.error || "Failed to resend OTP")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 z-20"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      {/* Animated background elements - Medical themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating medical icons/shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 opacity-10">
          <Pill className="w-full h-full text-primary animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }} />
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 opacity-10">
          <Pill className="w-full h-full text-primary animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 opacity-10">
          <Pill className="w-full h-full text-primary animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 opacity-10">
          <Pill className="w-full h-full text-primary animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      <div 
        className="w-full max-w-md relative z-10"
        style={{
          animation: 'slideUp 0.6s ease-out',
        }}
      >
        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="ArogyaRx Logo" 
              className="h-16 w-auto transition-transform group-hover:scale-110 duration-300"
            />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-balance">
            Welcome to ArogyaRx
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-balance">
            Sign in to access your healthcare dashboard
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Enter your phone number to continue
            </p>
            
            {/* Sample Credentials */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Sample Credentials for Testing:</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Phone:</span>
                  <button
                    type="button"
                    className="font-mono bg-background px-2 py-1 rounded border text-foreground hover:bg-accent transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText('9999999999')
                      toast({
                        title: "Copied!",
                        description: "Phone number copied to clipboard",
                      })
                    }}
                  >
                    9999999999
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">OTP:</span>
                  <button
                    type="button"
                    className="font-mono bg-background px-2 py-1 rounded border text-foreground hover:bg-accent transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText('999999')
                      toast({
                        title: "Copied!",
                        description: "OTP copied to clipboard",
                      })
                    }}
                  >
                    999999
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {/* Only Phone Login - No Tabs */}
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              {error && (
                <div className="text-center py-1.5 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Hidden reCAPTCHA container - must be visible in DOM */}
              <div id={recaptchaContainerId} className="flex justify-center"></div>

              {!otpSent ? (
                // Phone Number Input - Show only when OTP not sent
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <div className="flex gap-2">
                    {/* Country Code Block */}
                    <div className="relative w-20">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value="+91"
                        disabled
                        className="h-10 text-sm font-medium border-2 pl-9 bg-muted cursor-not-allowed"
                      />
                    </div>
                    {/* Phone Number Block */}
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      className="flex-1 h-10 text-sm border-2 focus:border-primary transition-colors"
                      value={phoneLogin.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setPhoneLogin({ ...phoneLogin, phone: value })
                      }}
                      required
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enter your 10-digit mobile number
                  </p>
                </div>
              ) : (
                // OTP Input - Show only when OTP sent
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {/* Change Phone Number Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => {
                        reset() // Clear reCAPTCHA and reset state
                        setOtpSent(false)
                        setOtp("")
                        setPhoneLogin({ phone: "" })
                        setError("")
                      }}
                    >
                      Change Phone Number
                    </button>
                  </div>

                  {/* OTP Input Field */}
                  <div className="space-y-2">
                    <Label htmlFor="otp-0" className="text-sm font-medium">Enter OTP</Label>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          className="h-11 w-11 text-center text-lg font-semibold border-2 focus:border-primary transition-colors p-0"
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otp[index] || ""}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            if (value.length <= 1) {
                              const newOtp = otp.split("")
                              newOtp[index] = value
                              setOtp(newOtp.join(""))
                              
                              // Auto-focus next input
                              if (value && index < 5) {
                                const nextInput = document.getElementById(`otp-${index + 1}`)
                                nextInput?.focus()
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace to go to previous input
                            if (e.key === "Backspace" && !otp[index] && index > 0) {
                              const prevInput = document.getElementById(`otp-${index - 1}`)
                              prevInput?.focus()
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault()
                            const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
                            setOtp(pastedData)
                            
                            // Focus the last filled input or the next empty one
                            const nextIndex = Math.min(pastedData.length, 5)
                            const nextInput = document.getElementById(`otp-${nextIndex}`)
                            nextInput?.focus()
                          }}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      OTP sent to +91{phoneLogin.phone}.{" "}
                      {timeRemaining > 0 ? (
                        <span className="text-primary font-medium">
                          Expires in {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className="text-primary hover:underline font-medium"
                          onClick={handleResendOTP}
                          disabled={loading || phoneLoading}
                        >
                          Resend OTP
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-10 text-sm font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                disabled={loading || phoneLoading}
              >
                {loading || phoneLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    {otpSent ? "Verifying..." : "Sending OTP..."}
                  </span>
                ) : otpSent ? (
                  "Verify OTP & Login"
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
