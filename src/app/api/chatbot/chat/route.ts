import { NextRequest, NextResponse } from 'next/server'
import { requirePro } from '@/lib/auth-middleware' // Use the correct middleware path
import { GoogleGenAI } from '@google/genai'
import { AuthenticatedUser } from '@/lib/types'

// Initialize Google Gen AI client
// The API key is expected to be in the environment variables (GEMINI_API_KEY)
const ai = new GoogleGenAI({})

// Best-in-Class: Fine-tuned for affiliate marketing, SEO, and CRO
const SYSTEM_INSTRUCTION = `You are AFFILIFY AI, an expert affiliate marketing strategist. Your role is to provide institutional-grade, actionable advice on SEO, conversion rate optimization (CRO), and affiliate strategy.
- Be concise, professional, and data-driven.
- Always ask clarifying questions if the user's request is vague.
- Do not mention that you are an AI model. Act as a senior marketing consultant.`

// POST: Send a message to the AI Chatbot
export const POST = requirePro(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      )
    }

    // Best-in-class implementation using Gemini for a conversational, context-aware chat
    const chat = ai.chats.create({
      model: 'gemini-2.5-pro', // Upgraded to Pro for best-in-class results as requested
      history: history || [],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    })

    const response = await chat.sendMessage({ message })
    
    // In a real implementation, you would save the history to MongoDB here
    
    return NextResponse.json({
      success: true,
      response: response.text
    })

  } catch (error) {
    console.error('AI Chatbot API Error:', error)
    // Best-in-Class Error Handling: Return a professional, non-technical error message
    return NextResponse.json(
      { error: 'An institutional-grade error occurred. Please try again or contact support.' },
      { status: 500 }
    )
  }
})

