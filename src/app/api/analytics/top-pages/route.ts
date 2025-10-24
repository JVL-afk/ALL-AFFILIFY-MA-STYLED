import { NextRequest, NextResponse } from 'next/server'
import { requirePro } from '@/lib/auth-middleware'
import { AuthenticatedUser } from '@/lib/types'

// GET: Fetch Top Pages Analytics data (best-in-class)
export const GET = requirePro(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Best-in-Class: Mock top pages data representing institutional-grade analytics
    const mockTopPagesData = [
      { path: '/', title: 'Homepage', views: 15000, conversions: 120 },
      { path: '/blog/best-laptops-for-affiliate', title: 'Best Laptops for Affiliate Marketing', views: 8500, conversions: 80 },
      { path: '/product/review-x', title: 'Product Review X', views: 6200, conversions: 150 },
      { path: '/pricing', title: 'Pricing Page', views: 4100, conversions: 20 },
      { path: '/contact', title: 'Contact Us', views: 2800, conversions: 5 },
    ]

    return NextResponse.json({
      success: true,
      data: mockTopPagesData
    })
  } catch (error) {
    console.error('Get top pages analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve top pages analytics' },
      { status: 500 }
    )
  }
})

