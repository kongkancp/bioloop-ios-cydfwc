
// Subscription types for BioLoop Premium

export enum SubscriptionProduct {
  MONTHLY = 'bioloop.premium.monthly',
  YEARLY = 'bioloop.premium.yearly',
}

export interface SubscriptionProductInfo {
  id: SubscriptionProduct;
  displayName: string;
  description: string;
  price: string;
  pricePerMonth?: string;
  savings?: string;
  featured?: boolean;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  currentSubscription: SubscriptionProduct | null;
  expirationDate?: Date;
}

export const SUBSCRIPTION_PRODUCTS: SubscriptionProductInfo[] = [
  {
    id: SubscriptionProduct.MONTHLY,
    displayName: 'Monthly',
    description: 'Full access to all premium features',
    price: '$1.49',
    pricePerMonth: '$1.49/month',
  },
  {
    id: SubscriptionProduct.YEARLY,
    displayName: 'Annual',
    description: 'Best value - save 50%',
    price: '$8.99',
    pricePerMonth: '$0.75/month',
    savings: 'Save $9',
    featured: true,
  },
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
