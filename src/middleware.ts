import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple plan types
type PlanType = 'basic' | 'pro' | 'enterprise';

// Define feature access map
const FEATURE_ACCESS_MAP: Record<string, PlanType[]> = {
  // Basic plan features
  'dashboard/create-website/basic': ['basic', 'pro', 'enterprise'],
  'dashboard/my-websites': ['basic', 'pro', 'enterprise'],
  'dashboard/basic': ['basic', 'pro', 'enterprise'],
  'dashboard/analyze-website': ['basic', 'pro', 'enterprise'],
  
  // Pro plan features
  'dashboard/advanced-analytics': ['pro', 'enterprise'],
  'dashboard/custom-integrations': ['pro', 'enterprise'],
  'dashboard/email-marketing': ['pro', 'enterprise'],
  'dashboard/create-website/pro': ['pro', 'enterprise'],
  'dashboard/pro': ['pro', 'enterprise'],
  'dashboard/ai-chatbot': ['pro', 'enterprise'],
  
  // Enterprise plan features
  'dashboard/advanced-reporting': ['enterprise'],
  'dashboard/reviews': ['enterprise'],
  'dashboard/ab-testing': ['enterprise'],
  'dashboard/api-management': ['enterprise'],
  'dashboard/team-collaboration': ['enterprise'],
  'dashboard/create-website/enterprise': ['enterprise'],
  'dashboard/enterprise': ['enterprise']
};

// Simple token parsing function that works in Edge Runtime
function parseToken(token: string): { userId: string; plan: PlanType } | null {
  try {
    // Base64 decode the token payload
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    if (!decoded.userId) return null;
    
    // For middleware, we'll use a simplified approach where we extract the plan from the token
    // In a real app, this would be verified against the database in API routes
    const plan = decoded.plan || 'basic';
    
    return { 
      userId: decoded.userId,
      plan: plan as PlanType
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

// Helper function to extract token from request
function getTokenFromRequest(request: NextRequest): string | null {
  // Check cookies first
  const tokenFromCookie = request.cookies.get('token')?.value || 
                          request.cookies.get('auth-token')?.value || 
                          request.cookies.get('authToken')?.value || 
                          request.cookies.get('jwt')?.value;
  
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Helper function to check if user can access a feature based on their plan
function canAccessFeature(userPlan: PlanType, featurePath: string): boolean {
  // Extract the feature path from the URL
  const path = featurePath.split('/').slice(1).join('/');
  
  // Find the matching feature in the access map
  for (const [feature, allowedPlans] of Object.entries(FEATURE_ACCESS_MAP)) {
    if (path.includes(feature) && !allowedPlans.includes(userPlan)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to determine which plan is needed for a feature
function getNeededPlanForFeature(featurePath: string): PlanType {
  const path = featurePath.split('/').slice(1).join('/');
  
  // Check if it's an enterprise feature
  for (const [feature, allowedPlans] of Object.entries(FEATURE_ACCESS_MAP)) {
    if (path.includes(feature) && allowedPlans.includes('enterprise') && allowedPlans.length === 1) {
      return 'enterprise';
    }
  }
  
  // Check if it's a pro feature
  for (const [feature, allowedPlans] of Object.entries(FEATURE_ACCESS_MAP)) {
    if (path.includes(feature) && allowedPlans.includes('pro') && !allowedPlans.includes('basic')) {
      return 'pro';
    }
  }
  
  return 'basic';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for non-dashboard routes, API routes, and static assets
  if (
    !pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api') ||
    pathname.includes('/_next') ||
    pathname.includes('/static') ||
    pathname.includes('/images') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Get token from request
  const token = getTokenFromRequest(request);
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
  }
  
  // Parse token to get user info
  const userInfo = parseToken(token);
  if (!userInfo) {
    // Redirect to login if token is invalid
    return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
  }
  
  // // Check if user can access the feature (Temporarily disabled for testing)
  // const canAccess = canAccessFeature(userInfo.plan, pathname);
  // if (!canAccess) {
  //   // Determine which plan is needed for this feature
  //   const neededPlan = getNeededPlanForFeature(pathname);
    
  //   // Redirect to pricing page with upgrade info
  //   return NextResponse.redirect(
  //     new URL(`/pricing?upgrade=${neededPlan}&from=${userInfo.plan}&feature=${encodeURIComponent(pathname)}`, request.url)
  //   );
  // }
  
  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
