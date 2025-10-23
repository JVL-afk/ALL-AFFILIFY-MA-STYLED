'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Zap,
  LayoutDashboard,
  Plus,
  Globe,
  BarChart3,
  Settings,
  CreditCard,
  Users,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Crown,
  Sparkles,
  Bot,
  Mail,
  Key,
  Plug,
  FileText,
  TestTube,
  Star
} from 'lucide-react'
import { FEATURE_ACCESS_MAP, PlanType } from '@/lib/plan-middleware'

interface User {
  id: string
  name: string
  email: string
  plan: 'basic' | 'pro' | 'enterprise'
  websitesCreated: number
  websiteLimit: number
  analysesUsed: number
  analysisLimit: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Redirect to login if not authenticated
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('user')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Define the navigation items with plan requirements
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'Create Website',
      href: user ? `/dashboard/create-website/${user.plan}` : '/dashboard/create-website/basic',
      icon: Plus,
      current: pathname?.includes('/dashboard/create-website'),
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'My Websites',
      href: '/dashboard/my-websites',
      icon: Globe,
      current: pathname === '/dashboard/my-websites',
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'Analyze Website',
      href: '/dashboard/analyze-website',
      icon: BarChart3,
      current: pathname === '/dashboard/analyze-website',
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'A/B Testing',
      href: '/dashboard/ab-testing',
      icon: TestTube,
      current: pathname === '/dashboard/ab-testing',
      requiredPlan: 'enterprise' as PlanType
    },
    {
      name: 'Reviews',
      href: '/dashboard/reviews',
      icon: Star,
      current: pathname === '/dashboard/reviews',
      requiredPlan: 'enterprise' as PlanType
    }
  ]

  const proEnterpriseNavigation = [
    {
      name: 'Advanced Analytics',
      href: '/dashboard/advanced-analytics',
      icon: BarChart3,
      current: pathname === '/dashboard/advanced-analytics',
      requiredPlan: 'pro' as PlanType
    },
    {
      name: 'AI Chatbot',
      href: '/dashboard/ai-chatbot',
      icon: Bot,
      current: pathname === '/dashboard/ai-chatbot',
      requiredPlan: 'pro' as PlanType
    },
    {
      name: 'Email Marketing',
      href: '/dashboard/email-marketing',
      icon: Mail,
      current: pathname === '/dashboard/email-marketing',
      requiredPlan: 'pro' as PlanType
    },
    {
      name: 'Custom Integrations',
      href: '/dashboard/custom-integrations',
      icon: Plug,
      current: pathname === '/dashboard/custom-integrations',
      requiredPlan: 'pro' as PlanType
    }
  ]

  const enterpriseNavigation = [
    {
      name: 'Team Collaboration',
      href: '/dashboard/team-collaboration',
      icon: Users,
      current: pathname === '/dashboard/team-collaboration',
      requiredPlan: 'enterprise' as PlanType
    },
    {
      name: 'API Management',
      href: '/dashboard/api-management',
      icon: Key,
      current: pathname === '/dashboard/api-management',
      requiredPlan: 'enterprise' as PlanType
    },
    {
      name: 'Advanced Reporting',
      href: '/dashboard/advanced-reporting',
      icon: FileText,
      current: pathname === '/dashboard/advanced-reporting',
      requiredPlan: 'enterprise' as PlanType
    }
  ]

  const secondaryNavigation = [
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      requiredPlan: 'basic' as PlanType
    },
    {
      name: 'Help',
      href: '/dashboard/help',
      icon: HelpCircle,
      requiredPlan: 'basic' as PlanType
    }
  ]

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      case 'pro':
        return 'bg-purple-100 text-purple-800'
      case 'enterprise':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Crown className="w-3 h-3" />
      case 'enterprise':
        return <Sparkles className="w-3 h-3" />
      default:
        return null
    }
  }

  // Define plan hierarchy for comparison
  const planHierarchy = {
    'basic': 1,
    'pro': 2,
    'enterprise': 3
  }

  // Check if user can access a feature based on their plan
  const canAccessFeature = (userPlan: PlanType, requiredPlan: PlanType): boolean => {
    return planHierarchy[userPlan] >= planHierarchy[requiredPlan]; // Original logic
  }

  // Get the upgrade URL based on current plan
  const getUpgradeUrl = (currentPlan: PlanType, featurePlan: PlanType): string => {
    return `/pricing?upgrade=${featurePlan}&from=${currentPlan}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white/10 backdrop-blur-lg border-r border-white/20">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AFFILIFY</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6 px-4">
            <div className={`
              py-1.5 px-3 rounded-full text-sm font-medium text-center
              ${user.plan === 'basic' ? 'bg-blue-600/20 text-blue-300' : 
                user.plan === 'pro' ? 'bg-purple-600/20 text-purple-300' : 
                'bg-orange-600/20 text-orange-300'}
            `}>
              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const canAccess = canAccessFeature(user.plan as PlanType, item.requiredPlan);
              return (
                <Link
                  key={item.name}
                  href={canAccess ? item.href : getUpgradeUrl(user.plan as PlanType, item.requiredPlan)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    ${item.current
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    ${!canAccess ? 'opacity-50' : ''}
                    transition-colors
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {!canAccess && (
                    <Crown className="ml-auto h-4 w-4 text-yellow-400" />
                  )}
                </Link>
              );
            })}
            
            {/* Pro & Enterprise Features */}
            {(user.plan === 'pro' || user.plan === 'enterprise') && (
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Pro Features
                </div>
                {proEnterpriseNavigation.map((item) => {
                  const canAccess = canAccessFeature(user.plan as PlanType, item.requiredPlan);
                  return (
                    <Link
                      key={item.name}
                      href={canAccess ? item.href : getUpgradeUrl(user.plan as PlanType, item.requiredPlan)}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        ${item.current
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                        ${!canAccess ? 'opacity-50' : ''}
                        transition-colors
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      {!canAccess && (
                        <Crown className="ml-auto h-4 w-4 text-yellow-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Enterprise Features */}
            {user.plan === 'enterprise' && (
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Enterprise Features
                </div>
                {enterpriseNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      ${item.current
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                      transition-colors
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-white/20">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                  ${user.plan === 'basic' ? 'bg-blue-600/20 text-blue-300' : 
                    user.plan === 'pro' ? 'bg-purple-600/20 text-purple-300' : 
                    'bg-orange-600/20 text-orange-300'}
                `}>
                  {getPlanIcon(user.plan)}
                  <span>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/10 backdrop-blur-lg border-r border-white/20">
          <div className="flex h-16 items-center px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AFFILIFY</span>
            </Link>
          </div>
          
          <div className="mb-6 px-4">
            <div className={`
              py-1.5 px-3 rounded-full text-sm font-medium text-center
              ${user.plan === 'basic' ? 'bg-blue-600/20 text-blue-300' : 
                user.plan === 'pro' ? 'bg-purple-600/20 text-purple-300' : 
                'bg-orange-600/20 text-orange-300'}
            `}>
              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const canAccess = canAccessFeature(user.plan as PlanType, item.requiredPlan);
              return (
                <Link
                  key={item.name}
                  href={canAccess ? item.href : getUpgradeUrl(user.plan as PlanType, item.requiredPlan)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    ${item.current
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                    ${!canAccess ? 'opacity-50' : ''}
                    transition-colors
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {!canAccess && (
                    <Crown className="ml-auto h-4 w-4 text-yellow-400" />
                  )}
                </Link>
              );
            })}
            
            {/* Pro & Enterprise Features */}
            {(user.plan === 'pro' || user.plan === 'enterprise') && (
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Pro Features
                </div>
                {proEnterpriseNavigation.map((item) => {
                  const canAccess = canAccessFeature(user.plan as PlanType, item.requiredPlan);
                  return (
                    <Link
                      key={item.name}
                      href={canAccess ? item.href : getUpgradeUrl(user.plan as PlanType, item.requiredPlan)}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        ${item.current
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                        ${!canAccess ? 'opacity-50' : ''}
                        transition-colors
                      `}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      {!canAccess && (
                        <Crown className="ml-auto h-4 w-4 text-yellow-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Enterprise Features */}
            {user.plan === 'enterprise' && (
              <div className="pt-4 mt-4 border-t border-white/20">
                <div className="px-3 py-2 text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Enterprise Features
                </div>
                {enterpriseNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      ${item.current
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                      transition-colors
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="pt-6 mt-6 border-t border-white/20">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                  ${user.plan === 'basic' ? 'bg-blue-600/20 text-blue-300' : 
                    user.plan === 'pro' ? 'bg-purple-600/20 text-purple-300' : 
                    'bg-orange-600/20 text-orange-300'}
                `}>
                  {getPlanIcon(user.plan)}
                  <span>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-white/10 backdrop-blur-lg border-b border-white/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-white/70 hover:text-white focus:outline-none lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-white">
                {navigation.find(item => item.current)?.name || 
                 proEnterpriseNavigation.find(item => item.current)?.name || 
                 enterpriseNavigation.find(item => item.current)?.name || 
                 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Usage indicators */}
              <div className="hidden sm:flex items-center space-x-4 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{user.websitesCreated}/{user.websiteLimit === -1 ? '∞' : user.websiteLimit}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{user.analysesUsed}/{user.analysisLimit === -1 ? '∞' : user.analysisLimit}</span>
                </div>
              </div>
              
              {user.plan !== 'enterprise' && (
                <Link href={`/pricing?from=${user.plan}`}>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white border-none">
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
