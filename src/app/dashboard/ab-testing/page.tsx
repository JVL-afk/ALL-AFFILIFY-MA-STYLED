'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TestTube, 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer,
  Eye,
  Target,
  Crown,
  Sparkles,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Type,
  Layout,
  Palette,
  Image,
  Globe
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  description: string
  websiteId: string
  websiteName: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  type: 'headline' | 'cta' | 'layout' | 'color' | 'image' | 'full-page'
  variants: {
    id: string
    name: string
    description: string
    traffic: number // percentage
    conversions: number
    visitors: number
    conversionRate: number
    isControl: boolean
  }[]
  metrics: {
    primaryGoal: 'clicks' | 'conversions' | 'revenue' | 'signups'
    confidenceLevel: number
    statisticalSignificance: boolean
    winner?: string
  }
  schedule: {
    startDate: string
    endDate?: string
    duration: number // days
  }
  createdAt: string
  updatedAt: string
}

interface ABTestStats {
  totalTests: number
  runningTests: number
  completedTests: number
  totalVisitors: number
  averageUplift: number
  significantWins: number
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [stats, setStats] = useState<ABTestStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Temporarily remove Enterprise plan restriction for testing
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false)

  useEffect(() => {
checkEnterpriseAccess()
    if (hasEnterpriseAccess) {
      loadTests()
      loadStats()
    }
  }, [])

  const checkEnterpriseAccess = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setHasEnterpriseAccess(data.user.plan === 'enterprise')
      }
    } catch (error) {
      console.error('Error checking access:', error)
    }
  }

  const loadTests = async () => {
    try {
      const response = await fetch('/api/ab-tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests)
      }
    } catch (error) {
      console.error('Error loading tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/ab-tests/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const startTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/start`, {
        method: 'POST'
      })

      if (response.ok) {
        setSuccess('A/B test started successfully')
        await loadTests()
        await loadStats()
      }
    } catch (error) {
      setError('Failed to start test')
    }
  }

  const pauseTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/pause`, {
        method: 'POST'
      })

      if (response.ok) {
        setSuccess('A/B test paused')
        await loadTests()
      }
    } catch (error) {
      setError('Failed to pause test')
    }
  }

  const completeTest = async (testId: string, winnerId: string) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId })
      })

      if (response.ok) {
        setSuccess('A/B test completed and winner applied')
        await loadTests()
        await loadStats()
      }
    } catch (error) {
      setError('Failed to complete test')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 text-gray-800'
      default:
        return 'bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4" />
      case 'paused':
        return <Pause className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'draft':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'headline':
        return <Type className="w-4 h-4" />
      case 'cta':
        return <MousePointer className="w-4 h-4" />
      case 'layout':
        return <Layout className="w-4 h-4" />
      case 'color':
        return <Palette className="w-4 h-4" />
      case 'image':
        return <Image className="w-4 h-4" />
      case 'full-page':
        return <Globe className="w-4 h-4" />
      default:
        return <TestTube className="w-4 h-4" />
    }
  }

  // Enterprise access gate
  if (!hasEnterpriseAccess) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <TestTube className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Feature</h1>
          <p className="text-gray-600 mb-6">
            A/B Testing is available exclusively for Enterprise plan users. 
            Upgrade your plan to access advanced split testing, statistical analysis, and conversion optimization features.
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Enterprise A/B Testing Features:</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Advanced split testing engine</li>
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Statistical significance analysis</li>
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Multiple variant testing</li>
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Real-time performance monitoring</li>
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Automated winner selection</li>
              <li className="flex items-center"><Sparkles className="w-4 h-4 mr-2 text-purple-600" /> Conversion funnel optimization</li>
            </ul>
          </div>
          <a href="/pricing?upgrade=enterprise&feature=A/B Testing" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-10 py-2 px-4">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Enterprise
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-gray-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Crown className="w-3 h-3 mr-1" />
              Enterprise
            </div>
          </div>
          <p className="text-gray-600">Optimize your websites with data-driven split testing</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.runningTests} running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.significantWins} significant wins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisitors?.toLocaleString() || "0"}</div>
              <p className="text-xs text-muted-foreground">
                Across all tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Uplift</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{(stats?.averageUplift?.toFixed(1) || "0.0")}%</div>
              <p className="text-xs text-muted-foreground">
                Conversion improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.completedTests > 0 ? ((stats?.significantWins / stats?.completedTests) * 100)?.toFixed(1) : '0') || '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                Significant results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.runningTests}</div>
              <p className="text-xs text-muted-foreground">
                Active tests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{test.name}</h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                      <span>{test.status}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{test.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {getTypeIcon(test.type)}
                      {test.type.charAt(0).toUpperCase() + test.type.slice(1)} Test
                    </span>
                    <span>Website: {test.websiteName}</span>
                    <span>Goal: {test.metrics.primaryGoal}</span>
                    <span>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {test.schedule.duration} days
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {test.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => startTest(test.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  {test.status === 'running' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => pauseTest(test.id)}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                      {test.metrics.statisticalSignificance && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            const winner = test.variants.reduce((prev, current) => 
                              prev.conversionRate > current.conversionRate ? prev : current
                            )
                            completeTest(test.id, winner.id)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTest(test)}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View Results
                  </Button>
                </div>
              </div>

              {/* Variants Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {test.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-4 rounded-lg border-2 ${
                      test.metrics.winner === variant.id
                        ? 'border-green-500 bg-green-50'
                        : variant.isControl
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gradient-to-br from-orange-900 via-orange-800 to-red-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {variant.name}
                        {variant.isControl && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Control
                          </span>
                        )}
                        {test.metrics.winner === variant.id && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Winner
                          </span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500">{variant.traffic}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Visitors:</span>
                        <span className="font-medium">{variant.visitors?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conversions:</span>
                        <span className="font-medium">{variant.conversions?.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conv. Rate:</span>
                        <span className="font-medium">{(variant?.conversionRate?.toFixed(2) || "0.00")}%</span>
                      </div>
                      
                      {!variant.isControl && (
                        <div className="flex justify-between text-sm">
                          <span>Uplift:</span>
                          <span className={`font-medium ${
                            variant.conversionRate > test.variants.find(v => v.isControl)!.conversionRate
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {(((variant?.conversionRate || 0) / (test?.variants?.find(v => v.isControl)?.conversionRate || 1) - 1) * 100)?.toFixed(1) || "0.0"}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistical Significance */}
              {test.status === 'running' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Statistical Significance: {test.metrics.confidenceLevel}%
                      </span>
                    </div>
                    {test.metrics.statisticalSignificance ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Significant
                      </span>
                    ) : (
                      <span className="text-xs bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 text-gray-800 px-2 py-1 rounded-full">
                        Need more data
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No A/B tests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start optimizing your websites with data-driven split testing.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Test
            </Button>
          </div>
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create A/B Test</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test Name</label>
                <Input placeholder="e.g., Homepage Headline Test" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input placeholder="Brief description of what you're testing" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Test Type</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="headline">Headline Test</option>
                  <option value="cta">Call-to-Action Test</option>
                  <option value="layout">Layout Test</option>
                  <option value="color">Color Test</option>
                  <option value="image">Image Test</option>
                  <option value="full-page">Full Page Test</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Primary Goal</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="clicks">Clicks</option>
                  <option value="conversions">Conversions</option>
                  <option value="revenue">Revenue</option>
                  <option value="signups">Sign-ups</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Test Duration (days)</label>
                <Input type="number" placeholder="14" min="1" max="90" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Variants</h3>
                <p className="text-sm text-blue-700 mb-3">
                  You'll be able to configure your test variants after creating the test.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Control (Original)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span>Variant A (New Version)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false)
                  setSuccess('A/B test created successfully! You can now configure variants and start testing.')
                }}
                className="flex-1"
              >
                Create Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            {success}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess('')}
              className="ml-2 p-1"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="ml-2 p-1"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

