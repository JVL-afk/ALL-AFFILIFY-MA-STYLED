import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth'
import { validateEmail } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password, planId } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get user
    const user = await getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(user.id)

    // Define Stripe links
    const STRIPE_LINKS: Record<string, string> = {
      pro: 'https://buy.stripe.com/aFa5kD1kNaRpe991lP8IU00',
      enterprise: 'https://buy.stripe.com/28EcN56F7cZx1mn7Kd8IU01',
    }

    // Check for upgrade intent and redirect if necessary
    if (planId && STRIPE_LINKS[planId]) {
      const redirectResponse = NextResponse.redirect(STRIPE_LINKS[planId], 302)
      redirectResponse.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return redirectResponse
    }

    // Generate a fresh token for the response
    const token = generateToken(user.id)

    // If no upgrade, create a standard success response
    const successResponse = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        websitesCreated: user.websitesCreated,
        websiteLimit: user.websiteLimit,
        analysesUsed: user.analysesUsed,
        analysisLimit: user.analysisLimit,
      },
    })

    // Set auth cookie on the success response
    successResponse.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return successResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

