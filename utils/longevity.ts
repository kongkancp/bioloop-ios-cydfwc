
import { DailyMetrics } from '@/types/health';
import { BioAgeData } from './bioAge';

export interface LongevityFactor {
  name: string;
  description: string;
  impact: number; // -1 to 1 (normalized index)
  yearImpact: number; // Estimated years added/subtracted
  score: number; // 0-100 score
  icon: string; // SF Symbol name
  androidIcon: string; // Material icon name
  color: string; // Hex color
  recommendation: string;
}

export interface LongevityAnalysis {
  longevityScore: number; // 0-100
  ageGap: number; // Positive = younger, Negative = older
  estimatedHealthSpan: number; // Years
  potentialGain: number; // Total years that could be gained
  factors: LongevityFactor[];
  lastUpdated: Date;
}

/**
 * Calculate score from normalized index (-1 to 1 or 0 to 200)
 */
function calcScore(index: number | null): number {
  if (index === null) return 50;
  
  // If index is in 0-200 range (from bioAge calculations)
  if (index >= 0 && index <= 200) {
    return Math.max(0, Math.min(100, index / 2));
  }
  
  // If index is in -1 to 1 range
  return Math.max(0, Math.min(100, 50 + (index * 50)));
}

/**
 * Calculate sleep score based on duration
 */
function calcSleepScore(minutes: number | undefined): number {
  if (!minutes) return 50;
  
  const hours = minutes / 60;
  const optimalHours = 8;
  const deviation = Math.abs(hours - optimalHours);
  
  // Perfect score at 8 hours, -15 points per hour deviation
  return Math.max(0, Math.min(100, 100 - (deviation * 15)));
}

/**
 * Calculate workout frequency score
 */
function calcWorkoutScore(count: number | undefined): number {
  if (!count) return 0;
  
  const optimalCount = 4;
  // 100% at 4+ workouts per week
  return Math.min(100, (count / optimalCount) * 100);
}

/**
 * Calculate BMI score
 */
function calcBMIScore(weight: number | undefined, height: number | undefined): number {
  if (!weight || !height) return 50;
  
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const optimalBMI = 22;
  const deviation = Math.abs(bmi - optimalBMI);
  
  // Perfect score at BMI 22, -10 points per BMI point deviation
  return Math.max(0, Math.min(100, 100 - (deviation * 10)));
}

/**
 * Build longevity factors from metrics and bioAge data
 */
export function buildLongevityFactors(
  bioAge: BioAgeData | null,
  metrics: DailyMetrics | undefined,
  height: number | undefined
): LongevityFactor[] {
  const factors: LongevityFactor[] = [];

  // Cardiovascular Health (HRV + Resting HR)
  const autonomicIndex = bioAge?.indices?.autonomic ?? null;
  const autonomicScore = calcScore(autonomicIndex);
  const autonomicImpact = autonomicIndex !== null ? (autonomicIndex - 100) / 100 : 0;
  
  factors.push({
    name: 'Cardiovascular Health',
    description: 'HRV and resting heart rate',
    impact: autonomicImpact,
    yearImpact: autonomicImpact * -1.5,
    score: autonomicScore,
    icon: 'heart.fill',
    androidIcon: 'favorite',
    color: '#FF453A',
    recommendation: 'Track HRV daily for best results',
  });

  // Aerobic Fitness (VO2 Max)
  const vo2Index = bioAge?.indices?.vo2 ?? null;
  const vo2Score = calcScore(vo2Index);
  const vo2Impact = vo2Index !== null ? (vo2Index - 100) / 100 : 0;
  
  factors.push({
    name: 'Aerobic Fitness',
    description: 'VO2 Max capacity',
    impact: vo2Impact,
    yearImpact: vo2Impact * -1.2,
    score: vo2Score,
    icon: 'wind',
    androidIcon: 'air',
    color: '#0A84FF',
    recommendation: 'Maintain 3-4 cardio sessions weekly',
  });

  // Sleep Quality
  const sleepDuration = metrics?.sleepDuration;
  const sleepScore = calcSleepScore(sleepDuration);
  const sleepImpact = (sleepScore - 50) / 50;
  
  factors.push({
    name: 'Sleep Quality',
    description: 'Duration and consistency',
    impact: sleepImpact,
    yearImpact: sleepImpact * -0.8,
    score: sleepScore,
    icon: 'moon.zzz.fill',
    androidIcon: 'bedtime',
    color: '#BF5AF2',
    recommendation: 'Aim for 7-9 hours nightly',
  });

  // Exercise Frequency
  const workoutCount = metrics?.workouts?.length ?? 0;
  const workoutScore = calcWorkoutScore(workoutCount);
  const workoutImpact = (workoutScore - 50) / 50;
  
  factors.push({
    name: 'Exercise Frequency',
    description: 'Weekly workout count',
    impact: workoutImpact,
    yearImpact: workoutImpact * -0.5,
    score: workoutScore,
    icon: 'figure.run',
    androidIcon: 'directions-run',
    color: '#30D158',
    recommendation: 'Target 4-5 workouts per week',
  });

  // Body Composition (BMI)
  const bodyMass = metrics?.bodyMass;
  const bmiScore = calcBMIScore(bodyMass, height);
  const bmiImpact = (bmiScore - 50) / 50;
  
  factors.push({
    name: 'Body Composition',
    description: 'BMI management',
    impact: bmiImpact,
    yearImpact: bmiImpact * -0.5,
    score: bmiScore,
    icon: 'scalemass.fill',
    androidIcon: 'monitor-weight',
    color: '#FF9F0A',
    recommendation: 'Maintain healthy BMI range',
  });

  return factors;
}

/**
 * Calculate complete longevity analysis
 */
export function calculateLongevityData(
  bioAge: BioAgeData | null,
  metrics: DailyMetrics | undefined,
  chronologicalAge: number,
  height: number | undefined
): LongevityAnalysis {
  // Calculate age gap
  const bioAgeSmoothed = bioAge?.bioAgeSmoothed ?? chronologicalAge;
  const ageGap = chronologicalAge - bioAgeSmoothed;
  
  // Calculate longevity score (0-100)
  // Perfect score (100) when 20 years younger
  // Score 0 when 20 years older
  const longevityScore = Math.max(0, Math.min(100, 50 + (ageGap * 2.5)));
  
  // Estimate health span
  const baseHealthSpan = 78; // Average healthy lifespan
  const estimatedHealthSpan = Math.round(baseHealthSpan + (ageGap * 0.5));
  
  // Build factors
  const factors = buildLongevityFactors(bioAge, metrics, height);
  
  // Calculate potential gain (sum of absolute year impacts)
  const potentialGain = factors.reduce((sum, f) => {
    return sum + Math.abs(f.yearImpact);
  }, 0);
  
  return {
    longevityScore,
    ageGap,
    estimatedHealthSpan,
    potentialGain,
    factors,
    lastUpdated: new Date(),
  };
}

/**
 * Get color for longevity score
 */
export function getLongevityScoreColor(score: number): string {
  if (score >= 80) return '#30D158'; // Green
  if (score >= 65) return '#0A84FF'; // Blue
  if (score >= 50) return '#FF9F0A'; // Orange
  return '#FF453A'; // Red
}

/**
 * Get level text for longevity score
 */
export function getLongevityScoreLevel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Needs Improvement';
}
