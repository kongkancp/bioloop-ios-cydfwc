
// Daily Sync Manager for BioLoop
// Handles once-per-day HealthKit data synchronization with validation and persistence

import { DailyMetrics, Baselines } from '@/types/health';
import HealthKitManager from './HealthKitManager';
import { validateAndClamp } from '@/utils/validation';
import { calculateBaselines, calculateAge } from '@/utils/baselines';
import { calculateLoadScore } from '@/utils/loadScore';
import { calculateACWR, canCalculateACWR } from '@/utils/acwr';
import { calculateRecoveryEfficiency } from '@/utils/recoveryEfficiency';
import { calculatePerformanceIndex, applyEMA } from '@/utils/performanceIndex';
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
   * Fetch historical daily load values for ACWR calculation
   * @param days - Number of days to fetch (typically 28)
   * @returns Array of daily load values
   */
  private async getHistoricalDailyLoads(days: number): Promise<number[]> {
    console.log('SyncManager: Fetching historical loads for', days, 'days');
    
    const loads: number[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const metrics = await this.loadMetricsForDate(date);
      
      if (metrics && metrics.dailyLoad !== undefined) {
        loads.unshift(metrics.dailyLoad); // Add to beginning to maintain chronological order
      } else {
        loads.unshift(0); // Use 0 for missing days
      }
    }
    
    console.log('SyncManager: Fetched', loads.length, 'historical load values');
    return loads;
  }

  /**
   * Calculate ACWR for metrics
   * Requires at least 21 days of historical data
   */
  private async calculateMetricsACWR(metrics: DailyMetrics): Promise<DailyMetrics> {
    console.log('SyncManager: Calculating ACWR');
    
    try {
      // Fetch historical loads for the last 28 days
      const historicalLoads = await this.getHistoricalDailyLoads(28);
      
      // Check if we have sufficient data
      if (!canCalculateACWR(historicalLoads)) {
        console.log('SyncManager: Insufficient data for ACWR calculation');
        return metrics;
      }
      
      // Extract last 7 days and last 28 days
      const last7DaysLoad = historicalLoads.slice(-7);
      const last28DaysLoad = historicalLoads;
      
      // Calculate ACWR
      const { acwr, acwrScore } = calculateACWR(last7DaysLoad, last28DaysLoad);
      
      console.log('SyncManager: ACWR calculated - ratio:', acwr, 'score:', acwrScore);
      
      return {
        ...metrics,
        acwr,
        acwrScore,
      };
    } catch (error) {
      console.error('SyncManager: Error calculating ACWR', error);
      return metrics;
    }
  }

  /**
   * Fetch historical HRV values for Recovery Efficiency calculation
   * @param days - Number of days to fetch (typically 7)
   * @returns Array of HRV values
   */
  private async getHistoricalHRV(days: number): Promise<number[]> {
    console.log('SyncManager: Fetching historical HRV for', days, 'days');
    
    const hrvValues: number[] = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const date = subDays(today, i);
      const metrics = await this.loadMetricsForDate(date);
      
      if (metrics && metrics.hrv !== undefined) {
        hrvValues.push(metrics.hrv);
      }
    }
    
    console.log('SyncManager: Fetched', hrvValues.length, 'historical HRV values');
    return hrvValues;
  }

  /**
   * Calculate average of an array of numbers
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate Recovery Efficiency for metrics
   * Uses most recent workout's HRR and HRV rebound
   */
  private async calculateMetricsRecoveryEfficiency(metrics: DailyMetrics): Promise<DailyMetrics> {
    console.log('SyncManager: Calculating Recovery Efficiency');
    
    try {
      // Get most recent workout with hrAfter60s data
      const workoutWithRecovery = metrics.workouts
        .filter(w => w.hrAfter60s !== undefined)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
      
      let peakHR: number | undefined;
      let hrAfter60s: number | undefined;
      
      if (workoutWithRecovery) {
        peakHR = workoutWithRecovery.peakHR;
        hrAfter60s = workoutWithRecovery.hrAfter60s;
        console.log('SyncManager: Found workout with recovery data - Peak HR:', peakHR, 'HR after 60s:', hrAfter60s);
      } else {
        console.log('SyncManager: No workout with hrAfter60s data found');
      }
      
      // Get today's HRV and 7-day average
      const todayHRV = metrics.hrv;
      let avgHRV: number | undefined;
      
      if (todayHRV !== undefined) {
        const historicalHRV = await this.getHistoricalHRV(7);
        
        if (historicalHRV.length > 0) {
          avgHRV = this.average(historicalHRV);
          console.log('SyncManager: Today HRV:', todayHRV, '7-day avg HRV:', avgHRV);
        } else {
          console.log('SyncManager: Insufficient historical HRV data');
        }
      } else {
        console.log('SyncManager: No HRV data for today');
      }
      
      // Calculate Recovery Efficiency
      const recoveryEfficiency = calculateRecoveryEfficiency(
        peakHR,
        hrAfter60s,
        todayHRV,
        avgHRV
      );
      
      console.log('SyncManager: Recovery Efficiency calculated:', recoveryEfficiency);
      
      return {
        ...metrics,
        recoveryEfficiency,
      };
    } catch (error) {
      console.error('SyncManager: Error calculating Recovery Efficiency', error);
      return metrics;
    }
  }

  /**
   * Calculate and store Performance Index
   * Combines Load Score (40%), ACWR Score (30%), and Recovery Efficiency (30%)
   * Applies 7-day EMA smoothing
   */
  private async calculateMetricsPerformanceIndex(metrics: DailyMetrics): Promise<DailyMetrics> {
    console.log('SyncManager: Calculating Performance Index');
    
    try {
      // Get component scores (use defaults if not available)
      const loadScore = metrics.loadScore ?? 0;
      const acwrScore = metrics.acwrScore ?? 0;
      const recovery = metrics.recoveryEfficiency ?? 50; // Default to neutral
      
      console.log('SyncManager: Performance Index components:', {
        loadScore,
        acwrScore,
        recovery,
      });
      
      // Calculate raw Performance Index
      const rawIndex = calculatePerformanceIndex(
        loadScore,
        acwrScore,
        recovery
      );
      
      // Get yesterday's metrics for EMA calculation
      const yesterday = subDays(metrics.date, 1);
      const prevMetrics = await this.loadMetricsForDate(yesterday);
      const prevEMA = prevMetrics?.performanceIndex;
      
      console.log('SyncManager: Previous EMA:', prevEMA);
      
      // Apply 7-day EMA smoothing
      const smoothed = applyEMA(rawIndex, prevEMA, 7);
      
      console.log('SyncManager: Performance Index calculated:', {
        raw: rawIndex.toFixed(2),
        smoothed: smoothed.toFixed(2),
      });
      
      return {
        ...metrics,
        performanceIndexRaw: rawIndex,
        performanceIndex: smoothed,
      };
    } catch (error) {
      console.error('SyncManager: Error calculating Performance Index', error);
      return metrics;
    }
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
      
      // Calculate ACWR
      console.log('SyncManager: Calculating ACWR');
      const metricsWithACWR = await this.calculateMetricsACWR(metricsWithLoad);
      
      // Calculate Recovery Efficiency
      console.log('SyncManager: Calculating Recovery Efficiency');
      const metricsWithRecovery = await this.calculateMetricsRecoveryEfficiency(metricsWithACWR);
      
      // Calculate Performance Index
      console.log('SyncManager: Calculating Performance Index');
      const metricsWithPerformance = await this.calculateMetricsPerformanceIndex(metricsWithRecovery);
      
      // Save to local storage
      console.log('SyncManager: Saving metrics to storage');
      await this.saveToStorage(metricsWithPerformance);
      
      // Update last sync date
      await this.saveLastSyncDate(today);
      
      console.log('SyncManager: Daily data sync successful');
      
      return {
        success: true,
        message: 'Data updated',
        metrics: metricsWithPerformance,
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
