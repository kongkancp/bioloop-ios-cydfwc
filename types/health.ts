
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
}

export interface WorkoutSession {
  startTime: Date;
  duration: number; // minutes
  averageHR: number;
  peakHR: number;
  hrAfter60s?: number;
  type: string;
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
