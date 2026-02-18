
import { useState, useEffect } from 'react';
import SubscriptionManager from '@/services/SubscriptionManager';
import { SubscriptionStatus, SubscriptionProduct } from '@/types/subscription';

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(
    SubscriptionManager.getSubscriptionStatus()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = SubscriptionManager.subscribe((newStatus) => {
      console.log('useSubscription: Status updated', newStatus);
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const purchase = async (productId: SubscriptionProduct): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await SubscriptionManager.purchase(productId);
      return success;
    } catch (error) {
      console.error('useSubscription: Purchase failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await SubscriptionManager.restorePurchases();
      return success;
    } catch (error) {
      console.error('useSubscription: Restore failed', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubscribed: status.isSubscribed,
    currentSubscription: status.currentSubscription,
    expirationDate: status.expirationDate,
    isLoading,
    purchase,
    restorePurchases,
  };
}
