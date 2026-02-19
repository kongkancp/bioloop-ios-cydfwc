
// BioLoop Debug Helper
// Comprehensive logging and status reporting for debugging

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyMetrics, Baselines } from '@/types/health';
import { calculateAge } from './age';
import { startOfDay } from 'date-fns';

const STORAGE_KEYS = {
  USER_DOB: '@bioloop_user_dob',
  USER_HEIGHT: '@bioloop_user_height',
  USER_WEIGHT: '@bioloop_user_weight',
  METRICS_PREFIX: '@bioloop_metrics_',
  BASELINES: '@bioloop_baselines',
  BIOAGE_PREFIX: '@bioloop_bioage_',
  LAST_SYNC_DATE: '@bioloop_last_sync_date',
  ONBOARDING_COMPLETE: '@bioloop_onboarding_complete',
};

interface ProfileStatus {
  exists: boolean;
  dateOfBirth?: Date;
  age?: number;
  height?: number;
  weight?: number;
}

interface MetricsStatus {
  exists: boolean;
  date?: Date;
  restingHR?: number;
  hrv?: number;
  vo2max?: number;
  sleepDuration?: number;
  performanceIndex?: number;
  acwr?: number;
  loadScore?: number;
  recoveryEfficiency?: number;
  workoutCount?: number;
}

interface BioAgeStatus {
  exists: boolean;
  bioAge?: number;
  chronologicalAge?: number;
  ageGap?: number;
  longevityScore?: number;
}

interface BaselinesStatus {
  exists: boolean;
  restingHR?: number;
  hrv?: number;
  vo2max?: number;
}

interface DebugStatus {
  profile: ProfileStatus;
  metrics: MetricsStatus;
  bioAge: BioAgeStatus;
  baselines: BaselinesStatus;
  storage: {
    totalKeys: number;
    bioloopKeys: number;
  };
  lastSync?: Date;
  onboardingComplete: boolean;
}

class BioLoopDebugger {
  private static instance: BioLoopDebugger;

  private constructor() {}

  static getInstance(): BioLoopDebugger {
    if (!BioLoopDebugger.instance) {
      BioLoopDebugger.instance = new BioLoopDebugger();
    }
    return BioLoopDebugger.instance;
  }

  /**
   * Print comprehensive status to console
   */
  async printStatus(): Promise<void> {
    const status = await this.getStatus();
    
    console.log('\n' + '='.repeat(50));
    console.log('🔍 BIOLOOP STATUS');
    console.log('='.repeat(50));
    
    // Profile Status
    console.log('\n📋 PROFILE:');
    if (status.profile.exists) {
      console.log('  ✓ Profile exists');
      if (status.profile.dateOfBirth) {
        console.log(`  📅 Date of Birth: ${status.profile.dateOfBirth.toLocaleDateString()}`);
        console.log(`  🎂 Age: ${status.profile.age} years`);
      }
      if (status.profile.height) {
        console.log(`  📏 Height: ${status.profile.height} cm`);
      }
      if (status.profile.weight) {
        console.log(`  ⚖️  Weight: ${status.profile.weight} kg`);
      }
    } else {
      console.log('  ❌ No profile found');
    }
    
    // Metrics Status
    console.log('\n📊 METRICS:');
    if (status.metrics.exists) {
      console.log(`  ✓ Metrics exist for ${status.metrics.date?.toLocaleDateString()}`);
      if (status.metrics.restingHR !== undefined) {
        console.log(`  ❤️  Resting HR: ${status.metrics.restingHR.toFixed(0)} bpm`);
      } else {
        console.log('  ⚠️  Resting HR: Not available');
      }
      if (status.metrics.hrv !== undefined) {
        console.log(`  💓 HRV: ${status.metrics.hrv.toFixed(0)} ms`);
      } else {
        console.log('  ⚠️  HRV: Not available');
      }
      if (status.metrics.vo2max !== undefined) {
        console.log(`  🏃 VO2 Max: ${status.metrics.vo2max.toFixed(1)} ml/kg/min`);
      } else {
        console.log('  ⚠️  VO2 Max: Not available');
      }
      if (status.metrics.sleepDuration !== undefined) {
        console.log(`  😴 Sleep: ${status.metrics.sleepDuration.toFixed(1)} hours`);
      } else {
        console.log('  ⚠️  Sleep: Not available');
      }
      if (status.metrics.performanceIndex !== undefined) {
        console.log(`  📈 Performance Index: ${status.metrics.performanceIndex.toFixed(1)}`);
      }
      if (status.metrics.acwr !== undefined) {
        console.log(`  📊 ACWR: ${status.metrics.acwr.toFixed(2)}`);
      }
      if (status.metrics.loadScore !== undefined) {
        console.log(`  💪 Load Score: ${status.metrics.loadScore.toFixed(1)}`);
      }
      if (status.metrics.recoveryEfficiency !== undefined) {
        console.log(`  🔄 Recovery: ${status.metrics.recoveryEfficiency.toFixed(1)}%`);
      }
      if (status.metrics.workoutCount !== undefined) {
        console.log(`  🏋️  Workouts: ${status.metrics.workoutCount}`);
      }
    } else {
      console.log('  ❌ No metrics found');
    }
    
    // BioAge Status
    console.log('\n🧬 BIOAGE:');
    if (status.bioAge.exists) {
      console.log(`  ✓ BioAge: ${status.bioAge.bioAge?.toFixed(1)} years`);
      if (status.bioAge.chronologicalAge !== undefined) {
        console.log(`  📅 Chronological Age: ${status.bioAge.chronologicalAge} years`);
      }
      if (status.bioAge.ageGap !== undefined) {
        const gapSign = status.bioAge.ageGap >= 0 ? '+' : '';
        const emoji = status.bioAge.ageGap < -2 ? '🌟' : status.bioAge.ageGap > 2 ? '⚠️' : '💪';
        console.log(`  ${emoji} Age Gap: ${gapSign}${status.bioAge.ageGap.toFixed(1)} years`);
      }
      if (status.bioAge.longevityScore !== undefined) {
        console.log(`  🎯 Longevity Score: ${status.bioAge.longevityScore.toFixed(0)}`);
      }
    } else {
      console.log('  ❌ No BioAge data');
    }
    
    // Baselines Status
    console.log('\n📐 BASELINES:');
    if (status.baselines.exists) {
      console.log('  ✓ Baselines calculated');
      if (status.baselines.restingHR !== undefined) {
        console.log(`  ❤️  Baseline Resting HR: ${status.baselines.restingHR.toFixed(0)} bpm`);
      }
      if (status.baselines.hrv !== undefined) {
        console.log(`  💓 Baseline HRV: ${status.baselines.hrv.toFixed(0)} ms`);
      }
      if (status.baselines.vo2max !== undefined) {
        console.log(`  🏃 Baseline VO2 Max: ${status.baselines.vo2max.toFixed(1)} ml/kg/min`);
      }
    } else {
      console.log('  ❌ No baselines calculated');
    }
    
    // Storage Status
    console.log('\n💾 STORAGE:');
    console.log(`  📦 Total Keys: ${status.storage.totalKeys}`);
    console.log(`  🔑 BioLoop Keys: ${status.storage.bioloopKeys}`);
    
    // Sync Status
    console.log('\n🔄 SYNC:');
    if (status.lastSync) {
      console.log(`  ✓ Last Sync: ${status.lastSync.toLocaleString()}`);
    } else {
      console.log('  ⚠️  Never synced');
    }
    
    // Onboarding Status
    console.log('\n🚀 ONBOARDING:');
    console.log(`  ${status.onboardingComplete ? '✓' : '❌'} Complete: ${status.onboardingComplete}`);
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * Get comprehensive status object
   */
  async getStatus(): Promise<DebugStatus> {
    const profile = await this.getProfileStatus();
    const metrics = await this.getMetricsStatus();
    const bioAge = await this.getBioAgeStatus();
    const baselines = await this.getBaselinesStatus();
    const storage = await this.getStorageStatus();
    const lastSync = await this.getLastSyncDate();
    const onboardingComplete = await this.getOnboardingStatus();
    
    return {
      profile,
      metrics,
      bioAge,
      baselines,
      storage,
      lastSync,
      onboardingComplete,
    };
  }

  /**
   * Get profile status
   */
  private async getProfileStatus(): Promise<ProfileStatus> {
    try {
      const dobStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DOB);
      const heightStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_HEIGHT);
      const weightStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_WEIGHT);
      
      if (!dobStr) {
        return { exists: false };
      }
      
      const dateOfBirth = new Date(dobStr);
      const age = calculateAge(dateOfBirth);
      const height = heightStr ? parseFloat(heightStr) : undefined;
      const weight = weightStr ? parseFloat(weightStr) : undefined;
      
      return {
        exists: true,
        dateOfBirth,
        age,
        height,
        weight,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting profile status', error);
      return { exists: false };
    }
  }

  /**
   * Get metrics status for today
   */
  private async getMetricsStatus(): Promise<MetricsStatus> {
    try {
      const today = startOfDay(new Date());
      const key = `${STORAGE_KEYS.METRICS_PREFIX}${today.toISOString()}`;
      const metricsStr = await AsyncStorage.getItem(key);
      
      if (!metricsStr) {
        return { exists: false };
      }
      
      const metrics: DailyMetrics = JSON.parse(metricsStr);
      
      return {
        exists: true,
        date: new Date(metrics.date),
        restingHR: metrics.restingHR,
        hrv: metrics.hrv,
        vo2max: metrics.vo2max,
        sleepDuration: metrics.sleepDuration,
        performanceIndex: metrics.performanceIndex,
        acwr: metrics.acwr,
        loadScore: metrics.loadScore,
        recoveryEfficiency: metrics.recoveryEfficiency,
        workoutCount: metrics.workouts?.length,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting metrics status', error);
      return { exists: false };
    }
  }

  /**
   * Get BioAge status for today
   */
  private async getBioAgeStatus(): Promise<BioAgeStatus> {
    try {
      const today = startOfDay(new Date());
      const key = `${STORAGE_KEYS.BIOAGE_PREFIX}${today.toISOString()}`;
      const bioAgeStr = await AsyncStorage.getItem(key);
      
      if (!bioAgeStr) {
        return { exists: false };
      }
      
      const bioAgeData = JSON.parse(bioAgeStr);
      const ageGap = bioAgeData.bioAgeSmoothed - bioAgeData.chronologicalAge;
      
      return {
        exists: true,
        bioAge: bioAgeData.bioAgeSmoothed,
        chronologicalAge: bioAgeData.chronologicalAge,
        ageGap,
        longevityScore: bioAgeData.longevityScore,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting BioAge status', error);
      return { exists: false };
    }
  }

  /**
   * Get baselines status
   */
  private async getBaselinesStatus(): Promise<BaselinesStatus> {
    try {
      const baselinesStr = await AsyncStorage.getItem(STORAGE_KEYS.BASELINES);
      
      if (!baselinesStr) {
        return { exists: false };
      }
      
      const baselines: Baselines = JSON.parse(baselinesStr);
      
      return {
        exists: true,
        restingHR: baselines.restingHR,
        hrv: baselines.hrv,
        vo2max: baselines.vo2max,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting baselines status', error);
      return { exists: false };
    }
  }

  /**
   * Get storage statistics
   */
  private async getStorageStatus(): Promise<{ totalKeys: number; bioloopKeys: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const bioloopKeys = allKeys.filter(
        key => key.startsWith('@bioloop_') || key.includes('bioloop')
      );
      
      return {
        totalKeys: allKeys.length,
        bioloopKeys: bioloopKeys.length,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting storage status', error);
      return { totalKeys: 0, bioloopKeys: 0 };
    }
  }

  /**
   * Get last sync date
   */
  private async getLastSyncDate(): Promise<Date | undefined> {
    try {
      const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_DATE);
      return lastSyncStr ? new Date(lastSyncStr) : undefined;
    } catch (error) {
      console.error('DebugHelper: Error getting last sync date', error);
      return undefined;
    }
  }

  /**
   * Get onboarding status
   */
  private async getOnboardingStatus(): Promise<boolean> {
    try {
      const onboardingStr = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return onboardingStr === 'true';
    } catch (error) {
      console.error('DebugHelper: Error getting onboarding status', error);
      return false;
    }
  }

  /**
   * Log a formatted message with timestamp
   */
  log(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}]`;
    
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Log an error with context
   */
  error(category: string, message: string, error?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ❌`;
    
    if (error !== undefined) {
      console.error(prefix, message, error);
    } else {
      console.error(prefix, message);
    }
  }

  /**
   * Log a success message
   */
  success(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ✓`;
    
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Log a warning
   */
  warn(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ⚠️`;
    
    if (data !== undefined) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }
}

export default BioLoopDebugger.getInstance();
