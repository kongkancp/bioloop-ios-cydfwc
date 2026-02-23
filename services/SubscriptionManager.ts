
import { Platform } from 'react-native';
import { SubscriptionProduct, SubscriptionStatus, PRODUCTS } from '@/types/subscription';

// StoreKit 2 Product interface
export interface Product {
  id: string;
  displayName: string;
  displayPrice: string;
  price: number;
}

// Subscription status listener callback type
type StatusListener = (status: SubscriptionStatus) => void;

/**
 * Calculate savings between monthly and annual plans
 */
export function calculateSavings(): { amount: number; percent: number } {
  const monthlyYearly = PRODUCTS.MONTHLY.price * 12; // $17.88
  const annual = PRODUCTS.ANNUAL.price; // $9.99
  const savings = monthlyYearly - annual; // $7.89
  const percent = Math.round((savings / monthlyYearly) * 100); // 44%
  return { amount: savings, percent };
}

/**
 * Calculate expiration date based on product type
 */
function calculateExpiration(productId: string): Date {
  const now = new Date();
  
  if (productId.includes('monthly')) {
    return new Date(now.setMonth(now.getMonth() + 1));
  } else if (productId.includes('annual')) {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else if (productId.includes('lifetime')) {
    return new Date('2099-12-31'); // Effectively infinite
  }
  
  return now;
}

/**
 * Purchase a subscription product
 */
export async function purchaseProduct(productId: string): Promise<void> {
  console.log('SubscriptionManager: Purchasing product', productId);
  
  try {
    if (Platform.OS === 'ios') {
      // TODO: Backend Integration - POST /api/subscriptions/purchase
      // Body: { productId: string }
      // This should call native StoreKit 2 product.purchase() via a native module
      // Returns: { success: boolean, transaction?: Transaction }
      console.log('SubscriptionManager: Would call StoreKit product.purchase()');
    }

    // Mock successful purchase
    await saveSubscription({
      isSubscribed: true,
      productId,
      purchaseDate: new Date(),
      expirationDate: calculateExpiration(productId),
    });

    console.log('✓ Purchase successful');
  } catch (error) {
    console.error('❌ Purchase failed:', error);
    throw error;
  }
}

/**
 * Save subscription data (mock implementation)
 */
async function saveSubscription(data: {
  isSubscribed: boolean;
  productId: string;
  purchaseDate: Date;
  expirationDate: Date;
}): Promise<void> {
  console.log('SubscriptionManager: Saving subscription', data);
  // In production, this would save to AsyncStorage or native storage
}

class SubscriptionManager {
  private isSubscribed: boolean = false;
  private currentSubscription: SubscriptionProduct | null = null;
  private expirationDate: Date | undefined = undefined;
  private products: Product[] = [];
  private listeners: Set<StatusListener> = new Set();
  private updateListenerTask: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor() {
    console.log('SubscriptionManager: Constructor called');
    // Start transaction listener
    this.startTransactionListener();
  }

  /**
   * Initialize the subscription manager
   * Loads products and checks current subscription status
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('SubscriptionManager: Already initialized');
      return;
    }

    console.log('SubscriptionManager: Initializing');
    
    try {
      await this.loadProducts();
      await this.updateSubscriptionStatus();
      this.isInitialized = true;
      console.log('✓ SubscriptionManager: Initialization complete');
    } catch (error) {
      console.error('❌ SubscriptionManager: Initialization failed', error);
      throw error;
    }
  }

  /**
   * Load available subscription products from StoreKit
   * Equivalent to: Product.products(for: ["bioloop.premium.monthly", "bioloop.premium.annual", "bioloop.premium.lifetime"])
   */
  private async loadProducts(): Promise<void> {
    console.log('SubscriptionManager: Loading products');
    
    try {
      if (Platform.OS === 'ios') {
        // TODO: Backend Integration - GET /api/subscriptions/products
        // This should call native StoreKit 2 Product.products(for:) via a native module
        // For now, using mock data
        console.log('SubscriptionManager: Would call StoreKit Product.products(for:)');
      }

      // Mock products matching the new 3-tier structure
      this.products = [
        {
          id: SubscriptionProduct.MONTHLY,
          displayName: PRODUCTS.MONTHLY.displayName,
          displayPrice: PRODUCTS.MONTHLY.displayPrice,
          price: PRODUCTS.MONTHLY.price,
        },
        {
          id: SubscriptionProduct.ANNUAL,
          displayName: PRODUCTS.ANNUAL.displayName,
          displayPrice: PRODUCTS.ANNUAL.displayPrice,
          price: PRODUCTS.ANNUAL.price,
        },
        {
          id: SubscriptionProduct.LIFETIME,
          displayName: PRODUCTS.LIFETIME.displayName,
          displayPrice: PRODUCTS.LIFETIME.displayPrice,
          price: PRODUCTS.LIFETIME.price,
        },
      ];

      console.log(`✓ Loaded ${this.products.length} products`);
    } catch (error) {
      console.error('❌ Load products failed:', error);
      throw error;
    }
  }

  /**
   * Purchase a subscription product
   * Equivalent to: product.purchase() -> VerificationResult<Transaction>
   */
  async purchase(productId: SubscriptionProduct): Promise<boolean> {
    try {
      await purchaseProduct(productId);
      
      // Update local state
      this.isSubscribed = true;
      this.currentSubscription = productId;
      this.expirationDate = calculateExpiration(productId);

      // Notify listeners
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      return false;
    }
  }

  /**
   * Restore previous purchases
   * Equivalent to: AppStore.sync()
   */
  async restorePurchases(): Promise<boolean> {
    console.log('SubscriptionManager: Restoring purchases');

    try {
      if (Platform.OS === 'ios') {
        // TODO: Backend Integration - POST /api/subscriptions/restore
        // This should call native StoreKit 2 AppStore.sync() via a native module
        console.log('SubscriptionManager: Would call StoreKit AppStore.sync()');
      }

      await this.updateSubscriptionStatus();
      
      console.log('✓ Restore complete');
      return this.isSubscribed;
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return false;
    }
  }

  /**
   * Update subscription status by checking current entitlements
   * This is called after purchases, restores, and by the transaction listener
   */
  private async updateSubscriptionStatus(): Promise<void> {
    console.log('SubscriptionManager: Updating subscription status');

    try {
      if (Platform.OS === 'ios') {
        // TODO: Backend Integration - GET /api/subscriptions/status
        // This should check StoreKit 2 Transaction.currentEntitlements
        // Returns: { isSubscribed: boolean, productId?: string, expirationDate?: string }
        console.log('SubscriptionManager: Would check StoreKit Transaction.currentEntitlements');
      }

      // For now, keep existing status
      // In production, this would query StoreKit for active subscriptions

      this.notifyListeners();
    } catch (error) {
      console.error('❌ Update subscription status failed:', error);
    }
  }

  /**
   * Start listening for transaction updates
   * Equivalent to: Task { for await transaction in Transaction.updates { ... } }
   */
  private startTransactionListener(): void {
    console.log('SubscriptionManager: Starting transaction listener');

    // In the Swift implementation, this is a long-running Task that listens for
    // Transaction.updates and calls updateSubscriptionStatus() when new transactions occur
    
    // For React Native, we would use a native module to bridge StoreKit transaction updates
    // For now, we'll poll periodically (not ideal, but works for mock)
    this.updateListenerTask = setInterval(() => {
      // In production, this would be event-driven from native StoreKit
      // console.log('SubscriptionManager: Transaction listener tick');
    }, 60000); // Check every minute
  }

  /**
   * Stop the transaction listener
   * Called when the manager is destroyed
   */
  private stopTransactionListener(): void {
    if (this.updateListenerTask) {
      clearInterval(this.updateListenerTask);
      this.updateListenerTask = null;
      console.log('SubscriptionManager: Transaction listener stopped');
    }
  }

  /**
   * Subscribe to subscription status changes
   * Returns an unsubscribe function
   */
  subscribe(listener: StatusListener): () => void {
    console.log('SubscriptionManager: Adding listener');
    this.listeners.add(listener);

    // Immediately notify with current status
    listener(this.getSubscriptionStatus());

    // Return unsubscribe function
    return () => {
      console.log('SubscriptionManager: Removing listener');
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners(): void {
    const status = this.getSubscriptionStatus();
    console.log('SubscriptionManager: Notifying listeners', status);
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Get current subscription status
   */
  getSubscriptionStatus(): SubscriptionStatus {
    return {
      isSubscribed: this.isSubscribed,
      currentSubscription: this.currentSubscription,
      expirationDate: this.expirationDate,
    };
  }

  /**
   * Get available products
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.products;
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    console.log('SubscriptionManager: Destroying');
    this.stopTransactionListener();
    this.listeners.clear();
  }
}

// Export singleton instance
export default new SubscriptionManager();
