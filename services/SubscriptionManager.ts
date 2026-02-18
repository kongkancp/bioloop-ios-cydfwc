
import { Platform } from 'react-native';

export interface Product {
  id: string;
  displayName: string;
  displayPrice: string;
  price: number;
}

class SubscriptionManager {
  private isSubscribed: boolean = false;
  private products: Product[] = [];

  async initialize() {
    console.log('SubscriptionManager: Initializing');
    // Mock products for now
    this.products = [
      {
        id: 'bioloop_monthly',
        displayName: 'Monthly Premium',
        displayPrice: '$4.99',
        price: 4.99,
      },
      {
        id: 'bioloop_yearly',
        displayName: 'Yearly Premium',
        displayPrice: '$39.99',
        price: 39.99,
      },
    ];
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    console.log('SubscriptionManager: Checking subscription status');
    return this.isSubscribed;
  }

  async getProducts(): Promise<Product[]> {
    console.log('SubscriptionManager: Getting products');
    return this.products;
  }

  async purchase(product: Product): Promise<boolean> {
    console.log('SubscriptionManager: Purchasing product', product.id);
    // Mock purchase
    this.isSubscribed = true;
    return true;
  }

  async restorePurchases(): Promise<boolean> {
    console.log('SubscriptionManager: Restoring purchases');
    // Mock restore
    return false;
  }
}

export default new SubscriptionManager();
