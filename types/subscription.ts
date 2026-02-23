
// Subscription types for BioLoop Premium

export enum SubscriptionProduct {
  MONTHLY = 'bioloop.premium.monthly',
  ANNUAL = 'bioloop.premium.annual',
  LIFETIME = 'bioloop.premium.lifetime',
}

export interface SubscriptionProductInfo {
  id: SubscriptionProduct;
  displayName: string;
  description: string;
  price: number;
  displayPrice: string;
  period: 'month' | 'year' | 'lifetime';
  pricePerMonth?: string;
  savings?: number;
  trialDays: number;
  featured?: boolean;
  hidden?: boolean;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  currentSubscription: SubscriptionProduct | null;
  expirationDate?: Date;
}

export const PRODUCTS: Record<string, SubscriptionProductInfo> = {
  MONTHLY: {
    id: SubscriptionProduct.MONTHLY,
    displayName: 'Monthly Premium',
    description: 'Full access to premium features',
    price: 1.49,
    displayPrice: '$1.49',
    period: 'month',
    pricePerMonth: '$1.49/month',
    trialDays: 7,
  },
  ANNUAL: {
    id: SubscriptionProduct.ANNUAL,
    displayName: 'Annual Premium',
    description: 'Best value - save 44%',
    price: 9.99,
    displayPrice: '$9.99',
    period: 'year',
    pricePerMonth: '$0.83/month',
    savings: 44,
    trialDays: 7,
    featured: true,
  },
  LIFETIME: {
    id: SubscriptionProduct.LIFETIME,
    displayName: 'Lifetime Access',
    description: 'One-time payment, lifetime access',
    price: 89.99,
    displayPrice: '$89.99',
    period: 'lifetime',
    trialDays: 0,
    hidden: true, // Don't show in onboarding
  },
};

// Legacy array for backward compatibility
export const SUBSCRIPTION_PRODUCTS: SubscriptionProductInfo[] = [
  PRODUCTS.MONTHLY,
  PRODUCTS.ANNUAL,
];

export const FREE_TIER_LIMITS = {
  historicalDataDays: 3,
  chartsBlurred: true,
};

export const PREMIUM_FEATURES = [
  {
    icon: 'history',
    iosIcon: 'clock.arrow.circlepath',
    title: 'Unlimited History',
    description: 'Access all your historical data',
  },
  {
    icon: 'show-chart',
    iosIcon: 'chart.line.uptrend.xyaxis',
    title: 'Advanced Analytics',
    description: 'Detailed charts and trends',
  },
  {
    icon: 'insights',
    iosIcon: 'brain.head.profile',
    title: 'AI Insights',
    description: 'Personalized recommendations',
  },
  {
    icon: 'cloud-download',
    iosIcon: 'arrow.down.doc',
    title: 'Export Data',
    description: 'Download your health data',
  },
];
