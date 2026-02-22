
import { validateAndClamp } from './validation';
import { DailyMetrics, Baselines } from '@/types/health';
import { calculateAge, isValidAge } from './age';

export interface BioAgeIndices {
  autonomic: number | null;
  vo2: number | null;
  sleep: number | null;
  workout: number | null;
  bmi: number | null;
}

export interface BioAgeData {
  date: Date;
  chronologicalAge: number;
  indices: BioAgeIndices;
  offset: number;
  ageImpact: number;
  bioAge: number;
  bioAgeSmoothed: number;
  longevityScore: number;
  computedAt: Date;
}

/**
 * Calculate autonomic nervous system index from HRV and resting HR
 */
function calculateAutonomicIndex(
  hrv: number | undefined,
  restingHR: number | undefined,
  baselines: Baselines
): number | null {
  if (!hrv || !restingHR || !baselines.hrv || !baselines.restingHR) {
    return null;
  }

  const hrvScore = validateAndClamp((hrv / baselines.hrv) * 100, 0, 200);
  const hrScore = validateAndClamp((baselines.restingHR / restingHR) * 100, 0, 200);

  return (hrvScore + hrScore) / 2;
}

/**
 * Calculate VO2 max index
 */
function calculateVO2Index(
  vo2max: number | undefined,
  baselines: Baselines
): number | null {
  if (!vo2max || !baselines.vo2max) {
    return null;
  }

  return validateAndClamp((vo2max / baselines.vo2max) * 100, 0, 200);
}

/**
 * Calculate sleep quality index
 */
function calculateSleepIndex(
  sleepDuration: number | undefined,
  sleepConsistency: number | undefined
): number | null {
  if (!sleepDuration) {
    return null;
  }

  const optimalSleep = 8 * 60; // 8 hours in minutes
  const durationScore = validateAndClamp((sleepDuration / optimalSleep) * 100, 0, 200);

  if (sleepConsistency !== undefined) {
    return (durationScore + sleepConsistency) / 2;
  }

  return durationScore;
}

/**
 * Calculate workout frequency index
 */
function calculateWorkoutIndex(workoutsPerWeek: number | undefined): number | null {
  if (workoutsPerWeek === undefined) {
    return null;
  }

  const optimal = 4;
  return validateAndClamp((workoutsPerWeek / optimal) * 100, 0, 200);
}

/**
 * Calculate BMI index
 */
function calculateBMIIndex(
  height: number | undefined,
  bodyMass: number | undefined
): number | null {
  if (!height || !bodyMass) {
    return null;
  }

  const heightM = height / 100;
  const bmi = bodyMass / (heightM * heightM);

  const optimalBMI = 22;
  const deviation = Math.abs(bmi - optimalBMI);
  const score = Math.max(0, 100 - deviation * 10);

  return validateAndClamp(score, 0, 100);
}

/**
 * Calculate all BioAge component indices
 */
export function calculateBioAgeIndices(
  metrics: DailyMetrics,
  baselines: Baselines,
  height?: number
): BioAgeIndices {
  return {
    autonomic: calculateAutonomicIndex(metrics.hrv, metrics.restingHR, baselines),
    vo2: calculateVO2Index(metrics.vo2max, baselines),
    sleep: calculateSleepIndex(metrics.sleepDuration, metrics.sleepConsistency),
    workout: calculateWorkoutIndex(
      metrics.workouts ? metrics.workouts.length : undefined
    ),
    bmi: calculateBMIIndex(height, metrics.bodyMass),
  };
}

/**
 * Check if we have minimum data for BioAge calculation (3 of 5 components)
 */
export function hasMinimumData(indices: BioAgeIndices): boolean {
  const count = [
    indices.autonomic,
    indices.vo2,
    indices.sleep,
    indices.workout,
    indices.bmi,
  ].filter((x) => x !== null).length;

  return count >= 3;
}

/**
 * Calculate age offset from indices
 */
export function calculateAgeOffset(indices: BioAgeIndices): number {
  const values = [
    indices.autonomic,
    indices.vo2,
    indices.sleep,
    indices.workout,
    indices.bmi,
  ].filter((x) => x !== null) as number[];

  if (values.length === 0) return 0;

  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return average - 100;
}

/**
 * Convert offset to age impact (years)
 */
export function calculateAgeImpact(offset: number): number {
  return offset * 0.1;
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
  return chronologicalAge + ageImpact;
}

/**
 * Smooth BioAge using exponential moving average
 */
export function smoothBioAge(
  rawBioAge: number,
  previousSmoothed: number | undefined
): number {
  if (previousSmoothed === undefined) {
    return rawBioAge;
  }

  const alpha = 0.3;
  return alpha * rawBioAge + (1 - alpha) * previousSmoothed;
}

/**
 * Calculate longevity score (0-100)
 */
export function calculateLongevityScore(
  bioAge: number,
  chronologicalAge: number
): number {
  const ageGap = chronologicalAge - bioAge;
  const score = 50 + ageGap * 5;
  return validateAndClamp(score, 0, 100);
}

/**
 * Get color for age gap visualization
 */
export function getAgeGapColor(ageGap: number): string {
  if (ageGap >= 5) return '#10b981';
  if (ageGap >= 2) return '#22c55e';
  if (ageGap >= 0) return '#84cc16';
  if (ageGap >= -2) return '#eab308';
  if (ageGap >= -5) return '#f97316';
  return '#ef4444';
}

/**
 * Get emoji for age gap
 */
export function getAgeGapEmoji(ageGap: number): string {
  if (ageGap >= 5) return '🌟';
  if (ageGap >= 2) return '💪';
  if (ageGap >= 0) return '👍';
  if (ageGap >= -2) return '⚠️';
  if (ageGap >= -5) return '📉';
  return '🚨';
}

/**
 * Get message for age gap
 */
export function getAgeGapMessage(ageGap: number): string {
  if (ageGap >= 5) return 'Exceptional! You\'re aging slower than average.';
  if (ageGap >= 2) return 'Great! You\'re doing better than your age.';
  if (ageGap >= 0) return 'Good! You\'re on track with your age.';
  if (ageGap >= -2) return 'Fair. Room for improvement.';
  if (ageGap >= -5) return 'Needs attention. Focus on recovery.';
  return 'Critical. Prioritize health improvements.';
}

/**
 * Calculate BioAge with user profile integration (simplified signature for biology screen)
 * This version takes metrics and chronological age directly
 */
export function calculateBioAgeWithProfile(
  metrics: DailyMetrics,
  chronologicalAge: number,
  baselines?: Baselines,
  height?: number,
  previousBioAgeData?: BioAgeData
): BioAgeData | null {
  // Validate age range
  if (!isValidAge(chronologicalAge)) {
    console.error(`❌ Invalid age for BioAge calculation: ${chronologicalAge} (must be 18-100)`);
    return null;
  }

  console.log(`✓ Calculating BioAge for age ${chronologicalAge}`);

  // Use provided baselines or create default ones
  const effectiveBaselines: Baselines = baselines || {
    hrv: metrics.hrv || 50,
    restingHR: metrics.restingHR || 60,
    vo2max: metrics.vo2max || 40,
  };

  // Calculate all component indices
  const indices = calculateBioAgeIndices(metrics, effectiveBaselines, height);

  // Check if we have minimum required data (3 of 5 components)
  const componentCount = [
    indices.autonomic,
    indices.vo2,
    indices.sleep,
    indices.workout,
    indices.bmi,
  ].filter((x) => x !== null).length;

  if (componentCount < 3) {
    console.error(`❌ Insufficient data for BioAge: only ${componentCount}/5 components available`);
    return null;
  }

  console.log(`✓ BioAge calculation using ${componentCount}/5 components`);

  // Calculate age offset and impact
  const offset = calculateAgeOffset(indices);
  const ageImpact = calculateAgeImpact(offset);
  const rawBioAge = chronologicalAge + ageImpact;

  // Apply smoothing if we have previous data
  const smoothed = smoothBioAge(rawBioAge, previousBioAgeData?.bioAgeSmoothed);

  // Calculate longevity score
  const longevityScore = calculateLongevityScore(smoothed, chronologicalAge);

  // Create BioAge data object
  const data: BioAgeData = {
    date: metrics.date,
    chronologicalAge,
    indices,
    offset,
    ageImpact,
    bioAge: rawBioAge,
    bioAgeSmoothed: smoothed,
    longevityScore,
    computedAt: new Date(),
  };

  const ageGap = chronologicalAge - smoothed;
  console.log(
    `✓ BioAge: ${smoothed.toFixed(1)} years (gap: ${ageGap >= 0 ? '+' : ''}${ageGap.toFixed(1)} years)`
  );

  return data;
}

/**
 * Calculate BioAge with full profile data (for SyncManager)
 * This is the original signature that takes all parameters separately
 */
export async function calculateBioAgeWithFullProfile(
  date: Date,
  dateOfBirth: Date | undefined,
  height: number | undefined,
  metrics: DailyMetrics,
  baselines: Baselines,
  previousBioAgeData?: BioAgeData
): Promise<BioAgeData | null> {
  // Validate profile data
  if (!dateOfBirth) {
    console.error('❌ No date of birth found in profile');
    return null;
  }

  // Calculate age
  const age = calculateAge(dateOfBirth);
  
  // Use the simplified function
  return calculateBioAgeWithProfile(metrics, age, baselines, height, previousBioAgeData);
}
