
import { calculatePerformanceIndex, applyEMA } from '@/utils/performanceIndex';
import { DailyMetrics, Baselines } from '@/types/health';
import HealthKitManager from './HealthKitManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateACWR, canCalculateACWR } from '@/utils/acwr';
import { calculateLoadScore } from '@/utils/loadScore';
import { startOfDay, isSameDay, subDays } from 'date-fns';
import { calculateRecoveryEfficiency } from '@/utils/recoveryEfficiency';
import { validateAndClamp } from '@/utils/validation';
import { calculateBaselines } from '@/utils/baselines';
import { calculateAge } from '@/utils/age';

const LAST_SYNC_DATE_KEY = '@bioloop_last_sync_date';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const BASELINES_STORAGE_KEY = '@bioloop_baselines';
const USER_DOB_KEY = '@bioloop_user_dob';

class SyncManager {
  /**
   * Perform daily sync of health data
   */
  async performDailySync(forceSync: boolean = false): Promise<DailyMetrics | null> {
    try {
      const today = startOfDay(new Date());
      const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_DATE_KEY);

      // Check if we already synced today
      if (!forceSync && lastSyncStr) {
        const lastSync = new Date(lastSyncStr);
        if (isSameDay(lastSync, today)) {
          console.log('✓ Already synced today, loading cached data');
          return await this.loadMetrics(today);
        }
      }

      console.log('🔄 Starting daily sync...');

      // Check HealthKit authorization
      const isAuthorized = await HealthKitManager.isAuthorized();
      if (!isAuthorized) {
        console.error('❌ HealthKit not authorized');
        return null;
      }

      // Fetch today's metrics from HealthKit
      const metrics = await HealthKitManager.fetchDailyMetrics(today);
      if (!metrics) {
        console.error('❌ Failed to fetch metrics from HealthKit');
        return null;
      }

      console.log('✓ Fetched metrics from HealthKit');

      // Load user's date of birth for age-based calculations
      const dobStr = await AsyncStorage.getItem(USER_DOB_KEY);
      let dateOfBirth: Date | undefined;
      if (dobStr) {
        dateOfBirth = new Date(dobStr);
        const age = calculateAge(dateOfBirth);
        console.log(`✓ User age: ${age} years`);
      }

      // Calculate baselines from historical data
      const historicalMetrics = await this.loadHistoricalMetrics(7);
      const baselines = calculateBaselines(historicalMetrics, dateOfBirth);
      await this.saveBaselines(baselines);

      console.log('✓ Baselines calculated:', baselines);

      // Calculate Performance Index
      const previousMetrics = await this.loadMetrics(subDays(today, 1));
      const performanceIndex = calculatePerformanceIndex(metrics, baselines);
      const smoothedPI = previousMetrics?.performanceIndex
        ? applyEMA(performanceIndex, previousMetrics.performanceIndex)
        : performanceIndex;

      metrics.performanceIndex = smoothedPI;

      // Calculate ACWR if we have enough data
      if (canCalculateACWR(historicalMetrics)) {
        const acwr = calculateACWR(historicalMetrics);
        metrics.acwr = acwr;
        console.log(`✓ ACWR: ${acwr.toFixed(2)}`);
      }

      // Calculate Load Score
      const loadScore = calculateLoadScore(metrics);
      metrics.loadScore = loadScore;
      console.log(`✓ Load Score: ${loadScore.toFixed(1)}`);

      // Calculate Recovery Efficiency
      if (previousMetrics) {
        const recoveryEfficiency = calculateRecoveryEfficiency(metrics, previousMetrics);
        metrics.recoveryEfficiency = recoveryEfficiency;
        console.log(`✓ Recovery Efficiency: ${recoveryEfficiency.toFixed(1)}%`);
      }

      // Save metrics
      await this.saveMetrics(today, metrics);
      await AsyncStorage.setItem(LAST_SYNC_DATE_KEY, today.toISOString());

      console.log('✅ Daily sync complete');
      console.log(`Performance Index: ${smoothedPI.toFixed(1)}`);

      return metrics;
    } catch (error) {
      console.error('❌ Daily sync failed:', error);
      return null;
    }
  }

  /**
   * Save metrics for a specific date
   */
  private async saveMetrics(date: Date, metrics: DailyMetrics): Promise<void> {
    const key = `${METRICS_STORAGE_PREFIX}${startOfDay(date).toISOString()}`;
    await AsyncStorage.setItem(key, JSON.stringify(metrics));
  }

  /**
   * Load metrics for a specific date
   */
  async loadMetrics(date: Date): Promise<DailyMetrics | null> {
    try {
      const key = `${METRICS_STORAGE_PREFIX}${startOfDay(date).toISOString()}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;

      const metrics = JSON.parse(data);
      // Convert date strings back to Date objects
      metrics.date = new Date(metrics.date);
      metrics.computedAt = new Date(metrics.computedAt);
      if (metrics.workouts) {
        metrics.workouts = metrics.workouts.map((w: any) => ({
          ...w,
          startTime: new Date(w.startTime),
        }));
      }

      return metrics;
    } catch (error) {
      console.error('❌ Failed to load metrics:', error);
      return null;
    }
  }

  /**
   * Load historical metrics for the past N days
   */
  private async loadHistoricalMetrics(days: number): Promise<DailyMetrics[]> {
    const metrics: DailyMetrics[] = [];
    const today = startOfDay(new Date());

    for (let i = 1; i <= days; i++) {
      const date = subDays(today, i);
      const dayMetrics = await this.loadMetrics(date);
      if (dayMetrics) {
        metrics.push(dayMetrics);
      }
    }

    return metrics;
  }

  /**
   * Save baselines
   */
  private async saveBaselines(baselines: Baselines): Promise<void> {
    await AsyncStorage.setItem(BASELINES_STORAGE_KEY, JSON.stringify(baselines));
  }

  /**
   * Load baselines
   */
  async loadBaselines(): Promise<Baselines | null> {
    try {
      const data = await AsyncStorage.getItem(BASELINES_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load baselines:', error);
      return null;
    }
  }

  /**
   * Get last sync date
   */
  async getLastSyncDate(): Promise<Date | null> {
    try {
      const dateStr = await AsyncStorage.getItem(LAST_SYNC_DATE_KEY);
      return dateStr ? new Date(dateStr) : null;
    } catch (error) {
      console.error('❌ Failed to get last sync date:', error);
      return null;
    }
  }

  /**
   * Clear all sync data (for testing/debugging)
   */
  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const bioloopKeys = keys.filter(
        (key) =>
          key.startsWith(METRICS_STORAGE_PREFIX) ||
          key === LAST_SYNC_DATE_KEY ||
          key === BASELINES_STORAGE_KEY
      );
      await AsyncStorage.multiRemove(bioloopKeys);
      console.log('✓ All sync data cleared');
    } catch (error) {
      console.error('❌ Failed to clear data:', error);
    }
  }
}

export default new SyncManager();
