
// DataManager - Handles local data storage and deletion
// Implements secure data deletion for user privacy

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LAST_SYNC_DATE: '@bioloop_last_sync_date',
  METRICS_PREFIX: '@bioloop_metrics_',
  BASELINES: '@bioloop_baselines',
  USER_DOB: '@bioloop_user_dob',
  SUBSCRIPTION_STATUS: '@bioloop_subscription_status',
  BIOAGE_PREFIX: '@bioloop_bioage_',
  ONBOARDING_COMPLETE: '@bioloop_onboarding_complete',
};

class DataManager {
  private static instance: DataManager;

  private constructor() {
    console.log('DataManager: Initialized');
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Delete all user data from local storage
   * This is a permanent operation and cannot be undone
   */
  async deleteAllData(): Promise<void> {
    try {
      console.log('DataManager: Starting data deletion process');

      // Get all keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      console.log(`DataManager: Found ${allKeys.length} total keys in storage`);

      // Filter for BioLoop-specific keys
      const bioloopKeys = allKeys.filter(key => 
        key.startsWith('@bioloop_') || 
        key.includes('bioloop')
      );

      console.log(`DataManager: Deleting ${bioloopKeys.length} BioLoop keys`);

      if (bioloopKeys.length > 0) {
        // Delete all BioLoop data
        await AsyncStorage.multiRemove(bioloopKeys);
        console.log('DataManager: Successfully deleted all user data');
      } else {
        console.log('DataManager: No data found to delete');
      }

      // Verify deletion
      const remainingKeys = await AsyncStorage.getAllKeys();
      const remainingBioloopKeys = remainingKeys.filter(key => 
        key.startsWith('@bioloop_') || 
        key.includes('bioloop')
      );

      if (remainingBioloopKeys.length > 0) {
        console.warn('DataManager: Some keys were not deleted:', remainingBioloopKeys);
      } else {
        console.log('DataManager: Verified - all data successfully deleted');
      }
    } catch (error) {
      console.error('DataManager: Error deleting data', error);
      throw new Error('Failed to delete data. Please try again.');
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{ totalKeys: number; bioloopKeys: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const bioloopKeys = allKeys.filter(key => 
        key.startsWith('@bioloop_') || 
        key.includes('bioloop')
      );

      return {
        totalKeys: allKeys.length,
        bioloopKeys: bioloopKeys.length,
      };
    } catch (error) {
      console.error('DataManager: Error getting storage stats', error);
      return { totalKeys: 0, bioloopKeys: 0 };
    }
  }

  /**
   * Export user data (for future implementation)
   */
  async exportData(): Promise<string> {
    try {
      console.log('DataManager: Exporting user data');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const bioloopKeys = allKeys.filter(key => 
        key.startsWith('@bioloop_') || 
        key.includes('bioloop')
      );

      const data: Record<string, string | null> = {};
      
      for (const key of bioloopKeys) {
        const value = await AsyncStorage.getItem(key);
        data[key] = value;
      }

      const exportJson = JSON.stringify(data, null, 2);
      console.log('DataManager: Data export complete');
      
      return exportJson;
    } catch (error) {
      console.error('DataManager: Error exporting data', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }
}

export default DataManager.getInstance();
