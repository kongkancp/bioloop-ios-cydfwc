
// HealthKit Manager Service
// Handles all HealthKit data queries with defensive programming and validation
// This is a TypeScript wrapper that will interface with native HealthKit

import { DailyMetrics, WorkoutSession, HealthKitError } from '@/types/health';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_MODE_KEY = '@bioloop_mock_mode';

class HealthKitManager {
  private static instance: HealthKitManager;
  private healthKitAvailable: boolean = false;
  private mockMode: boolean = false;

  private constructor() {
    console.log('HealthKitManager: Initializing');
    this.healthKitAvailable = this.checkHealthKitAvailability();
    this.loadMockMode();
  }

  public static getInstance(): HealthKitManager {
    if (!HealthKitManager.instance) {
      HealthKitManager.instance = new HealthKitManager();
    }
    return HealthKitManager.instance;
  }

  private async loadMockMode(): Promise<void> {
    try {
      const mockModeValue = await AsyncStorage.getItem(MOCK_MODE_KEY);
      this.mockMode = mockModeValue === 'true';
      console.log('HealthKitManager: Mock mode:', this.mockMode);
    } catch (error) {
      console.error('HealthKitManager: Failed to load mock mode', error);
      this.mockMode = false;
    }
  }

  /**
   * Enable mock mode for App Store review
   * This simulates HealthKit permissions being granted
   */
  async enableMockMode(): Promise<void> {
    console.log('HealthKitManager: Enabling mock mode (simulated permissions)');
    this.mockMode = true;
    await AsyncStorage.setItem(MOCK_MODE_KEY, 'true');
  }

  /**
   * Disable mock mode
   */
  async disableMockMode(): Promise<void> {
    console.log('HealthKitManager: Disabling mock mode');
    this.mockMode = false;
    await AsyncStorage.setItem(MOCK_MODE_KEY, 'false');
  }

  /**
   * Check if mock mode is enabled
   */
  async isMockModeEnabled(): Promise<boolean> {
    try {
      const mockModeValue = await AsyncStorage.getItem(MOCK_MODE_KEY);
      return mockModeValue === 'true';
    } catch (error) {
      console.error('HealthKitManager: Failed to check mock mode', error);
      return false;
    }
  }

  private checkHealthKitAvailability(): boolean {
    // In a real implementation, this would check HKHealthStore.isHealthDataAvailable()
    console.log('HealthKitManager: Checking HealthKit availability');
    return true;
  }

  async requestAuthorization(): Promise<boolean> {
    try {
      console.log('HealthKitManager: Requesting HealthKit authorization');
      
      // If mock mode is enabled, simulate granted permissions
      if (this.mockMode) {
        console.log('HealthKitManager: Mock mode enabled - simulating granted permissions');
        return true;
      }
      
      // In a real implementation, this would call:
      // HKHealthStore.requestAuthorization(toShare: nil, read: healthKitReadTypes)
      // For the following types:
      // - Heart rate samples (HKQuantityType.heartRate)
      // - Resting heart rate (HKQuantityType.restingHeartRate)
      // - Heart rate variability SDNN (HKQuantityType.heartRateVariabilitySDNN)
      // - VO2 max (HKQuantityType.vo2Max)
      // - Workout type (HKWorkoutType)
      // - Sleep analysis (HKCategoryType.sleepAnalysis)
      // - Body mass (HKQuantityType.bodyMass)
      // - Height (HKQuantityType.height)
      // - Date of birth (HKCharacteristicType.dateOfBirth)
      
      // TODO: Implement native HealthKit authorization
      // This requires native iOS module integration
      console.log('HealthKitManager: Authorization request - native implementation required');
      return false;
    } catch (error) {
      console.error('HealthKitManager: Authorization failed', error);
      throw new Error(HealthKitError.Unauthorized);
    }
  }

  /**
   * Fetch daily metrics for a specific date
   * Queries HealthKit for all required data types
   */
  async fetchDailyMetrics(date: Date): Promise<DailyMetrics> {
    try {
      console.log('HealthKitManager: Fetching daily metrics for', date.toISOString());
      
      const authorized = await this.requestAuthorization();
      if (!authorized) {
        console.log('HealthKitManager: Not authorized, returning empty metrics');
        return {
          date: startOfDay(date),
          workouts: [],
          computedAt: new Date(),
        };
      }

      // If mock mode is enabled, generate realistic mock data
      if (this.mockMode) {
        console.log('HealthKitManager: Mock mode - generating simulated data');
        return this.generateMockMetrics(date);
      }

      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Query all metrics in parallel for efficiency
      const [restingHR, hrv, vo2max, sleepDuration, bodyMass, workouts] = await Promise.all([
        this.queryRestingHeartRate(dayStart, dayEnd),
        this.queryHRV(dayStart, dayEnd),
        this.queryVO2Max(),
        this.querySleepDuration(dayStart),
        this.queryBodyMass(dayStart, dayEnd),
        this.queryWorkouts(dayStart, dayEnd),
      ]);

      const metrics: DailyMetrics = {
        date: dayStart,
        restingHR,
        hrv,
        vo2max,
        sleepDuration,
        bodyMass,
        workouts,
        computedAt: new Date(),
      };

      console.log('HealthKitManager: Successfully fetched daily metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('HealthKitManager: Error fetching daily metrics', error);
      
      // Return default/empty metrics on error (defensive programming)
      return {
        date: startOfDay(date),
        workouts: [],
        computedAt: new Date(),
      };
    }
  }

  /**
   * Generate realistic mock metrics for demo/review purposes
   */
  private generateMockMetrics(date: Date): DailyMetrics {
    const dayStart = startOfDay(date);
    const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Add realistic variation
    const trend = Math.sin(daysAgo / 7) * 5;
    const randomVariation = (Math.random() - 0.5) * 10;

    // Resting HR: 58-66 bpm
    const restingHR = Math.max(55, Math.min(70, 62 + trend + randomVariation * 0.5));

    // HRV: 50-70 ms
    const hrv = Math.max(45, Math.min(75, 60 + trend * 1.5 + randomVariation));

    // VO2 Max: 38-46 ml/kg/min
    const vo2max = Math.max(38, Math.min(46, 42 + trend * 0.5 + randomVariation * 0.3));

    // Sleep: 6.5-8.5 hours (in minutes)
    const sleepDuration = Math.max(360, Math.min(540, (7.5 + trend * 0.2 + randomVariation * 0.15) * 60));

    // Body mass: 74-76 kg
    const bodyMass = Math.max(73, Math.min(77, 75 + randomVariation * 0.1));

    // Generate workouts (60% chance)
    const workouts: WorkoutSession[] = [];
    if (Math.random() > 0.4) {
      const numWorkouts = Math.random() > 0.7 ? 2 : 1;
      for (let i = 0; i < numWorkouts; i++) {
        workouts.push(this.generateMockWorkout(date, i));
      }
    }

    return {
      date: dayStart,
      restingHR,
      hrv,
      vo2max,
      sleepDuration,
      bodyMass,
      workouts,
      computedAt: new Date(),
    };
  }

  /**
   * Generate a realistic mock workout
   */
  private generateMockWorkout(date: Date, index: number): WorkoutSession {
    const workoutTypes = ['Running', 'Cycling', 'Swimming', 'Strength Training', 'HIIT'];
    const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];

    const startTime = new Date(date);
    if (index === 0) {
      startTime.setHours(7, 0, 0, 0);
    } else {
      startTime.setHours(18, 0, 0, 0);
    }

    const duration = 45 + Math.floor(Math.random() * 45);
    const averageHR = 145 + Math.floor(Math.random() * 30);
    const peakHR = 170 + Math.floor(Math.random() * 15);
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
   * Query Resting Heart Rate - Most recent sample from today
   * HKQuantityType.restingHeartRate
   */
  private async queryRestingHeartRate(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying resting heart rate');
      
      // Native implementation would use:
      // let type = HKQuantityType.restingHeartRate
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // Query for most recent sample
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Resting HR query - native implementation required');
      return undefined;
    } catch (error) {
      console.error('HealthKitManager: Error querying resting heart rate', error);
      return undefined;
    }
  }

  /**
   * Query HRV (SDNN) - Average of all samples from today
   * HKQuantityType.heartRateVariabilitySDNN
   */
  private async queryHRV(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying HRV (SDNN)');
      
      // Native implementation would use:
      // let type = HKQuantityType.heartRateVariabilitySDNN
      // Query all samples from today and calculate average
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: HRV query - native implementation required');
      return undefined;
    } catch (error) {
      console.error('HealthKitManager: Error querying HRV', error);
      return undefined;
    }
  }

  /**
   * Query VO2 Max - Most recent sample within 30 days
   * HKQuantityType.vo2Max
   */
  private async queryVO2Max(): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying VO2 Max');
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      const now = new Date();
      
      // Native implementation would use:
      // let type = HKQuantityType.vo2Max
      // let predicate = HKQuery.predicateForSamples(withStart: thirtyDaysAgo, end: now)
      // Query for most recent sample within 30 days
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: VO2 Max query - native implementation required');
      return undefined;
    } catch (error) {
      console.error('HealthKitManager: Error querying VO2 Max', error);
      return undefined;
    }
  }

  /**
   * Query Sleep Duration - Sum of all sleep stages from previous night
   * HKCategoryType.sleepAnalysis
   */
  private async querySleepDuration(forDate: Date): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying sleep duration');
      
      // Previous night ends at the start of the current day
      const previousNightEnd = startOfDay(forDate);
      const previousNightStart = subDays(previousNightEnd, 1);
      
      // Native implementation would use:
      // let type = HKCategoryType.sleepAnalysis
      // Query all sleep stages from previous night
      // Sum durations of all sleep stages (asleep, core, deep, REM)
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Sleep duration query - native implementation required');
      return undefined;
    } catch (error) {
      console.error('HealthKitManager: Error querying sleep duration', error);
      return undefined;
    }
  }

  /**
   * Query Body Mass - Most recent sample from today
   * HKQuantityType.bodyMass
   */
  private async queryBodyMass(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying body mass');
      
      // Native implementation would use:
      // let type = HKQuantityType.bodyMass
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // Query for most recent sample
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Body mass query - native implementation required');
      return undefined;
    } catch (error) {
      console.error('HealthKitManager: Error querying body mass', error);
      return undefined;
    }
  }

  /**
   * Query Workouts - All workouts from today
   * HKWorkoutType.workoutType()
   * For each: duration, avg HR, peak HR, HR 60s after
   */
  private async queryWorkouts(
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutSession[]> {
    try {
      console.log('HealthKitManager: Querying workouts');
      
      // Native implementation would use:
      // let workoutType = HKWorkoutType.workoutType()
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // For each workout, query:
      // - duration
      // - average heart rate
      // - peak heart rate
      // - heart rate 60 seconds after workout end
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Workouts query - native implementation required');
      return [];
    } catch (error) {
      console.error('HealthKitManager: Error querying workouts', error);
      return [];
    }
  }

  /**
   * Validate a number - check for nil, NaN, Infinity
   */
  private validateNumber(value: number | undefined | null): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    if (isNaN(value) || !isFinite(value)) {
      console.warn('HealthKitManager: Invalid number detected:', value);
      return undefined;
    }
    
    return value;
  }

  /**
   * Validate a workout session
   */
  private validateWorkout(workout: WorkoutSession): WorkoutSession {
    return {
      ...workout,
      duration: this.validateNumber(workout.duration) || 0,
      averageHR: this.validateNumber(workout.averageHR) || 0,
      peakHR: this.validateNumber(workout.peakHR) || 0,
      hrAfter60s: this.validateNumber(workout.hrAfter60s),
    };
  }
}

export default HealthKitManager.getInstance();
