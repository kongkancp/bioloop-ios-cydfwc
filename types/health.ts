
// TypeScript Data Models for BioLoop Health Analytics

export interface UserProfile {
  id: string;
  dateOfBirth: Date;
  height: number; // cm
  onboardingComplete: boolean;
  createdAt: Date;
}

export interface DailyMetrics {
  date: Date;
  restingHR?: number;
  hrv?: number;
  vo2max?: number;
  sleepDuration?: number;
  sleepConsistency?: number; // For BioAge calculation
  bodyMass?: number;
  height?: number; // For BioAge BMI calculation (in cm)
  workouts: WorkoutSession[];
  workoutsPerWeek?: number; // For BioAge calculation
  computedAt: Date;
  loadScore?: number; // 0-100 training stress score
  dailyLoad?: number; // Raw load value for ACWR calculation
  acwr?: number; // Acute to Chronic Workload Ratio
  acwrScore?: number; // ACWR converted to 0-100 score
  recoveryEfficiency?: number; // 0-100 cardiovascular recovery score
  performanceIndexRaw?: number; // Raw performance index (0-100)
  performanceIndex?: number; // Smoothed performance index with 7-day EMA (0-100)
  autonomicIndex?: number | null; // BioAge component (-1 to 1)
  vo2Index?: number | null; // BioAge component (-1 to 1)
  sleepIndex?: number; // BioAge component (-1 to 1)
  workoutIndex?: number; // BioAge component (-1 to 1)
  bmiIndex?: number; // BioAge component (-1 to 1)
  bioAge?: number; // Raw calculated biological age
  bioAgeSmoothed?: number; // Smoothed biological age (14-day EMA)
  longevityScore?: number; // BioAge vs Chronological Age score (0-100)
}

export interface WorkoutSession {
  startTime: Date;
  duration: number; // minutes
  averageHR: number;
  peakHR: number;
  hrAfter60s?: number; // Heart rate 60-90 seconds after workout ends
  type: string;
}

export interface Baselines {
  expectedHRV?: number;
  expectedRHR?: number;
  expectedVO2max?: number;
  hrMax?: number;
  restingHR?: number; // Alias for expectedRHR
  hrv?: number; // Alias for expectedHRV
  vo2max?: number; // Alias for expectedVO2max
  updatedAt?: Date;
}

export interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  icon: string;
  iosIcon: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

export enum HealthKitError {
  Unauthorized = 'unauthorized',
  DataUnavailable = 'dataUnavailable',
  QueryFailed = 'queryFailed',
  InvalidData = 'invalidData',
}
