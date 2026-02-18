
// Daily Sync Manager for BioLoop
// Handles once-per-day HealthKit data synchronization with validation and persistence

import { DailyMetrics, Baselines } from '@/types/health';
import HealthKitManager from './HealthKitManager';
import { validateAndClamp } from '@/utils/validation';
import { calculateBaselines, calculateAge } from '@/utils/baselines';
import { calculateLoadScore } from '@/utils/loadScore';
import { startOfDay, isSameDay, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_DATE_KEY = '@bioloop_last_sync_date';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const BASELINES_STORAGE_KEY = '@bioloop_baselines';
const USER_DOB_KEY = '@bioloop_user_dob';

export interface SyncResult {
  success: boolean;
  message: string;
  metrics?: DailyMetrics;
  baselines?: Baselines;
}

class SyncManager {
  private static instance: SyncManager;
  private lastSyncDate: Date | null = null;
  private isSyncing: boolean = false;
  private baselines: Baselines | null = null;

  private constructor() {
    console.log('SyncManager: Initializing');
    this.loadLastSyncDate();
    this.loadBaselines();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Load the last sync date from persistent storage
   */
  private async loadLastSyncDate(): Promise<void> {
    try {
      const storedDate = await AsyncStorage.getItem(LAST_SYNC_DATE_KEY);
      if (storedDate) {
        this.lastSyncDate = new Date(storedDate);
        console.log('SyncManager: Loaded last sync date:', this.lastSyncDate.toISOString());
      } else {
        console.log('SyncManager: No previous sync date found');
      }
    } catch (error) {
      console.error('SyncManager: Error loading last sync date', error);
    }
  }

  /**
   * Save the last sync date to persistent storage
   */
  private async saveLastSyncDate(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_SYNC_DATE_KEY, date.toISOString());
      this.lastSyncDate = date;
      console.log('SyncManager: Saved last sync date:', date.toISOString());
    } catch (error) {
      console.error('SyncManager: Error saving last sync date', error);
    }
  }

  /**
   * Load baselines from persistent storage
   */
  private async loadBaselines(): Promise<void> {
    try {
      const storedBaselines = await AsyncStorage.getItem(BASELINES_STORAGE_KEY);
      if (storedBaselines) {
        const parsed = JSON.parse(storedBaselines);
        this.baselines = {
          ...parsed,
          updatedAt: new Date(parsed.updatedAt),
        };
        console.log('SyncManager: Loaded baselines from storage:', this.baselines);
      } else {
        console.log('SyncManager: No baselines found in storage');
      }
    } catch (error) {
      console.error('SyncManager: Error loading baselines', error);
    }
  }

  /**
   * Save baselines to persistent storage
   */
  private async saveBaselines(baselines: Baselines): Promise<void> {
    try {
      const data = JSON.stringify({
        ...baselines,
        updatedAt: baselines.updatedAt.toISOString(),
      });
      
      await AsyncStorage.setItem(BASELINES_STORAGE_KEY, data);
      this.baselines = baselines;
      console.log('SyncManager: Saved baselines to storage:', baselines);
    } catch (error) {
      console.error('SyncManager: Error saving baselines', error);
      throw error;
    }
  }

  /**
   * Calculate and store baselines based on user's date of birth
   * This should be called on first sync
   */
  private async calculateAndStoreBaselines(dateOfBirth: Date): Promise<Baselines> {
    console.log('SyncManager: Calculating baselines for DOB:', dateOfBirth.toISOString());
    
    const age = calculateAge(dateOfBirth);
    const baselines = calculateBaselines(age);
    
    await this.saveBaselines(baselines);
    
    return baselines;
  }

  /**
   * Set user's date of birth and recalculate baselines
   */
  public async setUserDateOfBirth(dateOfBirth: Date): Promise<Baselines> {
    console.log('SyncManager: Setting user DOB:', dateOfBirth.toISOString());
    
    try {
      // Save DOB to storage
      await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
      
      // Calculate and save baselines
      const baselines = await this.calculateAndStoreBaselines(dateOfBirth);
      
      return baselines;
    } catch (error) {
      console.error('SyncManager: Error setting user DOB', error);
      throw error;
    }
  }

  /**
   * Get user's date of birth from storage
   */
  private async getUserDateOfBirth(): Promise<Date | null> {
    try {
      const storedDOB = await AsyncStorage.getItem(USER_DOB_KEY);
      if (storedDOB) {
        return new Date(storedDOB);
      }
      return null;
    } catch (error) {
      console.error('SyncManager: Error loading user DOB', error);
      return null;
    }
  }

  /**
   * Check if data has already been synced today
   */
  private isSyncedToday(): boolean {
    if (!this.lastSyncDate) {
      return false;
    }
    
    const today = startOfDay(new Date());
    const lastSync = startOfDay(this.lastSyncDate);
    
    const synced = isSameDay(today, lastSync);
    console.log('SyncManager: Already synced today?', synced);
    return synced;
  }

  /**
   * Calculate Load Score for metrics
   * Requires baselines to be set (for maxHR)
   */
  private calculateMetricsLoadScore(metrics: DailyMetrics): DailyMetrics {
    // Need baselines for maxHR and restingHR
    if (!this.baselines || !metrics.restingHR || metrics.workouts.length === 0) {
      console.log('SyncManager: Cannot calculate Load Score - missing baselines or data');
      return metrics;
    }
    
    const { loadScore, dailyLoad } = calculateLoadScore(
      metrics.workouts,
      metrics.restingHR,
      this.baselines.hrMax
    );
    
    return {
      ...metrics,
      loadScore,
      dailyLoad,
    };
  }

  /**
   * Main sync method - fetches, validates, and saves daily metrics
   * Returns early if already synced today
   * Calculates baselines on first sync if not already calculated
   */
  public async syncDailyData(force: boolean = false): Promise<SyncResult> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      console.log('SyncManager: Sync already in progress, skipping');
      return {
        success: false,
        message: 'Sync already in progress',
      };
    }

    // Check if already synced today (unless forced)
    if (!force && this.isSyncedToday()) {
      console.log('SyncManager: Already synced today, skipping');
      return {
        success: false,
        message: 'Already synced today',
      };
    }

    this.isSyncing = true;

    try {
      console.log('SyncManager: Starting daily data sync...');
      
      // Calculate baselines on first sync if not already done
      let calculatedBaselines: Baselines | undefined;
      if (!this.baselines) {
        console.log('SyncManager: First sync detected, calculating baselines');
        
        const userDOB = await this.getUserDateOfBirth();
        if (userDOB) {
          calculatedBaselines = await this.calculateAndStoreBaselines(userDOB);
        } else {
          console.warn('SyncManager: User DOB not set, cannot calculate baselines');
        }
      }
      
      const today = new Date();
      
      // Fetch raw metrics from HealthKit
      console.log('SyncManager: Fetching metrics from HealthKit');
      const rawMetrics = await HealthKitManager.fetchDailyMetrics(today);
      
      // Validate and clamp to safe ranges
      console.log('SyncManager: Validating and clamping metrics');
      const validatedMetrics = validateAndClamp(rawMetrics);
      
      // Calculate Load Score
      console.log('SyncManager: Calculating Load Score');
      const metricsWithLoad = this.calculateMetricsLoadScore(validatedMetrics);
      
      // Save to local storage
      console.log('SyncManager: Saving metrics to storage');
      await this.saveToStorage(metricsWithLoad);
      
      // Update last sync date
      await this.saveLastSyncDate(today);
      
      console.log('SyncManager: Daily data sync successful');
      
      return {
        success: true,
        message: 'Data updated',
        metrics: metricsWithLoad,
        baselines: calculatedBaselines,
      };
    } catch (error) {
      console.error('SyncManager: Daily data sync failed', error);
      this.handleSyncError(error);
      
      return {
        success: false,
        message: 'Sync failed. Check HealthKit permissions.',
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Save metrics to AsyncStorage
   * In production, this would save to Core Data with AES-256 encryption
   */
  private async saveToStorage(metrics: DailyMetrics): Promise<void> {
    try {
      const dateKey = startOfDay(metrics.date).toISOString();
      const storageKey = `${METRICS_STORAGE_PREFIX}${dateKey}`;
      
      const data = JSON.stringify({
        ...metrics,
        date: metrics.date.toISOString(),
        computedAt: metrics.computedAt.toISOString(),
        workouts: metrics.workouts.map(w => ({
          ...w,
          startTime: w.startTime.toISOString(),
        })),
      });
      
      await AsyncStorage.setItem(storageKey, data);
      console.log('SyncManager: Metrics saved to storage for', dateKey);
    } catch (error) {
      console.error('SyncManager: Error saving metrics to storage', error);
      throw error;
    }
  }

  /**
   * Load metrics for a specific date from storage
   */
  public async loadMetricsForDate(date: Date): Promise<DailyMetrics | null> {
    try {
      const dateKey = startOfDay(date).toISOString();
      const storageKey = `${METRICS_STORAGE_PREFIX}${dateKey}`;
      
      const data = await AsyncStorage.getItem(storageKey);
      if (!data) {
        console.log('SyncManager: No metrics found for', dateKey);
        return null;
      }
      
      const parsed = JSON.parse(data);
      
      // Convert ISO strings back to Date objects
      return {
        ...parsed,
        date: new Date(parsed.date),
        computedAt: new Date(parsed.computedAt),
        workouts: parsed.workouts.map((w: any) => ({
          ...w,
          startTime: new Date(w.startTime),
        })),
      };
    } catch (error) {
      console.error('SyncManager: Error loading metrics from storage', error);
      return null;
    }
  }

  /**
   * Get current baselines
   */
  public getBaselines(): Baselines | null {
    return this.baselines;
  }

  /**
   * Clean up old data (older than 365 days)
   * Should be called on app launch
   */
  public async cleanupOldData(): Promise<void> {
    console.log('SyncManager: Running data retention cleanup...');
    
    try {
      const cutoffDate = subDays(new Date(), 365);
      const allKeys = await AsyncStorage.getAllKeys();
      
      const metricsKeys = allKeys.filter(key => 
        key.startsWith(METRICS_STORAGE_PREFIX)
      );
      
      const keysToDelete: string[] = [];
      
      for (const key of metricsKeys) {
        const dateStr = key.replace(METRICS_STORAGE_PREFIX, '');
        const date = new Date(dateStr);
        
        if (date < cutoffDate) {
          keysToDelete.push(key);
        }
      }
      
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`SyncManager: Deleted ${keysToDelete.length} old metric entries`);
      } else {
        console.log('SyncManager: No old data to clean up');
      }
      
      console.log('SyncManager: Data retention cleanup complete');
    } catch (error) {
      console.error('SyncManager: Error during cleanup', error);
    }
  }

  /**
   * Handle sync errors
   */
  private handleSyncError(error: any): void {
    console.error('SyncManager: Sync error handler:', error);
    
    // In production, this could:
    // - Log to analytics service
    // - Show specific error messages based on error type
    // - Retry with exponential backoff
    // - Alert user about HealthKit permissions
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): { 
    lastSyncDate: Date | null; 
    isSyncing: boolean;
    baselines: Baselines | null;
  } {
    return {
      lastSyncDate: this.lastSyncDate,
      isSyncing: this.isSyncing,
      baselines: this.baselines,
    };
  }
}

export default SyncManager.getInstance();
