import { NextRequest, NextResponse } from 'next/server'
import { requirePro } from '@/lib/auth-middleware'
import { AuthenticatedUser } from '@/lib/types'

// GET: Fetch Demographics Analytics data (best-in-class)
export const GET = requirePro(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Best-in-Class: Mock demographics data representing institutional-grade analytics
    const mockDemographicsData = {
      country: [
        { name: 'United States', users: 5500 },
        { name: 'Canada', users: 2100 },
        { name: 'United Kingdom', users: 1800 },
        { name: 'Australia', users: 1200 },
        { name: 'Germany', users: 800 },
      ],
      device: [
        { name: 'Desktop', users: 8500 },
        { name: 'Mobile', users: 6000 },
        { name: 'Tablet', users: 900 },
      ],
      age: [
        { range: '18-24', users: 3000 },
        { range: '25-34', users: 5500 },
        { range: '35-44', users: 4000 },
        { range: '45-54', users: 1500 },
        { range: '55+', users: 400 },
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockDemographicsData
    })
  } catch (error) {
    console.error('Get demographics analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve demographics analytics' },
      { status: 500 }
    )
  }
})

