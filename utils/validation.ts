
// Data Validation and Clamping Utilities
// Ensures all health metrics are within valid physiological ranges

import { DailyMetrics, WorkoutSession } from '@/types/health';

/**
 * Validates and clamps all metrics in a DailyMetrics object to safe ranges
 */
export function validateAndClamp(metrics: DailyMetrics): DailyMetrics {
  console.log('Validation: Clamping metrics to valid ranges');
  
  return {
    ...metrics,
    restingHR: clamp(metrics.restingHR, 30, 120),
    hrv: clamp(metrics.hrv, 0, 200),
    vo2max: clamp(metrics.vo2max, 10, 85),
    sleepDuration: clamp(metrics.sleepDuration, 0, 14), // hours
    bodyMass: clamp(metrics.bodyMass, 30, 300), // kg
    workouts: metrics.workouts.map(validateWorkout),
  };
}

/**
 * Clamps a value between min and max
 * Returns midpoint for undefined, NaN, or Infinity values
 */
export function clamp(
  value: number | undefined,
  min: number,
  max: number
): number | undefined {
  // Handle invalid values
  if (value === undefined || value === null) {
    return undefined;
  }
  
  if (isNaN(value) || !isFinite(value)) {
    console.warn(`Validation: Invalid value detected (${value}), returning undefined`);
    return undefined;
  }
  
  // Clamp to range
  const clamped = Math.max(min, Math.min(max, value));
  
  if (clamped !== value) {
    console.warn(`Validation: Value ${value} clamped to ${clamped} (range: ${min}-${max})`);
  }
  
  return clamped;
}

/**
 * Validates a workout session
 */
function validateWorkout(workout: WorkoutSession): WorkoutSession {
  return {
    ...workout,
    duration: clamp(workout.duration, 0, 1440) || 0, // max 24 hours in minutes
    averageHR: clamp(workout.averageHR, 30, 220) || 0,
    peakHR: clamp(workout.peakHR, 30, 220) || 0,
    hrAfter60s: clamp(workout.hrAfter60s, 30, 220),
  };
}
