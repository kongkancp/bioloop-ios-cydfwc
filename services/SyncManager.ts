
import HealthKitManager from './HealthKitManager';
import DataManager from './DataManager';
import { DailyMetrics, Baselines } from '@/types/health';
import { calculateAge } from '@/utils/age';
import { calculateBioAgeWithProfile, BioAgeData } from '@/utils/bioAge';
import { calculateBaselines } from '@/utils/baselines';
import { calculateLoadScore } from '@/utils/loadScore';
import { calculateACWR, canCalculateACWR } from '@/utils/acwr';
import { calculateRecoveryEfficiency } from '@/utils/recoveryEfficiency';
import { calculatePerformanceIndex, applyEMA } from '@/utils/performanceIndex';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfDay, subDays } from 'date-fns';

const LAST_SYNC_DATE_KEY = '@bioloop_last_sync_date';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const BASELINES_STORAGE_KEY = '@bioloop_baselines';
const BIOAGE_STORAGE_PREFIX = '@bioloop_bioage_';
const USER_DOB_KEY = '@bioloop_user_dob';
const USER_HEIGHT_KEY = '@bioloop_user_height';

interface UserProfile {
  dateOfBirth?: Date;
  height?: number;
}

export interface SyncResult {
  success: boolean;
  metrics?: DailyMetrics | null;
  baselines?: Baselines;
  error?: string;
}

class SyncManager {
  private static instance: SyncManager;
  private lastSyncDate: Date | null = null;

  private constructor() {
    console.log('SyncManager: Initialized');
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  isSyncedToday(): boolean {
    if (!this.lastSyncDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(this.lastSyncDate);
    last.setHours(0, 0, 0, 0);
    return today.getTime() === last.getTime();
  }

  async performSync(): Promise<void> {
    console.log('🔄 Starting sync...');

    try {
      const healthManager = HealthKitManager;
      const today = new Date();

      const authorized = await healthManager.isAuthorized();
      if (!authorized) throw new Error('HealthKit not authorized');

      const metrics = await healthManager.fetchDailyMetrics(today);
      if (!metrics) throw new Error('Failed to fetch metrics');

      console.log('✓ Fetched metrics from HealthKit');

      if (metrics.workouts?.length > 0) {
        const baselines = await this.getBaselines();
        const loadResult = this.calculateLoadScore(metrics, baselines);
        metrics.loadScore = loadResult.loadScore;
        metrics.dailyLoad = loadResult.dailyLoad;
        console.log(`✓ Load Score: ${loadResult.loadScore.toFixed(1)}`);
      }

      const acwrResult = await this.calculateACWR();
      if (acwrResult) {
        metrics.acwr = acwrResult.acwr;
        metrics.acwrScore = acwrResult.acwrScore;
        console.log(`✓ ACWR: ${acwrResult.acwr.toFixed(2)}`);
      }

      if (metrics.workouts?.length > 0) {
        metrics.recoveryEfficiency = await this.calculateRecovery(metrics);
        console.log(`✓ Recovery Efficiency: ${metrics.recoveryEfficiency.toFixed(1)}%`);
      }

      metrics.performanceIndex = await this.calculatePerformanceIndex(metrics);
      console.log(`✓ Performance Index: ${metrics.performanceIndex.toFixed(1)}`);

      await this.saveDailyMetrics(metrics);

      try {
        const bioAge = await this.calculateBioAge(today);
        if (bioAge) {
          console.log(`✓ BioAge: ${bioAge.bioAgeSmoothed.toFixed(1)}`);
        }
      } catch (e) {
        console.log('ℹ️ BioAge skipped - insufficient data or profile incomplete');
      }

      await this.cleanupOldData();

      this.lastSyncDate = new Date();
      await AsyncStorage.setItem(LAST_SYNC_DATE_KEY, this.lastSyncDate.toISOString());
      console.log('✅ Sync complete');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365);
    console.log('🗑 Cleaning up data older than', cutoffDate.toISOString().split('T')[0]);

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const oldMetricsKeys = allKeys.filter((key) => {
        if (key.startsWith(METRICS_STORAGE_PREFIX)) {
          const dateStr = key.replace(METRICS_STORAGE_PREFIX, '');
          const date = new Date(dateStr);
          return date < cutoffDate;
        }
        return false;
      });

      const oldBioAgeKeys = allKeys.filter((key) => {
        if (key.startsWith(BIOAGE_STORAGE_PREFIX)) {
          const dateStr = key.replace(BIOAGE_STORAGE_PREFIX, '');
          const date = new Date(dateStr);
          return date < cutoffDate;
        }
        return false;
      });

      const keysToDelete = [...oldMetricsKeys, ...oldBioAgeKeys];

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`✓ Cleaned up ${keysToDelete.length} old records`);
      } else {
        console.log('✓ No old data to clean up');
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old data:', error);
    }
  }

  // --- Age and Baseline Calculation Methods ---

  /**
   * Calculate age from date of birth with precise month/day handling
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Get age-appropriate norms for baseline calculations
   */
  getAgeGroupNorms(age: number) {
    if (age < 25) return { hrv: 70, restingHR: 60, vo2max: 48 };
    if (age < 35) return { hrv: 65, restingHR: 62, vo2max: 45 };
    if (age < 45) return { hrv: 60, restingHR: 65, vo2max: 42 };
    if (age < 55) return { hrv: 50, restingHR: 68, vo2max: 38 };
    if (age < 65) return { hrv: 45, restingHR: 70, vo2max: 35 };
    return { hrv: 40, restingHR: 72, vo2max: 32 };
  }

  /**
   * Get baselines with age-appropriate expected values
   */
  async getBaselines(): Promise<Baselines> {
    const profile = await this.fetchProfile();
    if (!profile?.dateOfBirth) {
      console.log('⚠️ No profile or date of birth found, using default baselines');
      throw new Error('No profile');
    }

    const age = this.calculateAge(profile.dateOfBirth);
    console.log(`✓ Calculated age: ${age} years`);

    const baselines: Baselines = {
      expectedHRV: age < 30 ? 65 : age < 40 ? 60 : age < 50 ? 50 : age < 60 ? 45 : 40,
      expectedRHR: age < 30 ? 62 : age < 40 ? 65 : age < 50 ? 68 : age < 60 ? 70 : 72,
      expectedVO2max: age < 30 ? 45 : age < 40 ? 42 : age < 50 ? 38 : age < 60 ? 35 : 32,
      hrMax: 220 - age,
      updatedAt: new Date(),
    };

    // Add aliases for compatibility
    baselines.restingHR = baselines.expectedRHR;
    baselines.hrv = baselines.expectedHRV;
    baselines.vo2max = baselines.expectedVO2max;

    console.log(`✓ Baselines for age ${age}:`, {
      HRV: baselines.expectedHRV,
      RHR: baselines.expectedRHR,
      VO2max: baselines.expectedVO2max,
      HRMax: baselines.hrMax,
    });

    return baselines;
  }

  /**
   * Fetch user profile from AsyncStorage
   */
  private async fetchProfile(): Promise<UserProfile | null> {
    try {
      const dobStr = await AsyncStorage.getItem(USER_DOB_KEY);
      const heightStr = await AsyncStorage.getItem(USER_HEIGHT_KEY);

      if (!dobStr) {
        console.log('⚠️ No date of birth found in profile');
        return null;
      }

      const profile: UserProfile = {
        dateOfBirth: new Date(dobStr),
        height: heightStr ? parseFloat(heightStr) : undefined,
      };

      return profile;
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      return null;
    }
  }

  /**
   * Load user profile from storage
   */
  async loadUserProfile(): Promise<{ dateOfBirth?: Date; height?: number } | null> {
    return this.fetchProfile();
  }

  // --- Private helper methods ---

  private calculateLoadScore(
    metrics: DailyMetrics,
    baselines: Baselines
  ): { loadScore: number; dailyLoad: number } {
    if (!metrics.workouts || metrics.workouts.length === 0) {
      return { loadScore: 0, dailyLoad: 0 };
    }

    const restingHR = metrics.restingHR || baselines.expectedRHR;
    const maxHR = baselines.hrMax;

    return calculateLoadScore(metrics.workouts, restingHR, maxHR);
  }

  private async calculateACWR(): Promise<{ acwr: number; acwrScore: number } | null> {
    try {
      // Load last 28 days of metrics
      const historicalMetrics = await this.loadHistoricalMetrics(28);

      if (historicalMetrics.length < 21) {
        console.log('ℹ️ Insufficient data for ACWR (need 21+ days)');
        return null;
      }

      // Extract daily load values
      const dailyLoads = historicalMetrics.map((m) => m.dailyLoad || 0);

      // Get last 7 days and last 28 days
      const last7Days = dailyLoads.slice(0, 7);
      const last28Days = dailyLoads;

      const result = calculateACWR(last7Days, last28Days);
      return result;
    } catch (error) {
      console.error('❌ Failed to calculate ACWR:', error);
      return null;
    }
  }

  private async calculateRecovery(metrics: DailyMetrics): Promise<number> {
    try {
      // Get the most recent workout
      const latestWorkout = metrics.workouts[metrics.workouts.length - 1];

      // Get 7-day average HRV
      const historicalMetrics = await this.loadHistoricalMetrics(7);
      const hrvValues = historicalMetrics
        .map((m) => m.hrv)
        .filter((v): v is number => v !== undefined && v > 0);

      const avgHRV =
        hrvValues.length > 0
          ? hrvValues.reduce((a, b) => a + b, 0) / hrvValues.length
          : undefined;

      return calculateRecoveryEfficiency(
        latestWorkout.peakHR,
        latestWorkout.hrAfter60s,
        metrics.hrv,
        avgHRV
      );
    } catch (error) {
      console.error('❌ Failed to calculate recovery:', error);
      return 50; // neutral baseline
    }
  }

  private async calculatePerformanceIndex(metrics: DailyMetrics): Promise<number> {
    try {
      const loadScore = metrics.loadScore || 0;
      const acwrScore = metrics.acwrScore || 50;
      const recoveryEfficiency = metrics.recoveryEfficiency || 50;

      const rawPI = calculatePerformanceIndex(loadScore, acwrScore, recoveryEfficiency);

      // Apply EMA smoothing
      const yesterday = subDays(new Date(), 1);
      const previousMetrics = await this.loadMetrics(yesterday);
      const previousPI = previousMetrics?.performanceIndex;

      const smoothedPI = applyEMA(rawPI, previousPI, 7);

      metrics.performanceIndexRaw = rawPI;
      return smoothedPI;
    } catch (error) {
      console.error('❌ Failed to calculate performance index:', error);
      return 50; // neutral baseline
    }
  }

  private async saveDailyMetrics(metrics: DailyMetrics): Promise<void> {
    try {
      const key = `${METRICS_STORAGE_PREFIX}${startOfDay(metrics.date).toISOString()}`;
      await AsyncStorage.setItem(key, JSON.stringify(metrics));
      console.log('✓ Saved daily metrics');
    } catch (error) {
      console.error('❌ Failed to save metrics:', error);
      throw error;
    }
  }

  private async calculateBioAge(date: Date): Promise<BioAgeData | null> {
    try {
      // Load user profile
      const dobStr = await AsyncStorage.getItem(USER_DOB_KEY);
      const heightStr = await AsyncStorage.getItem(USER_HEIGHT_KEY);

      if (!dobStr) {
        console.log('ℹ️ No date of birth found - skipping BioAge');
        return null;
      }

      const dateOfBirth = new Date(dobStr);
      const height = heightStr ? parseFloat(heightStr) : undefined;

      // Load today's metrics
      const metrics = await this.loadMetrics(date);
      if (!metrics) {
        console.log('ℹ️ No metrics found for today - skipping BioAge');
        return null;
      }

      // Load baselines
      const baselines = await this.getBaselines();

      // Load previous BioAge data for smoothing
      const yesterday = subDays(date, 1);
      const previousBioAge = await this.loadBioAge(yesterday);

      // Calculate BioAge
      const bioAgeData = await calculateBioAgeWithProfile(
        date,
        dateOfBirth,
        height,
        metrics,
        baselines,
        previousBioAge || undefined
      );

      if (bioAgeData) {
        // Save BioAge data
        await this.saveBioAge(date, bioAgeData);
        console.log('✓ BioAge calculated and saved');
      }

      return bioAgeData;
    } catch (error) {
      console.error('❌ Failed to calculate BioAge:', error);
      return null;
    }
  }

  // --- Public utility methods ---

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

  private async saveBioAge(date: Date, bioAge: BioAgeData): Promise<void> {
    try {
      const key = `${BIOAGE_STORAGE_PREFIX}${startOfDay(date).toISOString()}`;
      await AsyncStorage.setItem(key, JSON.stringify(bioAge));
    } catch (error) {
      console.error('❌ Failed to save BioAge:', error);
    }
  }

  async loadBioAge(date: Date): Promise<BioAgeData | null> {
    try {
      const key = `${BIOAGE_STORAGE_PREFIX}${startOfDay(date).toISOString()}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;

      const bioAge = JSON.parse(data);
      bioAge.date = new Date(bioAge.date);
      bioAge.computedAt = new Date(bioAge.computedAt);

      return bioAge;
    } catch (error) {
      console.error('❌ Failed to load BioAge:', error);
      return null;
    }
  }

  async getLastSyncDate(): Promise<Date | null> {
    try {
      const dateStr = await AsyncStorage.getItem(LAST_SYNC_DATE_KEY);
      return dateStr ? new Date(dateStr) : null;
    } catch (error) {
      console.error('❌ Failed to get last sync date:', error);
      return null;
    }
  }

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

  async setUserDateOfBirth(dateOfBirth: Date): Promise<Baselines> {
    try {
      // Save date of birth
      await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
      console.log('✓ Saved user date of birth');

      // Calculate and return baselines
      const baselines = await this.getBaselines();
      
      // Save baselines
      await AsyncStorage.setItem(BASELINES_STORAGE_KEY, JSON.stringify(baselines));
      console.log('✓ Calculated and saved baselines');

      return baselines;
    } catch (error) {
      console.error('❌ Failed to set user date of birth:', error);
      throw error;
    }
  }
}

export default SyncManager.getInstance();
