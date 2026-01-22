"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Send,
  X,
  Loader2,
  User,
  Stethoscope,
  ShoppingBag,
  AlertCircle,
  Minimize2,
  Maximize2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUser } from "@/lib/auth-utils"
import {
  sendMessageToAI,
  generateSessionId,
  getAIInfo,
  type ChatMessage,
  type Recommendation,
} from "@/lib/api/ai-chatbot"
import { useRouter } from "next/navigation"

interface AIChatbotProps {
  onClose: () => void
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function AIChatbot({ onClose, isMinimized, onToggleMinimize }: AIChatbotProps) {
  const { toast } = useToast()
  const router = useRouter()
  const user = getUser()
  
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [sessionId, setSessionId] = React.useState("")
  const [aiInfo, setAiInfo] = React.useState<any>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem("aiChatSessionId")
    const storedMessages = localStorage.getItem("aiChatMessages")
    
    if (storedSessionId && storedMessages) {
      setSessionId(storedSessionId)
      setMessages(JSON.parse(storedMessages))
    } else {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      localStorage.setItem("aiChatSessionId", newSessionId)
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: "Hello! I'm your AI Doctor assistant. I can help you with health questions, find doctors, and recommend wellness products. How can I assist you today?",
        timestamp: new Date().toISOString(),
        isAI: true,
      }
      setMessages([welcomeMessage])
      localStorage.setItem("aiChatMessages", JSON.stringify([welcomeMessage]))
    }

    // Fetch AI info
    fetchAIInfo()
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  React.useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0) {
      localStorage.setItem("aiChatMessages", JSON.stringify(messages))
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchAIInfo = async () => {
    try {
      const response = await getAIInfo()
      if (response.success) {
        setAiInfo(response.data)
      }
    } catch (error) {
      console.error("Error fetching AI info:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      isAI: false,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)

    try {
      const response = await sendMessageToAI({
        message: inputMessage,
        sessionId: sessionId,
        userId: user?.id || undefined,
      })

      if (response.success) {
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: response.data.message,
          recommendations: response.data.recommendations,
          timestamp: response.data.timestamp,
          isAI: true,
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    } catch (error: any) {
      console.error("Error sending message:", error)

      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        isAI: true,
        isError: true,
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.type === "doctor") {
      router.push(`/appointments/book/${recommendation.data._id}`)
    } else if (recommendation.type === "product") {
      router.push(`/medicines/${recommendation.data._id}`)
    }
  }

  const handleNewChat = () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    localStorage.setItem("aiChatSessionId", newSessionId)
    
    const welcomeMessage: ChatMessage = {
      role: "assistant",
      content: "Hello! I'm your AI Doctor assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
      isAI: true,
    }
    setMessages([welcomeMessage])
    localStorage.setItem("aiChatMessages", JSON.stringify([welcomeMessage]))
  }

  if (isMinimized) {
    return (
      <Card className="w-80 shadow-2xl">
        <CardHeader className="p-4 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base">AI Doctor</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onToggleMinimize}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-96 h-[600px] shadow-2xl flex flex-col overflow-hidden">
      <CardHeader className="p-4 bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <CardTitle className="text-base">AI Doctor</CardTitle>
              {aiInfo && (
                <p className="text-xs opacity-80">v{aiInfo.version}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleNewChat}
            >
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={onToggleMinimize}
            >
                <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.isAI ? "justify-start" : "justify-end"}`}
            >
              {msg.isAI && (
                <Avatar className="h-8 w-8 shrink-0 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-2 max-w-[75%] ${!msg.isAI && "items-end"}`}>
                <div
                  className={`rounded-lg p-3 break-words ${
                    msg.isAI
                      ? msg.isError
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-2 w-full">
                    {msg.recommendations.map((rec, idx) => (
                      <Card
                        key={idx}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleRecommendationClick(rec)}
                      >
                        <CardContent className="p-3">
                          {rec.type === "doctor" && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-primary" />
                                <p className="font-semibold text-sm break-words">{rec.data.name}</p>
                              </div>
                              <p className="text-xs text-muted-foreground break-words">
                                {rec.data.specialization}
                              </p>
                              <p className="text-xs text-muted-foreground break-words">
                                {rec.data.qualification}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  ₹{rec.data.fee}
                                </Badge>
                                <Button size="sm" className="h-6 text-xs">
                                  Book Now
                                </Button>
                              </div>
                            </div>
                          )}

                          {rec.type === "product" && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                <p className="font-semibold text-sm break-words">{rec.data.productName}</p>
                              </div>
                              <p className="text-xs text-muted-foreground break-words">{rec.data.brandName}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                                {rec.data.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  ₹{rec.data.price}
                                </Badge>
                                <Button size="sm" className="h-6 text-xs">
                                  View Product
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <span className="text-xs text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {!msg.isAI && (
                <Avatar className="h-8 w-8 shrink-0 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 shrink-0 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3 shrink-0 bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <AlertCircle className="h-3 w-3" />
          <span>AI is not a substitute for professional medical advice</span>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your health question..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !inputMessage.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  )
}
