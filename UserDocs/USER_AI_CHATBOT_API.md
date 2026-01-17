# User AI Chatbot API Documentation

## Overview
This document provides comprehensive API documentation for the user-side AI Doctor chatbot system. Users can chat with an AI medical assistant that provides health guidance, recommends wellness products, and helps find doctors.

**Base URL**: `/api/ai-doctor`

---

## Table of Contents
1. [Send Message to AI Doctor](#1-send-message-to-ai-doctor)
2. [Get AI Doctor Health Status](#2-get-ai-doctor-health-status)
3. [Get AI Doctor Information](#3-get-ai-doctor-information)

---

## Authentication
All AI chatbot endpoints are **PUBLIC** - no authentication required (userId is optional).

---

## AI Doctor Capabilities

The AI Doctor can:
- 🩺 Provide general medical guidance and health information
- 🔍 Search and recommend doctors based on symptoms or specialization
- 💊 Recommend OTC products and wellness items
- 💬 Maintain conversation context and memory
- ⚠️ Always advises consulting real doctors for serious concerns

**Important Disclaimer**: The AI Doctor is not a substitute for professional medical advice, diagnosis, or treatment.

---

## API Endpoints

### 1. Send Message to AI Doctor

Send a message to the AI Doctor and receive a response with optional recommendations.

**Endpoint**: `POST /api/ai-doctor/chat`

**Authentication**: Not Required (Public)

**Request Body**:
```json
{
  "message": "I have a headache and fever. What should I do?",
  "sessionId": "user-session-123456",
  "userId": "64user456abc"
}
```

**Field Descriptions**:
- `message` (string, required): User's message/question (cannot be empty)
- `sessionId` (string, required): Unique session ID to maintain conversation context
- `userId` (string, optional): User ID if logged in (for tracking purposes)

**Success Response** (200 OK) - Simple Response:
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "message": "I understand you're experiencing a headache and fever. These symptoms could indicate various conditions. Here's what I recommend:\n\n1. Rest and stay hydrated\n2. Take over-the-counter pain relievers like paracetamol\n3. Monitor your temperature\n\nIf symptoms persist for more than 2-3 days or worsen, please consult a doctor immediately. Would you like me to help you find a doctor nearby?",
    "recommendations": [],
    "timestamp": "2026-01-14T10:30:00.000Z",
    "sessionId": "user-session-123456",
    "userId": "64user456abc",
    "isAI": true
  }
}
```

**Success Response** (200 OK) - With Doctor Recommendations:
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "message": "Based on your symptoms of persistent chest pain, I strongly recommend consulting a cardiologist immediately. Here are some specialists I found for you:",
    "recommendations": [
      {
        "type": "doctor",
        "data": {
          "_id": "64doctor123abc",
          "name": "Dr. Rajesh Kumar",
          "specialization": "Cardiologist",
          "qualification": "MBBS, MD (Cardiology)",
          "experience": "15 years",
          "fee": 800,
          "contact": "+91-9876543210"
        }
      },
      {
        "type": "doctor",
        "data": {
          "_id": "64doctor456def",
          "name": "Dr. Priya Sharma",
          "specialization": "Cardiologist",
          "qualification": "MBBS, DM (Cardiology)",
          "experience": "12 years",
          "fee": 1000,
          "contact": "+91-9876543211"
        }
      }
    ],
    "timestamp": "2026-01-14T10:35:00.000Z",
    "sessionId": "user-session-123456",
    "userId": "64user456abc",
    "isAI": true
  }
}
```

**Success Response** (200 OK) - With Product Recommendations:
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "message": "For your cold and cough, I recommend these over-the-counter products that might help:",
    "recommendations": [
      {
        "type": "product",
        "data": {
          "_id": "64product123abc",
          "productName": "Vicks VapoRub",
          "brandName": "Vicks",
          "category": "Cold & Cough",
          "price": 150,
          "description": "Topical ointment for cold relief"
        }
      },
      {
        "type": "product",
        "data": {
          "_id": "64product456def",
          "productName": "Honey Ginger Tea",
          "brandName": "Organic India",
          "category": "Wellness",
          "price": 250,
          "description": "Natural remedy for cough and sore throat"
        }
      }
    ],
    "timestamp": "2026-01-14T10:40:00.000Z",
    "sessionId": "user-session-123456",
    "userId": "64user456abc",
    "isAI": true
  }
}
```

**Error Responses**:

**400 Bad Request** - Empty message:
```json
{
  "success": false,
  "message": "Message is required",
  "error": "Message cannot be empty"
}
```

**400 Bad Request** - Missing session ID:
```json
{
  "success": false,
  "message": "Session ID is required for maintaining conversation memory"
}
```

**500 Internal Server Error** - Agent error:
```json
{
  "success": false,
  "message": "AI Agent encountered an error",
  "error": "Error details"
}
```

**500 Internal Server Error** - Unexpected error:
```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "error": "Internal server error"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/ai-doctor/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a headache and fever. What should I do?",
    "sessionId": "user-session-123456",
    "userId": "64user456abc"
  }'
```

**Notes**:
- The AI maintains conversation context using `sessionId`
- Use the same `sessionId` for follow-up questions in the same conversation
- Generate a new `sessionId` for each new conversation (e.g., UUID or timestamp-based)
- The `recommendations` array can contain doctors, products, or be empty
- The AI remembers previous messages in the conversation

---

### 2. Get AI Doctor Health Status

Check if the AI Doctor service is active and running.

**Endpoint**: `GET /api/ai-doctor/health`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "status": "active",
  "type": "agent-enabled"
}
```

**Field Descriptions**:
- `status`: Service status (`active` or `inactive`)
- `type`: AI implementation type (`agent-enabled` indicates LangChain agent)

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/ai-doctor/health"
```

**Use Case**: Check service availability before starting a chat session.

---

### 3. Get AI Doctor Information

Get information about the AI Doctor's capabilities and version.

**Endpoint**: `GET /api/ai-doctor/info`

**Authentication**: Not Required (Public)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "name": "AI Doctor Agent",
    "capabilities": [
      "Medical Guidance",
      "Find Doctors",
      "Find Wellness Products",
      "Context Memory"
    ],
    "version": "2.0.0"
  }
}
```

**Field Descriptions**:
- `name`: AI service name
- `capabilities`: Array of AI capabilities
- `version`: Current version of the AI service

**cURL Example**:
```bash
curl -X GET "http://localhost:5000/api/ai-doctor/info"
```

**Use Case**: Display AI capabilities to users before they start chatting.

---

## Frontend Integration Examples

### React Component - AI Chatbot

```jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const AIChatbot = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [aiInfo, setAiInfo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate unique session ID on component mount
    const newSessionId = `session-${uuidv4()}`;
    setSessionId(newSessionId);
    
    // Fetch AI info
    fetchAIInfo();
    
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m your AI Doctor assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
        isAI: true
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAIInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai-doctor/info');
      if (response.data.success) {
        setAiInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching AI info:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      isAI: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai-doctor/chat',
        {
          message: inputMessage,
          sessionId: sessionId,
          userId: userId || null
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.message,
          recommendations: response.data.data.recommendations,
          timestamp: response.data.data.timestamp,
          isAI: true
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isAI: true,
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = (recommendation) => {
    if (recommendation.type === 'doctor') {
      // Navigate to doctor booking page
      window.location.href = `/book-appointment/${recommendation.data._id}`;
    } else if (recommendation.type === 'product') {
      // Navigate to product page
      window.location.href = `/products/${recommendation.data._id}`;
    }
  };

  return (
    <div className="ai-chatbot">
      <div className="chatbot-header">
        <h2>🩺 AI Doctor</h2>
        {aiInfo && (
          <p className="ai-version">v{aiInfo.version}</p>
        )}
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isAI ? 'ai-message' : 'user-message'} ${msg.isError ? 'error-message' : ''}`}
          >
            <div className="message-content">
              <p>{msg.content}</p>
              
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  {msg.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="recommendation-card"
                      onClick={() => handleRecommendationClick(rec)}
                    >
                      {rec.type === 'doctor' && (
                        <>
                          <h5>{rec.data.name}</h5>
                          <p>{rec.data.specialization}</p>
                          <p>{rec.data.qualification}</p>
                          <p>Fee: ₹{rec.data.fee}</p>
                          <button>Book Appointment</button>
                        </>
                      )}
                      
                      {rec.type === 'product' && (
                        <>
                          <h5>{rec.data.productName}</h5>
                          <p>{rec.data.brandName}</p>
                          <p>{rec.data.description}</p>
                          <p>Price: ₹{rec.data.price}</p>
                          <button>View Product</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        
        {loading && (
          <div className="message ai-message typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your health question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !inputMessage.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="chatbot-disclaimer">
        <small>
          ⚠️ This AI is not a substitute for professional medical advice.
          Always consult a real doctor for serious health concerns.
        </small>
      </div>
    </div>
  );
};

export default AIChatbot;
```

### React Component - Floating Chat Button

```jsx
import React, { useState } from 'react';
import AIChatbot from './AIChatbot';

const FloatingChatButton = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="floating-chat-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Doctor Chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="floating-chat-window">
          <AIChatbot userId={userId} />
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
```

### React Component - AI Health Check

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAIHealth();
  }, []);

  const checkAIHealth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ai-doctor/health');
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Error checking AI health:', error);
      setHealthStatus({ status: 'inactive', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Checking AI status...</div>;

  return (
    <div className="ai-health-status">
      <span className={`status-indicator ${healthStatus.status}`}>
        {healthStatus.status === 'active' ? '🟢' : '🔴'}
      </span>
      <span>AI Doctor: {healthStatus.status}</span>
    </div>
  );
};

export default AIHealthCheck;
```

---

## Complete Workflow Example

### Scenario: User Chats with AI Doctor

```javascript
import { v4 as uuidv4 } from 'uuid';

// Step 1: Check AI service health
const checkAIHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/ai-doctor/health');
    console.log('AI Status:', response.data.status);
    return response.data.status === 'active';
  } catch (error) {
    console.error('AI service unavailable:', error);
    return false;
  }
};

// Step 2: Get AI information
const getAIInfo = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/ai-doctor/info');
    console.log('AI Capabilities:', response.data.data.capabilities);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching AI info:', error);
    return null;
  }
};

// Step 3: Start a new chat session
const startChatSession = () => {
  const sessionId = `session-${uuidv4()}`;
  console.log('New session started:', sessionId);
  return sessionId;
};

// Step 4: Send message to AI
const sendMessageToAI = async (message, sessionId, userId = null) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/ai-doctor/chat',
      {
        message: message,
        sessionId: sessionId,
        userId: userId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return {
        message: response.data.data.message,
        recommendations: response.data.data.recommendations,
        timestamp: response.data.data.timestamp
      };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Step 5: Handle recommendations
const handleRecommendation = (recommendation) => {
  if (recommendation.type === 'doctor') {
    console.log('Doctor recommended:', recommendation.data.name);
    // Navigate to booking page
    window.location.href = `/book-appointment/${recommendation.data._id}`;
  } else if (recommendation.type === 'product') {
    console.log('Product recommended:', recommendation.data.productName);
    // Navigate to product page
    window.location.href = `/products/${recommendation.data._id}`;
  }
};

// Complete workflow
const aiChatWorkflow = async () => {
  try {
    // 1. Check if AI is available
    const isAvailable = await checkAIHealth();
    if (!isAvailable) {
      console.log('AI service is not available');
      return;
    }

    // 2. Get AI information
    const aiInfo = await getAIInfo();
    console.log('AI Info:', aiInfo);

    // 3. Start new session
    const sessionId = startChatSession();

    // 4. Send first message
    const response1 = await sendMessageToAI(
      'I have a headache and fever',
      sessionId,
      'user123'
    );
    console.log('AI Response 1:', response1.message);

    // 5. Send follow-up message (same session)
    const response2 = await sendMessageToAI(
      'Can you recommend a doctor?',
      sessionId,
      'user123'
    );
    console.log('AI Response 2:', response2.message);

    // 6. Handle recommendations
    if (response2.recommendations && response2.recommendations.length > 0) {
      response2.recommendations.forEach(rec => {
        handleRecommendation(rec);
      });
    }

  } catch (error) {
    console.error('Error in AI chat workflow:', error);
  }
};
```

---

## Summary

### User-Side Endpoints (3 APIs)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/ai-doctor/chat` | POST | Public | Send message and get AI response |
| `/api/ai-doctor/health` | GET | Public | Check AI service health status |
| `/api/ai-doctor/info` | GET | Public | Get AI capabilities and version |

### Key Features
- 🤖 **AI-Powered**: LangChain agent with medical knowledge
- 💬 **Conversational**: Maintains context across messages
- 🩺 **Medical Guidance**: Provides general health advice
- 👨‍⚕️ **Doctor Search**: Recommends specialists based on symptoms
- 💊 **Product Recommendations**: Suggests OTC and wellness products
- 🔒 **Session-Based**: Uses session IDs for conversation memory
- 📱 **User Tracking**: Optional user ID for logged-in users
- ⚠️ **Safety First**: Always advises consulting real doctors

### AI Capabilities
1. **Medical Guidance**: General health information and advice
2. **Find Doctors**: Search and recommend doctors by specialization
3. **Find Wellness Products**: Recommend OTC items and wellness products
4. **Context Memory**: Remembers conversation history within a session

### Recommendation Types
- **doctor**: Doctor recommendations with booking capability
  - Includes: name, specialization, qualification, experience, fee, contact
- **product**: Product recommendations with purchase links
  - Includes: productName, brandName, category, price, description

### Session Management
- Generate unique `sessionId` for each new conversation (use UUID)
- Use the same `sessionId` for follow-up questions
- Session maintains conversation context and history
- Create new `sessionId` when starting a fresh conversation

### Best Practices
1. **Session IDs**: Always generate unique session IDs (UUID recommended)
2. **Error Handling**: Gracefully handle AI service errors
3. **Health Check**: Check service availability before starting chat
4. **User Experience**: Show typing indicators while waiting for response
5. **Recommendations**: Make recommendations clickable for easy navigation
6. **Disclaimer**: Always display medical disclaimer to users
7. **Conversation History**: Store messages locally for better UX
8. **Auto-scroll**: Scroll to latest message automatically

### Integration Tips
```javascript
// Generate session ID
import { v4 as uuidv4 } from 'uuid';
const sessionId = `session-${uuidv4()}`;

// Or use timestamp-based
const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Store session in localStorage for persistence
localStorage.setItem('aiChatSessionId', sessionId);

// Retrieve session
const existingSession = localStorage.getItem('aiChatSessionId');
```

### Example Use Cases
1. **Symptom Checker**: "I have a fever and cough, what should I do?"
2. **Doctor Finder**: "I need a cardiologist in Mumbai"
3. **Product Recommendations**: "What can I take for a headache?"
4. **Health Advice**: "How can I improve my sleep quality?"
5. **Follow-up Questions**: "What about side effects?" (in same session)

### Important Notes
- ⚠️ **Medical Disclaimer**: AI is NOT a substitute for professional medical advice
- 🔒 **Privacy**: User messages are stored with session ID for context
- 🚀 **Performance**: Responses typically take 2-5 seconds
- 📊 **Tracking**: Optional userId helps track user interactions
- 🔄 **Context**: AI remembers previous messages in the same session
- ⏱️ **Timeout**: Consider implementing request timeout (30 seconds recommended)

### Error Handling
```javascript
try {
  const response = await sendMessageToAI(message, sessionId, userId);
  // Handle success
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error (empty message, missing sessionId)
    console.error('Invalid request:', error.response.data.message);
  } else if (error.response?.status === 500) {
    // AI service error
    console.error('AI service error:', error.response.data.message);
  } else {
    // Network or other errors
    console.error('Network error:', error.message);
  }
  
  // Show user-friendly error message
  showErrorMessage('Sorry, I encountered an error. Please try again.');
}
```

---

**Last Updated**: January 2026
**Version**: 2.0.0 (Agent-Enabled)
