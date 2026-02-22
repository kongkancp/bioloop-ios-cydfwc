
// HealthKit Manager Service
// Handles all HealthKit data queries with defensive programming and validation
// This is a TypeScript wrapper that will interface with native HealthKit

import { DailyMetrics, WorkoutSession, HealthKitError } from '@/types/health';
import { startOfDay, endOfDay, subDays } from 'date-fns';

class HealthKitManager {
  private static instance: HealthKitManager;
  private healthKitAvailable: boolean = false;

  private constructor() {
    console.log('HealthKitManager: Initializing');
    this.healthKitAvailable = this.checkHealthKitAvailability();
  }

  public static getInstance(): HealthKitManager {
    if (!HealthKitManager.instance) {
      HealthKitManager.instance = new HealthKitManager();
    }
    return HealthKitManager.instance;
  }

  private checkHealthKitAvailability(): boolean {
    // In a real implementation, this would check HKHealthStore.isHealthDataAvailable()
    console.log('HealthKitManager: Checking HealthKit availability');
    return true;
  }

  async requestAuthorization(): Promise<boolean> {
    try {
      console.log('HealthKitManager: Requesting HealthKit authorization');
      
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
