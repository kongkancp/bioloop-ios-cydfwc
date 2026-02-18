
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
  bodyMass?: number;
  workouts: WorkoutSession[];
  computedAt: Date;
  loadScore?: number; // 0-100 training stress score
  dailyLoad?: number; // Raw load value for ACWR calculation
  acwr?: number; // Acute to Chronic Workload Ratio
  acwrScore?: number; // ACWR converted to 0-100 score
  recoveryEfficiency?: number; // 0-100 cardiovascular recovery score
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
  expectedHRV: number;
  expectedRHR: number;
  expectedVO2max: number;
  hrMax: number;
  updatedAt: Date;
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
