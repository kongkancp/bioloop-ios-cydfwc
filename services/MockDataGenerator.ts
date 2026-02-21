
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfDay, subDays } from 'date-fns';
import { DailyMetrics, WorkoutSession, Baselines } from '@/types/health';
import { BioAgeData } from '@/utils/bioAge';

const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const BIOAGE_STORAGE_PREFIX = '@bioloop_bioage_';
const BASELINES_STORAGE_KEY = '@bioloop_baselines';
const USER_DOB_KEY = '@bioloop_user_dob';
const USER_HEIGHT_KEY = '@bioloop_user_height';
const USER_WEIGHT_KEY = '@bioloop_user_weight';
const LAST_SYNC_DATE_KEY = '@bioloop_last_sync_date';

/**
 * Generate realistic mock health data for the app
 * This simulates 30 days of health metrics
 */
class MockDataGenerator {
  private static instance: MockDataGenerator;

  private constructor() {}

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  /**
   * Generate all mock data (profile, baselines, metrics, bioage)
   */
  async generateAllData(): Promise<void> {
    console.log('🎭 MockDataGenerator: Starting data generation...');

    try {
      // 1. Generate user profile
      await this.generateUserProfile();

      // 2. Generate baselines
      await this.generateBaselines();

      // 3. Generate 30 days of metrics
      await this.generateHistoricalMetrics(30);

      // 4. Set last sync date to today
      await AsyncStorage.setItem(LAST_SYNC_DATE_KEY, new Date().toISOString());

      console.log('✅ MockDataGenerator: All data generated successfully!');
    } catch (error) {
      console.error('❌ MockDataGenerator: Failed to generate data:', error);
      throw error;
    }
  }

  /**
   * Generate a realistic user profile
   */
  private async generateUserProfile(): Promise<void> {
    // Generate a 32-year-old user
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 32);
    dateOfBirth.setMonth(5); // June
    dateOfBirth.setDate(15);

    const height = 175; // cm
    const weight = 75; // kg

    await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
    await AsyncStorage.setItem(USER_HEIGHT_KEY, height.toString());
    await AsyncStorage.setItem(USER_WEIGHT_KEY, weight.toString());

    console.log('✓ Generated user profile: Age 32, Height 175cm, Weight 75kg');
  }

  /**
   * Generate age-appropriate baselines
   */
  private async generateBaselines(): Promise<void> {
    const baselines: Baselines = {
      expectedHRV: 60,
      expectedRHR: 62,
      expectedVO2max: 42,
      hrMax: 188, // 220 - 32
      restingHR: 62,
      hrv: 60,
      vo2max: 42,
      updatedAt: new Date(),
    };

    await AsyncStorage.setItem(BASELINES_STORAGE_KEY, JSON.stringify(baselines));
    console.log('✓ Generated baselines');
  }

  /**
   * Generate historical metrics for the past N days
   */
  private async generateHistoricalMetrics(days: number): Promise<void> {
    const today = startOfDay(new Date());

    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const metrics = this.generateDailyMetrics(date, i);
      const bioAge = this.generateBioAge(date, i);

      // Save metrics
      const metricsKey = `${METRICS_STORAGE_PREFIX}${date.toISOString()}`;
      await AsyncStorage.setItem(metricsKey, JSON.stringify(metrics));

      // Save bioage
      const bioAgeKey = `${BIOAGE_STORAGE_PREFIX}${date.toISOString()}`;
      await AsyncStorage.setItem(bioAgeKey, JSON.stringify(bioAge));
    }

    console.log(`✓ Generated ${days} days of historical data`);
  }

  /**
   * Generate realistic daily metrics with variation
   */
  private generateDailyMetrics(date: Date, daysAgo: number): DailyMetrics {
    // Add some realistic variation over time
    const trend = Math.sin(daysAgo / 7) * 5; // Weekly cycle
    const randomVariation = (Math.random() - 0.5) * 10;

    // Resting HR: 58-66 bpm
    const restingHR = 62 + trend + randomVariation * 0.5;

    // HRV: 50-70 ms
    const hrv = 60 + trend * 1.5 + randomVariation;

    // VO2 Max: 38-46 ml/kg/min
    const vo2max = 42 + trend * 0.5 + randomVariation * 0.3;

    // Sleep: 6.5-8.5 hours (in minutes)
    const sleepDuration = (7.5 + trend * 0.2 + randomVariation * 0.15) * 60;

    // Sleep consistency: 70-95%
    const sleepConsistency = 85 + randomVariation * 1.5;

    // Body mass: 74-76 kg
    const bodyMass = 75 + randomVariation * 0.1;

    // Generate workouts (60% chance of workout)
    const workouts: WorkoutSession[] = [];
    if (Math.random() > 0.4) {
      const numWorkouts = Math.random() > 0.7 ? 2 : 1;
      for (let i = 0; i < numWorkouts; i++) {
        workouts.push(this.generateWorkout(date, i));
      }
    }

    // Calculate load score (0-100)
    const loadScore = workouts.length > 0 ? 45 + randomVariation * 2 : 0;

    // Daily load for ACWR
    const dailyLoad = workouts.length > 0 ? 250 + randomVariation * 20 : 0;

    // ACWR: 0.8-1.3 (optimal range)
    const acwr = workouts.length > 0 ? 1.0 + (randomVariation * 0.05) : 0;
    const acwrScore = workouts.length > 0 ? 75 + randomVariation * 2 : 50;

    // Recovery efficiency: 60-90%
    const recoveryEfficiency = workouts.length > 0 ? 75 + randomVariation * 1.5 : 80;

    // Performance index: 60-85
    const performanceIndexRaw = 72 + trend + randomVariation;
    const performanceIndex = 72 + trend + randomVariation * 0.8; // Smoothed

    // Workouts per week (for BioAge)
    const workoutsPerWeek = 4 + Math.floor(randomVariation * 0.2);

    const metrics: DailyMetrics = {
      date,
      restingHR: Math.max(55, Math.min(70, restingHR)),
      hrv: Math.max(45, Math.min(75, hrv)),
      vo2max: Math.max(38, Math.min(46, vo2max)),
      sleepDuration: Math.max(360, Math.min(540, sleepDuration)),
      sleepConsistency: Math.max(70, Math.min(95, sleepConsistency)),
      bodyMass: Math.max(73, Math.min(77, bodyMass)),
      height: 175,
      workouts,
      workoutsPerWeek: Math.max(2, Math.min(6, workoutsPerWeek)),
      computedAt: date,
      loadScore: Math.max(0, Math.min(100, loadScore)),
      dailyLoad: Math.max(0, dailyLoad),
      acwr: workouts.length > 0 ? Math.max(0.5, Math.min(1.5, acwr)) : undefined,
      acwrScore: Math.max(0, Math.min(100, acwrScore)),
      recoveryEfficiency: Math.max(50, Math.min(95, recoveryEfficiency)),
      performanceIndexRaw: Math.max(50, Math.min(95, performanceIndexRaw)),
      performanceIndex: Math.max(50, Math.min(95, performanceIndex)),
    };

    return metrics;
  }

  /**
   * Generate a realistic workout session
   */
  private generateWorkout(date: Date, index: number): WorkoutSession {
    const workoutTypes = ['Running', 'Cycling', 'Swimming', 'Strength Training', 'HIIT'];
    const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];

    // Workout start time (morning or evening)
    const startTime = new Date(date);
    if (index === 0) {
      startTime.setHours(7, 0, 0, 0); // Morning workout
    } else {
      startTime.setHours(18, 0, 0, 0); // Evening workout
    }

    // Duration: 30-90 minutes
    const duration = 45 + Math.floor(Math.random() * 45);

    // Average HR: 130-160 bpm
    const averageHR = 145 + Math.floor(Math.random() * 30);

    // Peak HR: 160-185 bpm
    const peakHR = 170 + Math.floor(Math.random() * 15);

    // HR after 60s: 110-140 bpm (good recovery)
    const hrAfter60s = 125 + Math.floor(Math.random() * 15);

    return {
      startTime,
      duration,
      averageHR,
      peakHR,
      hrAfter60s,
      type,
    };
  }

  /**
   * Generate BioAge data
   */
  private generateBioAge(date: Date, daysAgo: number): BioAgeData {
    const chronologicalAge = 32;
    const trend = Math.sin(daysAgo / 7) * 0.5;
    const randomVariation = (Math.random() - 0.5) * 1;

    // BioAge: 28-32 (slightly younger than chronological)
    const bioAgeRaw = 30 + trend + randomVariation;
    const bioAgeSmoothed = 30 + trend + randomVariation * 0.7;

    // Age gap: -4 to 0 years
    const ageGap = bioAgeSmoothed - chronologicalAge;

    // Longevity score: 75-90
    const longevityScore = 82 + randomVariation * 5;

    // Component indices (-1 to 1)
    const autonomicIndex = 0.3 + randomVariation * 0.1;
    const vo2Index = 0.2 + randomVariation * 0.1;
    const sleepIndex = 0.25 + randomVariation * 0.1;
    const workoutIndex = 0.35 + randomVariation * 0.1;
    const bmiIndex = 0.1 + randomVariation * 0.05;

    return {
      date,
      chronologicalAge,
      bioAgeRaw: Math.max(28, Math.min(34, bioAgeRaw)),
      bioAgeSmoothed: Math.max(28, Math.min(34, bioAgeSmoothed)),
      ageGap: Math.max(-5, Math.min(2, ageGap)),
      longevityScore: Math.max(70, Math.min(95, longevityScore)),
      autonomicIndex: Math.max(-0.5, Math.min(0.8, autonomicIndex)),
      vo2Index: Math.max(-0.3, Math.min(0.7, vo2Index)),
      sleepIndex: Math.max(-0.2, Math.min(0.6, sleepIndex)),
      workoutIndex: Math.max(0, Math.min(0.8, workoutIndex)),
      bmiIndex: Math.max(-0.2, Math.min(0.3, bmiIndex)),
      computedAt: date,
    };
  }

  /**
   * Clear all mock data
   */
  async clearAllData(): Promise<void> {
    console.log('🗑️ MockDataGenerator: Clearing all data...');

    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const bioloopKeys = allKeys.filter(
        (key) =>
          key.startsWith('@bioloop_') ||
          key.startsWith(METRICS_STORAGE_PREFIX) ||
          key.startsWith(BIOAGE_STORAGE_PREFIX)
      );

      if (bioloopKeys.length > 0) {
        await AsyncStorage.multiRemove(bioloopKeys);
        console.log(`✓ Cleared ${bioloopKeys.length} keys`);
      }

      console.log('✅ MockDataGenerator: All data cleared');
    } catch (error) {
      console.error('❌ MockDataGenerator: Failed to clear data:', error);
      throw error;
    }
  }
}

export default MockDataGenerator.getInstance();
