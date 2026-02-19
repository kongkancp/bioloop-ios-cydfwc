
import { useState, useEffect } from 'react';
import SubscriptionManager from '@/services/SubscriptionManager';
import { SubscriptionStatus, SubscriptionProduct } from '@/types/subscription';

/**
 * Hook for managing subscription state and operations
 * Follows the StoreKit 2 observable pattern from the Swift implementation
 */
export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>(
    SubscriptionManager.getSubscriptionStatus()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('useSubscription: Initializing subscription manager');
    
    // Initialize the manager
    SubscriptionManager.initialize().catch((error) => {
      console.error('useSubscription: Initialization failed', error);
    });

    // Subscribe to status changes
    const unsubscribe = SubscriptionManager.subscribe((newStatus) => {
      console.log('useSubscription: Status updated', newStatus);
      setStatus(newStatus);
    });

    // Cleanup on unmount
    return () => {
      console.log('useSubscription: Cleaning up');
      unsubscribe();
    };
  }, []);

  /**
   * Purchase a subscription product
   * Equivalent to Swift: func purchase(_ product: Product) async throws
   */
  const purchase = async (productId: SubscriptionProduct): Promise<boolean> => {
    console.log('useSubscription: Starting purchase', productId);
    setIsLoading(true);
    
    try {
      const success = await SubscriptionManager.purchase(productId);
      
      if (success) {
        console.log('✓ useSubscription: Purchase successful');
      } else {
        console.log('❌ useSubscription: Purchase failed');
      }
      
      return success;
    } catch (error) {
      console.error('❌ useSubscription: Purchase error', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Restore previous purchases
   * Equivalent to Swift: func restorePurchases() async
   */
  const restorePurchases = async (): Promise<boolean> => {
    console.log('useSubscription: Starting restore');
    setIsLoading(true);
    
    try {
      const success = await SubscriptionManager.restorePurchases();
      
      if (success) {
        console.log('✓ useSubscription: Restore successful');
      } else {
        console.log('❌ useSubscription: No purchases to restore');
      }
      
      return success;
    } catch (error) {
      console.error('❌ useSubscription: Restore error', error);
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
