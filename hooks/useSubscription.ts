
import { useState, useEffect } from 'react';
import SubscriptionManager from '@/services/SubscriptionManager';
import { SubscriptionStatus, SubscriptionProduct } from '@/types/subscription';

/**
 * Hook for managing subscription state and operations
 * Follows the StoreKit 2 observable pattern from the Swift implementation
 * 
 * CRITICAL: This hook ALWAYS returns a valid status object to prevent undefined crashes
 */
export function useSubscription() {
  // Initialize with a default valid status to prevent undefined access
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    currentSubscription: null,
    expirationDate: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useSubscription: Initializing subscription manager');
    
    let isMounted = true;

    // Initialize the manager
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await SubscriptionManager.initialize();

        // Get initial status
        if (isMounted) {
          const initialStatus = SubscriptionManager.getSubscriptionStatus();
          console.log('useSubscription: Initial status loaded', initialStatus);
          
          // Ensure we always have a valid status object
          setStatus({
            isSubscribed: initialStatus?.isSubscribed ?? false,
            currentSubscription: initialStatus?.currentSubscription ?? null,
            expirationDate: initialStatus?.expirationDate,
          });
        }
      } catch (err) {
        console.error('useSubscription: Initialization failed', err);
        if (isMounted) {
          setError(err as Error);
          // Even on error, ensure we have a valid status object
          setStatus({
            isSubscribed: false,
            currentSubscription: null,
            expirationDate: undefined,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeManager();

    // Subscribe to status changes
    const unsubscribe = SubscriptionManager.subscribe((newStatus) => {
      console.log('useSubscription: Status updated', newStatus);
      if (isMounted) {
        // Ensure we always have a valid status object
        setStatus({
          isSubscribed: newStatus?.isSubscribed ?? false,
          currentSubscription: newStatus?.currentSubscription ?? null,
          expirationDate: newStatus?.expirationDate,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('useSubscription: Cleaning up');
      isMounted = false;
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
    setError(null);
    
    try {
      const success = await SubscriptionManager.purchase(productId);
      
      if (success) {
        console.log('✓ useSubscription: Purchase successful');
      } else {
        console.log('❌ useSubscription: Purchase failed');
      }
      
      return success;
    } catch (err) {
      console.error('❌ useSubscription: Purchase error', err);
      setError(err as Error);
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
    setError(null);
    
    try {
      const success = await SubscriptionManager.restorePurchases();
      
      if (success) {
        console.log('✓ useSubscription: Restore successful');
      } else {
        console.log('❌ useSubscription: No purchases to restore');
      }
      
      return success;
    } catch (err) {
      console.error('❌ useSubscription: Restore error', err);
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually refetch subscription status
   */
  const refetch = async (): Promise<void> => {
    console.log('useSubscription: Manual refetch requested');
    setIsLoading(true);
    setError(null);

    try {
      await SubscriptionManager.initialize();
      const currentStatus = SubscriptionManager.getSubscriptionStatus();
      
      setStatus({
        isSubscribed: currentStatus?.isSubscribed ?? false,
        currentSubscription: currentStatus?.currentSubscription ?? null,
        expirationDate: currentStatus?.expirationDate,
      });
      
      console.log('✓ useSubscription: Refetch successful', currentStatus);
    } catch (err) {
      console.error('❌ useSubscription: Refetch error', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Return a complete object with all properties guaranteed to be defined
  return {
    // Status properties - always defined
    status: {
      isSubscribed: status.isSubscribed,
      currentSubscription: status.currentSubscription,
      expirationDate: status.expirationDate,
    },
    
    // Legacy individual properties for backward compatibility
    isSubscribed: status.isSubscribed,
    currentSubscription: status.currentSubscription,
    expirationDate: status.expirationDate,
    
    // Loading and error states
    loading: isLoading,
    isLoading,
    error,
    
    // Actions
    purchase,
    restorePurchases,
    refetch,
  };
}
