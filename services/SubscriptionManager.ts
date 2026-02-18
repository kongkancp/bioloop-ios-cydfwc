
// SubscriptionManager - StoreKit 2 integration for React Native
// This is a mock implementation for development. In production, this would use native modules.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionProduct, SubscriptionStatus } from '@/types/subscription';

const SUBSCRIPTION_STATUS_KEY = '@bioloop_subscription_status';

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptionStatus: SubscriptionStatus = {
    isSubscribed: false,
    currentSubscription: null,
  };
  private listeners: Array<(status: SubscriptionStatus) => void> = [];

  private constructor() {
    this.loadSubscriptionStatus();
  }

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  async loadSubscriptionStatus(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.subscriptionStatus = {
          ...parsed,
          expirationDate: parsed.expirationDate ? new Date(parsed.expirationDate) : undefined,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('SubscriptionManager: Failed to load subscription status', error);
    }
  }

  async saveSubscriptionStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, JSON.stringify(this.subscriptionStatus));
    } catch (error) {
      console.error('SubscriptionManager: Failed to save subscription status', error);
    }
  }

  getSubscriptionStatus(): SubscriptionStatus {
    return { ...this.subscriptionStatus };
  }

  isSubscribed(): boolean {
    return this.subscriptionStatus.isSubscribed;
  }

  getCurrentSubscription(): SubscriptionProduct | null {
    return this.subscriptionStatus.currentSubscription;
  }

  // Mock purchase function - in production, this would call native StoreKit 2 APIs
  async purchase(productId: SubscriptionProduct): Promise<boolean> {
    console.log('SubscriptionManager: Initiating purchase for', productId);
    
    // Simulate purchase flow
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful purchase
        const expirationDate = new Date();
        if (productId === SubscriptionProduct.MONTHLY) {
          expirationDate.setMonth(expirationDate.getMonth() + 1);
        } else {
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        }

        this.subscriptionStatus = {
          isSubscribed: true,
          currentSubscription: productId,
          expirationDate,
        };

        this.saveSubscriptionStatus();
        this.notifyListeners();
        
        console.log('SubscriptionManager: Purchase successful', productId);
        resolve(true);
      }, 1500);
    });
  }

  // Mock restore purchases - in production, this would call AppStore.sync()
  async restorePurchases(): Promise<boolean> {
    console.log('SubscriptionManager: Restoring purchases');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock restore - check if there's a stored subscription
        const hasSubscription = this.subscriptionStatus.isSubscribed;
        console.log('SubscriptionManager: Restore complete', hasSubscription ? 'Found subscription' : 'No subscription found');
        resolve(hasSubscription);
      }, 1000);
    });
  }

  // Mock cancel subscription
  async cancelSubscription(): Promise<void> {
    console.log('SubscriptionManager: Cancelling subscription');
    this.subscriptionStatus = {
      isSubscribed: false,
      currentSubscription: null,
    };
    await this.saveSubscriptionStatus();
    this.notifyListeners();
  }

  subscribe(listener: (status: SubscriptionStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getSubscriptionStatus()));
  }
}

export default SubscriptionManager.getInstance();
