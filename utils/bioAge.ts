
// BioAge Calculation Utilities
// Calculates biological age based on health metrics

import { DailyMetrics, Baselines } from '@/types/health';
import { validateAndClamp } from './validation';

export interface BioAgeIndices {
  autonomic: number | null;
  vo2: number | null;
  sleep: number;
  workout: number;
  bmi: number;
}

/**
 * Calculate autonomic index from HRV and Resting HR
 * Returns -1 (poor) to 1 (excellent) or null if insufficient data
 */
export function calculateAutonomicIndex(
  hrv: number | undefined,
  restingHR: number | undefined,
  baselines: Baselines
): number | null {
  if (hrv === undefined && restingHR === undefined) {
    return null;
  }

  let score = 0;
  let count = 0;

  if (hrv !== undefined) {
    const hrvRatio = hrv / baselines.expectedHRV;
    const hrvScore = validateAndClamp((hrvRatio - 1) * 2, -1, 1);
    score += hrvScore;
    count++;
  }

  if (restingHR !== undefined) {
    const rhrRatio = restingHR / baselines.expectedRHR;
    const rhrScore = validateAndClamp((1 - rhrRatio) * 2, -1, 1);
    score += rhrScore;
    count++;
  }

  return count > 0 ? score / count : null;
}

/**
 * Calculate VO2 index from VO2 max
 * Returns -1 (poor) to 1 (excellent) or null if insufficient data
 */
export function calculateVO2Index(
  vo2max: number | undefined,
  baselines: Baselines
): number | null {
  if (vo2max === undefined) {
    return null;
  }

  const vo2Ratio = vo2max / baselines.expectedVO2max;
  return validateAndClamp((vo2Ratio - 1) * 2, -1, 1);
}

/**
 * Calculate sleep index from sleep duration and consistency
 * Returns -1 (poor) to 1 (excellent)
 */
export function calculateSleepIndex(
  sleepDuration: number | undefined,
  sleepConsistency: number | undefined
): number {
  const duration = sleepDuration ?? 7;
  const consistency = sleepConsistency ?? 0.7;

  // Optimal sleep is 7-9 hours
  let durationScore = 0;
  if (duration >= 7 && duration <= 9) {
    durationScore = 1;
  } else if (duration >= 6 && duration < 7) {
    durationScore = 0.5;
  } else if (duration > 9 && duration <= 10) {
    durationScore = 0.5;
  } else if (duration < 6) {
    durationScore = -0.5;
  } else {
    durationScore = -0.5;
  }

  // Consistency score (0-1 scale)
  const consistencyScore = (consistency - 0.5) * 2;

  const sleepScore = (durationScore * 0.6) + (consistencyScore * 0.4);
  return validateAndClamp(sleepScore, -1, 1);
}

/**
 * Calculate workout index from workouts per week
 * Returns -1 (poor) to 1 (excellent)
 */
export function calculateWorkoutIndex(workoutsPerWeek: number | undefined): number {
  const workouts = workoutsPerWeek ?? 0;

  // Optimal is 3-5 workouts per week
  let score = 0;
  if (workouts >= 3 && workouts <= 5) {
    score = 1;
  } else if (workouts === 2 || workouts === 6) {
    score = 0.5;
  } else if (workouts === 1 || workouts === 7) {
    score = 0;
  } else if (workouts === 0) {
    score = -0.5;
  } else {
    score = -0.5; // Over-training
  }

  return validateAndClamp(score, -1, 1);
}

/**
 * Calculate BMI index from height and body mass
 * Returns -1 (poor) to 1 (excellent)
 */
export function calculateBMIIndex(
  height: number | undefined,
  bodyMass: number | undefined
): number {
  if (!height || !bodyMass) {
    return 0; // Neutral if no data
  }

  const heightM = height / 100; // Convert cm to meters
  const bmi = bodyMass / (heightM * heightM);

  // Optimal BMI is 18.5-24.9
  let score = 0;
  if (bmi >= 18.5 && bmi <= 24.9) {
    score = 1;
  } else if (bmi >= 17 && bmi < 18.5) {
    score = 0.5;
  } else if (bmi > 24.9 && bmi <= 27) {
    score = 0.5;
  } else if (bmi >= 15 && bmi < 17) {
    score = 0;
  } else if (bmi > 27 && bmi <= 30) {
    score = 0;
  } else {
    score = -0.5;
  }

  return validateAndClamp(score, -1, 1);
}

/**
 * Calculate all BioAge indices from metrics
 */
export function calculateBioAgeIndices(
  metrics: DailyMetrics,
  baselines: Baselines
): BioAgeIndices {
  return {
    autonomic: calculateAutonomicIndex(metrics.hrv, metrics.restingHR, baselines),
    vo2: calculateVO2Index(metrics.vo2max, baselines),
    sleep: calculateSleepIndex(metrics.sleepDuration, metrics.sleepConsistency),
    workout: calculateWorkoutIndex(metrics.workoutsPerWeek),
    bmi: calculateBMIIndex(metrics.height, metrics.bodyMass),
  };
}

/**
 * Check if we have minimum data to calculate BioAge
 */
export function hasMinimumData(indices: BioAgeIndices): boolean {
  // Need at least autonomic OR vo2, plus sleep
  return (indices.autonomic !== null || indices.vo2 !== null);
}

/**
 * Calculate weighted age offset from indices
 * Returns -1 to 1 (negative = younger, positive = older)
 */
export function calculateAgeOffset(indices: BioAgeIndices): number {
  let offset = 0;
  let totalWeight = 0;

  if (indices.autonomic !== null) {
    offset += indices.autonomic * 0.40;
    totalWeight += 0.40;
  }

  if (indices.vo2 !== null) {
    offset += indices.vo2 * 0.25;
    totalWeight += 0.25;
  }

  offset += indices.sleep * 0.15;
  totalWeight += 0.15;

  offset += indices.workout * 0.10;
  totalWeight += 0.10;

  offset += indices.bmi * 0.10;
  totalWeight += 0.10;

  if (totalWeight > 0) {
    offset = offset / totalWeight;
  }

  return validateAndClamp(offset, -1, 1);
}

/**
 * Calculate age impact in years from offset
 * Uses non-linear transformation for realistic impact
 */
export function calculateAgeImpact(offset: number): number {
  const amplifier = 8;
  const sharpness = 2;

  const nonlinear = 1 - Math.exp(-Math.abs(offset) * sharpness);
  const ageImpact = offset * amplifier * nonlinear;

  return validateAndClamp(ageImpact, -12, 12);
}

/**
 * Calculate raw biological age
 */
export function calculateRawBioAge(
  chronologicalAge: number,
  indices: BioAgeIndices
): number {
  const offset = calculateAgeOffset(indices);
  const ageImpact = calculateAgeImpact(offset);
  const bioAge = chronologicalAge + ageImpact;

  return validateAndClamp(bioAge, 18, 100);
}

/**
 * Apply 14-day EMA smoothing to BioAge
 * Limits daily change to ±1.5 years
 */
export function smoothBioAge(
  rawBioAge: number,
  previousSmoothed: number | undefined
): number {
  if (previousSmoothed === undefined) {
    return rawBioAge;
  }

  const period = 14;
  const alpha = 2 / (period + 1);

  let smoothed = (alpha * rawBioAge) + ((1 - alpha) * previousSmoothed);

  // Limit daily change to ±1.5 years
  const maxChange = 1.5;
  const change = smoothed - previousSmoothed;

  if (Math.abs(change) > maxChange) {
    const direction = change > 0 ? 1 : -1;
    smoothed = previousSmoothed + (direction * maxChange);
  }

  return smoothed;
}

/**
 * Calculate longevity score from age gap
 * Returns 0-100 (higher is better)
 */
export function calculateLongevityScore(
  bioAge: number,
  chronologicalAge: number
): number {
  const ageGap = bioAge - chronologicalAge;
  const longevityScore = 100 - (Math.abs(ageGap) * 5);

  return validateAndClamp(longevityScore, 0, 100);
}

/**
 * Get color for age gap display
 */
export function getAgeGapColor(ageGap: number): string {
  if (ageGap < -2) {
    return '#34C759'; // Green - significantly younger
  }
  if (ageGap < 0) {
    return '#30D158'; // Light green - younger
  }
  if (ageGap === 0) {
    return '#007AFF'; // Blue - on target
  }
  if (ageGap <= 2) {
    return '#FF9500'; // Orange - slightly older
  }
  return '#FF3B30'; // Red - significantly older
}

/**
 * Get emoji for age gap display
 */
export function getAgeGapEmoji(ageGap: number): string {
  if (ageGap < -5) {
    return '🌟';
  }
  if (ageGap < -2) {
    return '💪';
  }
  if (ageGap < 0) {
    return '✨';
  }
  if (ageGap === 0) {
    return '🎯';
  }
  if (ageGap <= 2) {
    return '⚠️';
  }
  if (ageGap <= 5) {
    return '⚡';
  }
  return '🔴';
}

/**
 * Get message for age gap display
 */
export function getAgeGapMessage(ageGap: number): string {
  if (ageGap < -5) {
    return 'Exceptional biological health! Your body is significantly younger than your age.';
  }
  if (ageGap < -2) {
    return 'Great work! Your biological age is notably younger than your chronological age.';
  }
  if (ageGap < 0) {
    return 'You\'re doing well. Your body is aging slower than average.';
  }
  if (ageGap === 0) {
    return 'You\'re right on target for your age. Keep up the good habits!';
  }
  if (ageGap <= 2) {
    return 'Your biological age is slightly higher. Focus on recovery and consistency.';
  }
  if (ageGap <= 5) {
    return 'There\'s room for improvement. Prioritize sleep, exercise, and stress management.';
  }
  return 'Your biological age needs attention. Consider consulting with a health professional.';
}
