
import { DailyMetrics, Baselines } from '@/types/health';
import { calculateAge } from './age';

/**
 * Age group norms for baseline calculations
 */
interface AgeGroupNorms {
  restingHR: number;
  hrv: number;
  vo2max: number;
  hrMax: number;
}

/**
 * Get age-appropriate norms for baseline calculations
 */
export function getAgeGroupNorms(age: number): AgeGroupNorms {
  // Calculate max heart rate
  const hrMax = Math.round(220 - age);

  if (age < 30) {
    return { restingHR: 60, hrv: 65, vo2max: 45, hrMax };
  } else if (age < 40) {
    return { restingHR: 62, hrv: 60, vo2max: 42, hrMax };
  } else if (age < 50) {
    return { restingHR: 64, hrv: 55, vo2max: 39, hrMax };
  } else if (age < 60) {
    return { restingHR: 66, hrv: 50, vo2max: 36, hrMax };
  } else {
    return { restingHR: 68, hrv: 45, vo2max: 33, hrMax };
  }
}

/**
 * Calculate baselines from historical metrics
 */
export function calculateBaselines(
  historicalMetrics: DailyMetrics[],
  dateOfBirth?: Date
): Baselines {
  if (historicalMetrics.length === 0) {
    // Use age-appropriate defaults if we have date of birth
    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      const norms = getAgeGroupNorms(age);
      console.log(`✓ Using age-appropriate defaults for age ${age}`);
      return {
        expectedRHR: norms.restingHR,
        expectedHRV: norms.hrv,
        expectedVO2max: norms.vo2max,
        hrMax: norms.hrMax,
        restingHR: norms.restingHR,
        hrv: norms.hrv,
        vo2max: norms.vo2max,
        updatedAt: new Date(),
      };
    }

    // Fallback to general defaults
    console.log('⚠️ No historical data or date of birth, using general defaults');
    return {
      expectedRHR: 65,
      expectedHRV: 60,
      expectedVO2max: 40,
      hrMax: 180,
      restingHR: 65,
      hrv: 60,
      vo2max: 40,
      updatedAt: new Date(),
    };
  }

  const validRestingHR = historicalMetrics
    .map((m) => m.restingHR)
    .filter((v): v is number => v !== undefined && v > 0);

  const validHRV = historicalMetrics
    .map((m) => m.hrv)
    .filter((v): v is number => v !== undefined && v > 0);

  const validVO2 = historicalMetrics
    .map((m) => m.vo2max)
    .filter((v): v is number => v !== undefined && v > 0);

  const baselines: Baselines = {
    expectedRHR:
      validRestingHR.length > 0
        ? validRestingHR.reduce((a, b) => a + b, 0) / validRestingHR.length
        : undefined,
    expectedHRV:
      validHRV.length > 0
        ? validHRV.reduce((a, b) => a + b, 0) / validHRV.length
        : undefined,
    expectedVO2max:
      validVO2.length > 0
        ? validVO2.reduce((a, b) => a + b, 0) / validVO2.length
        : undefined,
    updatedAt: new Date(),
  };

  // Fill in missing baselines with age-appropriate defaults if we have date of birth
  if (dateOfBirth) {
    const age = calculateAge(dateOfBirth);
    const norms = getAgeGroupNorms(age);

    if (!baselines.expectedRHR) baselines.expectedRHR = norms.restingHR;
    if (!baselines.expectedHRV) baselines.expectedHRV = norms.hrv;
    if (!baselines.expectedVO2max) baselines.expectedVO2max = norms.vo2max;
    baselines.hrMax = norms.hrMax;

    console.log(`✓ Baselines calculated with age ${age} norms as fallback`);
  } else {
    // Use general defaults for missing values
    if (!baselines.expectedRHR) baselines.expectedRHR = 65;
    if (!baselines.expectedHRV) baselines.expectedHRV = 60;
    if (!baselines.expectedVO2max) baselines.expectedVO2max = 40;
    baselines.hrMax = 180;

    console.log('✓ Baselines calculated with general defaults as fallback');
  }

  // Add aliases for compatibility
  baselines.restingHR = baselines.expectedRHR;
  baselines.hrv = baselines.expectedHRV;
  baselines.vo2max = baselines.expectedVO2max;

  return baselines;
}

/**
 * Get performance percentage relative to baseline
 */
export function getPerformancePercentage(
  current: number | undefined,
  baseline: number | undefined
): number {
  if (!current || !baseline) return 0;
  return Math.round((current / baseline) * 100);
}

// Re-export calculateAge for backward compatibility
export { calculateAge } from './age';
