// PLAN ENFORCEMENT SYSTEM - REAL RESTRICTIONS
import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// Plan definitions with real limits
export const PLAN_LIMITS = {
  basic: {
    websites: 3,
    analytics: false,
    emailMarketing: false,
    aiChatbot: false,
    teamCollaboration: false,
    apiAccess: false,
    customIntegrations: false,
    advancedReporting: false,
    priority: 'low'
  },
  pro: {
    websites: 10,
    analytics: true,
    emailMarketing: true,
    aiChatbot: false,
    teamCollaboration: false,
    apiAccess: true,
    customIntegrations: false,
    advancedReporting: true,
    priority: 'medium'
  },
  enterprise: {
    websites: 999,
    analytics: true,
    emailMarketing: true,
    aiChatbot: true,
    teamCollaboration: true,
    apiAccess: true,
    customIntegrations: true,
    advancedReporting: true,
    priority: 'high'
  }
};

export interface UserPlan {
  _id: ObjectId;
  email: string;
  plan: 'basic' | 'pro' | 'enterprise';
  websiteCount: number;
  planUpdatedAt?: Date;
  stripeCustomerId?: string;
}

// Get user plan and limits
export async function getUserPlan(userId: string): Promise<UserPlan | null> {
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      plan: user.plan || 'basic',
      websiteCount: user.websiteCount || 0,
      planUpdatedAt: user.planUpdatedAt,
      stripeCustomerId: user.stripeCustomerId
    };
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return null;
  }
}

// Check if user can create more websites
export function canCreateWebsite(user: UserPlan): { allowed: boolean; message?: string; upgradeRequired?: boolean } {
  const limits = PLAN_LIMITS[user.plan];
  
  if (user.websiteCount >= limits.websites) {
    return {
      allowed: false,
      message: `Your ${user.plan} plan allows ${limits.websites} websites. You have created ${user.websiteCount}. Upgrade to create more.`,
      upgradeRequired: true
    };
  }

  return { allowed: true };
}

// Check if user can access a feature
export function canAccessFeature(user: UserPlan, feature: keyof typeof PLAN_LIMITS.basic): { allowed: boolean; message?: string; upgradeRequired?: boolean } {
  const limits = PLAN_LIMITS[user.plan];
  
  if (feature === 'websites') {
    return canCreateWebsite(user);
  }

  if (!limits[feature]) {
    const requiredPlan = PLAN_LIMITS.enterprise[feature as keyof typeof PLAN_LIMITS.basic] ? 'Enterprise' : 'Pro';
      
    return {
      allowed: false,
      message: `${feature.replace(/([A-Z])/g, ' $1').toLowerCase()} is available in ${requiredPlan} plan. Upgrade to access this feature.`,
      upgradeRequired: true
    };
  }

  return { allowed: true };
}

// Get upgrade suggestions based on current plan
export function getUpgradeSuggestions(currentPlan: 'basic' | 'pro' | 'enterprise') {
  switch (currentPlan) {
    case 'basic':
      return {
        suggestedPlan: 'pro',
        benefits: [
          '10 professional websites (vs 3)',
          'Advanced analytics dashboard',
          'Email marketing integration',
          'API access for integrations',
          'Advanced reporting tools',
          'Priority support'
        ],
        price: 29,
        savings: 'Most Popular Choice!'
      };
    
    case 'pro':
      return {
        suggestedPlan: 'enterprise',
        benefits: [
          'Unlimited websites',
          'AI chatbot integration',
          'Team collaboration tools',
          'Custom integrations',
          'White-label solutions',
          'Dedicated account manager'
        ],
        price: 99,
        savings: 'Complete Business Solution!'
      };
    
    default:
      return null;
  }
}

// Middleware function to enforce plan limits
export async function enforcePlanLimits(userId: string, feature: keyof typeof PLAN_LIMITS.basic) {
  const user = await getUserPlan(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  const access = canAccessFeature(user, feature);
  
  if (!access.allowed) {
    const error = new Error(access.message || 'Access denied') as any;
    error.upgradeRequired = access.upgradeRequired;
    error.currentPlan = user.plan;
    error.feature = feature;
    throw error;
  }

  return user;
}

// Get plan comparison data
export function getPlanComparison() {
  return {
    basic: {
      name: 'Basic',
      price: 0,
      period: 'Forever Free',
      websites: 3,
      features: [
        '3 Professional Websites',
        'Basic Analytics',
        'AI Content Generation',
        'Community Support',
        'Mobile Responsive Design'
      ],
      limitations: [
        'No advanced analytics',
        'No email marketing',
        'No API access',
        'Limited support'
      ]
    },
    pro: {
      name: 'Pro',
      price: 29,
      period: 'One-time Payment',
      websites: 10,
      features: [
        '10 Professional Websites',
        'Advanced Analytics Dashboard',
        'Email Marketing Integration',
        'API Access',
        'Advanced Reporting',
        'Priority Support',
        'Custom Domains',
        'SEO Optimization Tools'
      ],
      popular: true
    },
    enterprise: {
      name: 'Enterprise',
      price: 99,
      period: 'One-time Payment',
      websites: 'Unlimited',
      features: [
        'Unlimited Websites',
        'AI Chatbot Integration',
        'Team Collaboration',
        'Custom Integrations',
        'White-label Solutions',
        'Dedicated Account Manager',
        'Advanced Security',
        'Custom Development'
      ],
      enterprise: true
    }
  };
}

// Track feature usage for analytics
export async function trackFeatureUsage(userId: string, feature: string, metadata?: any) {
  try {
    const { db } = await connectToDatabase();
    await db.collection('feature_usage').insertOne({
      userId: new ObjectId(userId),
      feature,
      metadata,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error tracking feature usage:', error);
    // Don't throw error for tracking failures
  }
}

