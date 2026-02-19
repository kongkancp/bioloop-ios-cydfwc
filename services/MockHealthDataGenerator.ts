
// Mock Health Data Generator
// Simulates HealthKit data for testing and demonstration purposes

import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfDay, subDays } from 'date-fns';
import { DailyMetrics, WorkoutSession } from '@/types/health';

const MOCK_DATA_ENABLED_KEY = '@bioloop_mock_data_enabled';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const USER_DOB_KEY = '@bioloop_user_dob';
const USER_HEIGHT_KEY = '@bioloop_user_height';
const USER_WEIGHT_KEY = '@bioloop_user_weight';

class MockHealthDataGenerator {
  private static instance: MockHealthDataGenerator;

  private constructor() {
    console.log('MockHealthDataGenerator: Initialized');
  }

  static getInstance(): MockHealthDataGenerator {
    if (!MockHealthDataGenerator.instance) {
      MockHealthDataGenerator.instance = new MockHealthDataGenerator();
    }
    return MockHealthDataGenerator.instance;
  }

  /**
   * Enable mock data mode
   */
  async enableMockData(): Promise<void> {
    await AsyncStorage.setItem(MOCK_DATA_ENABLED_KEY, 'true');
    console.log('✓ Mock data mode enabled');
  }

  /**
   * Disable mock data mode
   */
  async disableMockData(): Promise<void> {
    await AsyncStorage.removeItem(MOCK_DATA_ENABLED_KEY);
    console.log('✓ Mock data mode disabled');
  }

  /**
   * Check if mock data mode is enabled
   */
  async isMockDataEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(MOCK_DATA_ENABLED_KEY);
    return enabled === 'true';
  }

  /**
   * Generate realistic mock profile data
   */
  async generateMockProfile(): Promise<void> {
    console.log('📝 Generating mock profile...');

    // Generate a date of birth (30 years old)
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 30);
    dateOfBirth.setMonth(5); // June
    dateOfBirth.setDate(15);

    // Generate height (175 cm)
    const height = 175;

    // Generate weight (70 kg)
    const weight = 70;

    await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
    await AsyncStorage.setItem(USER_HEIGHT_KEY, height.toString());
    await AsyncStorage.setItem(USER_WEIGHT_KEY, weight.toString());

    console.log('✓ Mock profile generated:', {
      dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      age: 30,
      height: `${height} cm`,
      weight: `${weight} kg`,
    });
  }

  /**
   * Generate realistic workout data
   */
  private generateWorkout(date: Date, workoutType: 'rest' | 'light' | 'moderate' | 'hard'): WorkoutSession[] {
    if (workoutType === 'rest') {
      return [];
    }

    const workouts: WorkoutSession[] = [];

    // Morning workout
    const morningStart = new Date(date);
    morningStart.setHours(7, 30, 0, 0);

    if (workoutType === 'light') {
      workouts.push({
        startTime: morningStart,
        duration: 30,
        averageHR: 125,
        peakHR: 145,
        hrAfter60s: 95,
        type: 'Walking',
      });
    } else if (workoutType === 'moderate') {
      workouts.push({
        startTime: morningStart,
        duration: 45,
        averageHR: 145,
        peakHR: 165,
        hrAfter60s: 110,
        type: 'Running',
      });
    } else if (workoutType === 'hard') {
      workouts.push({
        startTime: morningStart,
        duration: 60,
        averageHR: 160,
        peakHR: 180,
        hrAfter60s: 125,
        type: 'HIIT',
      });
    }

    return workouts;
  }

  /**
   * Generate realistic health metrics for a specific day
   */
  private generateDayMetrics(date: Date, dayIndex: number): DailyMetrics {
    // Create a realistic pattern over 30 days
    // Week 1: Light training
    // Week 2: Moderate training
    // Week 3: Hard training
    // Week 4: Recovery

    const weekNumber = Math.floor(dayIndex / 7);
    const dayOfWeek = dayIndex % 7;

    let workoutType: 'rest' | 'light' | 'moderate' | 'hard' = 'rest';
    let baseHRV = 55;
    let baseRestingHR = 62;
    let baseSleep = 7.5;

    // Determine workout intensity based on training cycle
    if (weekNumber === 0) {
      // Week 1: Light
      workoutType = dayOfWeek < 5 ? 'light' : 'rest';
      baseHRV = 60;
      baseRestingHR = 60;
      baseSleep = 7.8;
    } else if (weekNumber === 1) {
      // Week 2: Moderate
      workoutType = dayOfWeek < 5 ? 'moderate' : 'rest';
      baseHRV = 55;
      baseRestingHR = 63;
      baseSleep = 7.5;
    } else if (weekNumber === 2) {
      // Week 3: Hard
      workoutType = dayOfWeek < 4 ? 'hard' : dayOfWeek === 4 ? 'light' : 'rest';
      baseHRV = 48;
      baseRestingHR = 66;
      baseSleep = 7.0;
    } else {
      // Week 4: Recovery
      workoutType = dayOfWeek < 3 ? 'light' : 'rest';
      baseHRV = 62;
      baseRestingHR = 59;
      baseSleep = 8.0;
    }

    // Add some natural variation
    const hrvVariation = (Math.random() - 0.5) * 8;
    const rhrVariation = (Math.random() - 0.5) * 4;
    const sleepVariation = (Math.random() - 0.5) * 1.5;

    const workouts = this.generateWorkout(date, workoutType);

    const metrics: DailyMetrics = {
      date: startOfDay(date),
      restingHR: Math.round(baseRestingHR + rhrVariation),
      hrv: Math.round(baseHRV + hrvVariation),
      vo2max: 42 + (Math.random() - 0.5) * 3,
      sleepDuration: Math.max(6, Math.min(9, baseSleep + sleepVariation)),
      bodyMass: 70 + (Math.random() - 0.5) * 2,
      workouts,
      computedAt: new Date(),
    };

    return metrics;
  }

  /**
   * Generate 30 days of historical health data
   */
  async generateHistoricalData(days: number = 30): Promise<void> {
    console.log(`📊 Generating ${days} days of mock health data...`);

    const today = startOfDay(new Date());
    const metricsToSave: { key: string; data: string }[] = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const metrics = this.generateDayMetrics(date, days - i - 1);

      const key = `${METRICS_STORAGE_PREFIX}${date.toISOString()}`;
      metricsToSave.push({
        key,
        data: JSON.stringify(metrics),
      });
    }

    // Save all metrics in batch
    for (const item of metricsToSave) {
      await AsyncStorage.setItem(item.key, item.data);
    }

    console.log(`✓ Generated ${days} days of mock health data`);
    console.log('✓ Data includes:');
    console.log('  - Resting heart rate (59-66 bpm)');
    console.log('  - HRV (48-62 ms)');
    console.log('  - VO2 max (40-45 ml/kg/min)');
    console.log('  - Sleep duration (6.5-8.5 hours)');
    console.log('  - Body mass (69-71 kg)');
    console.log('  - Workouts (varied intensity)');
  }

  /**
   * Setup complete mock environment
   */
  async setupMockEnvironment(): Promise<void> {
    console.log('🚀 Setting up complete mock environment...');

    // Enable mock data mode
    await this.enableMockData();

    // Generate profile
    await this.generateMockProfile();

    // Generate 30 days of historical data
    await this.generateHistoricalData(30);

    console.log('✅ Mock environment setup complete!');
    console.log('');
    console.log('You can now:');
    console.log('  1. View your Performance Index on the Home tab');
    console.log('  2. See detailed metrics on the Activity tab');
    console.log('  3. Check your BioAge on the Biology tab');
    console.log('  4. Edit your profile on the Profile tab');
  }

  /**
   * Clear all mock data
   */
  async clearMockData(): Promise<void> {
    console.log('🗑 Clearing all mock data...');

    const allKeys = await AsyncStorage.getAllKeys();
    const mockKeys = allKeys.filter(
      (key) =>
        key.startsWith(METRICS_STORAGE_PREFIX) ||
        key === USER_DOB_KEY ||
        key === USER_HEIGHT_KEY ||
        key === USER_WEIGHT_KEY ||
        key === MOCK_DATA_ENABLED_KEY
    );

    if (mockKeys.length > 0) {
      await AsyncStorage.multiRemove(mockKeys);
      console.log(`✓ Cleared ${mockKeys.length} mock data items`);
    }

    console.log('✅ Mock data cleared');
  }
}

export default MockHealthDataGenerator.getInstance();
