"use client"

import * as React from "react"
import { Bot } from "lucide-react"
import { AIChatbot } from "./ai-chatbot"

export function AIChatbotFloat() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [chatPosition, setChatPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [isChatDragging, setIsChatDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const chatRef = React.useRef<HTMLDivElement>(null)

  // Initialize positions
  React.useEffect(() => {
    const savedPosition = localStorage.getItem("aiChatbotPosition")
    const savedChatPosition = localStorage.getItem("aiChatbotChatPosition")
    
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition))
    } else {
      // Default position: bottom right
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      })
    }

    if (savedChatPosition) {
      setChatPosition(JSON.parse(savedChatPosition))
    } else {
      // Default chat position: center-right
      setChatPosition({
        x: window.innerWidth - 450,
        y: 50,
      })
    }
  }, [])

  // Handle button drag
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return
    
    setIsDragging(true)
    const rect = buttonRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleButtonMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Constrain to viewport
      const maxX = window.innerWidth - 70
      const maxY = window.innerHeight - 70

      const constrainedX = Math.max(0, Math.min(newX, maxX))
      const constrainedY = Math.max(0, Math.min(newY, maxY))

      setPosition({ x: constrainedX, y: constrainedY })
    },
    [isDragging, dragOffset]
  )

  const handleButtonMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      localStorage.setItem("aiChatbotPosition", JSON.stringify(position))
    }
  }

  // Handle chat drag
  const handleChatMouseDown = (e: React.MouseEvent) => {
    if (!chatRef.current) return
    
    // Only allow dragging from header
    const target = e.target as HTMLElement
    if (!target.closest('[data-chat-header]')) return

    setIsChatDragging(true)
    const rect = chatRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleChatMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isChatDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Constrain to viewport
      const maxX = window.innerWidth - (isMinimized ? 320 : 384)
      const maxY = window.innerHeight - (isMinimized ? 100 : 600)

      const constrainedX = Math.max(0, Math.min(newX, maxX))
      const constrainedY = Math.max(0, Math.min(newY, maxY))

      setChatPosition({ x: constrainedX, y: constrainedY })
    },
    [isChatDragging, dragOffset, isMinimized]
  )

  const handleChatMouseUp = () => {
    if (isChatDragging) {
      setIsChatDragging(false)
      localStorage.setItem("aiChatbotChatPosition", JSON.stringify(chatPosition))
    }
  }

  // Add event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleButtonMouseMove)
      document.addEventListener("mouseup", handleButtonMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleButtonMouseMove)
        document.removeEventListener("mouseup", handleButtonMouseUp)
      }
    }
  }, [isDragging, handleButtonMouseMove])

  React.useEffect(() => {
    if (isChatDragging) {
      document.addEventListener("mousemove", handleChatMouseMove)
      document.addEventListener("mouseup", handleChatMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleChatMouseMove)
        document.removeEventListener("mouseup", handleChatMouseUp)
      }
    }
  }, [isChatDragging, handleChatMouseMove])

  const handleToggleChat = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else {
      setIsOpen(false)
      setIsMinimized(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {/* Floating Robot Button */}
      <button
        ref={buttonRef}
        className={`fixed z-50 group ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "70px",
          height: "70px",
        }}
        onMouseDown={handleButtonMouseDown}
        onClick={(e) => {
          // Only open chat if not dragging
          if (!isDragging) {
            handleToggleChat()
          }
        }}
        aria-label="AI Doctor Chatbot"
      >
        {/* Robot Face */}
        <div className="relative w-full h-full">
          {/* Main circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            
            {/* Robot face elements */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              {/* Eyes */}
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              </div>
              
              {/* Antenna */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-0.5 h-2 bg-primary-foreground/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
              </div>
              
              {/* Mouth/Smile */}
              <div className="w-6 h-3 border-b-2 border-primary-foreground rounded-b-full mt-1" />
            </div>

            {/* Pulse animation ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
          </div>

          {/* Notification badge (optional) */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
              <div className="h-2 w-2 rounded-full bg-white" />
            </div>
          )}
        </div>

        {/* Tooltip */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          AI Doctor
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          ref={chatRef}
          className={`fixed z-50 ${isChatDragging ? "cursor-grabbing" : ""}`}
          style={{
            left: `${chatPosition.x}px`,
            top: `${chatPosition.y}px`,
          }}
          onMouseDown={handleChatMouseDown}
        >
          <div data-chat-header>
            <AIChatbot
              onClose={handleClose}
              isMinimized={isMinimized}
              onToggleMinimize={handleToggleMinimize}
            />
          </div>
        </div>
      )}
    </>
  )
}
