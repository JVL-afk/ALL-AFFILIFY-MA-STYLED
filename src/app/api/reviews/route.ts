import { NextRequest, NextResponse } from 'next/server'
import { requireEnterprise } from '@/lib/auth-middleware'
import { AuthenticatedUser } from '@/lib/types'

export const GET = requireEnterprise(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Mock reviews data for now
    const reviews = [
      {
        id: '1',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        rating: 5,
        title: 'Amazing product!',
        content: 'This product exceeded my expectations. Highly recommended!',
        productId: 'prod1',
        productName: 'Sample Product',
        websiteId: 'web1',
        websiteName: 'My Website',
        status: 'approved',
        isVisible: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'manual',
        metadata: {
          verified: true,
          helpfulVotes: 5,
          reportedCount: 0
        }
      }
    ]

    return NextResponse.json({
      success: true,
      reviews
    })
  } catch (error) {
    console.error('Reviews API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = requireEnterprise(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    const body = await request.json()
    const { customerName, customerEmail, rating, title, content, productId, websiteId } = body

    // Validate required fields
    if (!customerName || !rating || !content || !productId || !websiteId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new review (mock implementation)
    const newReview = {
      id: Date.now().toString(),
      customerName,
      customerEmail: customerEmail || '',
      rating,
      title: title || '',
      content,
      productId,
      productName: 'Product Name',
      websiteId,
      websiteName: 'Website Name',
      status: 'pending',
      isVisible: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'manual',
      metadata: {
        verified: false,
        helpfulVotes: 0,
        reportedCount: 0
      }
    }

    return NextResponse.json({
      success: true,
      review: newReview,
      message: 'Review created successfully'
    })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

