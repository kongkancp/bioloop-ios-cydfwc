
import SubscriptionManager from '@/services/SubscriptionManager';
import { FREE_TIER_LIMITS } from '@/types/subscription';

export class FeatureAccess {
  static canAccessHistoricalData(daysAgo: number): boolean {
    const isSubscribed = SubscriptionManager.isSubscribed();
    if (isSubscribed) {
      return true;
    }
    return daysAgo <= FREE_TIER_LIMITS.historicalDataDays;
  }

  static shouldBlurChart(): boolean {
    const isSubscribed = SubscriptionManager.isSubscribed();
    return !isSubscribed && FREE_TIER_LIMITS.chartsBlurred;
  }

  static canExportData(): boolean {
    return SubscriptionManager.isSubscribed();
  }

  static canAccessAdvancedAnalytics(): boolean {
    return SubscriptionManager.isSubscribed();
  }

  static getHistoricalDataLimit(): number {
    const isSubscribed = SubscriptionManager.isSubscribed();
    return isSubscribed ? Infinity : FREE_TIER_LIMITS.historicalDataDays;
  }
}
