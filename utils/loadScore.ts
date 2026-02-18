
// Load Score Calculator
// Measures daily training stress using heart rate reserve

import { WorkoutSession } from '@/types/health';
import { clamp } from './validation';

/**
 * Calculate Heart Rate Reserve Ratio
 * HRR = (avgHR - restHR) / (maxHR - restHR)
 * 
 * @param avgHR - Average heart rate during workout
 * @param restHR - Resting heart rate
 * @param maxHR - Maximum heart rate (220 - age)
 * @returns Heart rate reserve ratio (0-1)
 */
export function calculateHRReserve(
  avgHR: number,
  restHR: number,
  maxHR: number
): number {
  const numerator = avgHR - restHR;
  const denominator = maxHR - restHR;
  
  if (denominator <= 0) {
    console.warn('LoadScore: Invalid HR denominator, returning 0');
    return 0;
  }
  
  const hrr = numerator / denominator;
  const clampedHRR = clamp(hrr, 0, 1) || 0;
  
  console.log('LoadScore: HR Reserve calculated:', {
    avgHR,
    restHR,
    maxHR,
    hrr: clampedHRR,
  });
  
  return clampedHRR;
}

/**
 * Calculate Session Load for a single workout
 * Uses exponential factor to amplify high intensity
 * 
 * @param workout - Workout session data
 * @param restingHR - User's resting heart rate
 * @param maxHR - User's maximum heart rate
 * @returns Session load value
 */
export function calculateSessionLoad(
  workout: WorkoutSession,
  restingHR: number,
  maxHR: number
): number {
  const duration = workout.duration;
  const avgHR = workout.averageHR;
  
  const hrr = calculateHRReserve(avgHR, restingHR, maxHR);
  
  // Exponential factor amplifies high intensity
  const intensityFactor = Math.exp(1.92 * hrr);
  const sessionLoad = duration * hrr * intensityFactor;
  
  console.log('LoadScore: Session load calculated:', {
    workoutType: workout.type,
    duration,
    avgHR,
    hrr,
    intensityFactor: intensityFactor.toFixed(2),
    sessionLoad: sessionLoad.toFixed(2),
  });
  
  return sessionLoad;
}

/**
 * Calculate Daily Load Score from all workouts
 * Aggregates session loads and applies log scaling to 0-100
 * 
 * @param workouts - Array of workout sessions
 * @param restingHR - User's resting heart rate
 * @param maxHR - User's maximum heart rate
 * @returns Load score (0-100) and raw daily load
 */
export function calculateLoadScore(
  workouts: WorkoutSession[],
  restingHR: number,
  maxHR: number
): { loadScore: number; dailyLoad: number } {
  if (workouts.length === 0) {
    console.log('LoadScore: No workouts, returning 0');
    return { loadScore: 0, dailyLoad: 0 };
  }
  
  console.log('LoadScore: Calculating load for', workouts.length, 'workouts');
  
  let dailyLoad = 0;
  for (const workout of workouts) {
    dailyLoad += calculateSessionLoad(workout, restingHR, maxHR);
  }
  
  // Log scaling to 0-100
  const loadScore = Math.log(dailyLoad + 1) * 15;
  const clampedScore = clamp(loadScore, 0, 100) || 0;
  
  console.log('LoadScore: Daily load calculated:', {
    workoutCount: workouts.length,
    dailyLoad: dailyLoad.toFixed(2),
    loadScore: clampedScore.toFixed(1),
  });
  
  return {
    loadScore: clampedScore,
    dailyLoad,
  };
}

/**
 * Get interpretation text for load score
 * 
 * @param score - Load score (0-100)
 * @returns Interpretation string
 */
export function getLoadInterpretation(score: number): string {
  if (score >= 86) return 'Maximum effort';
  if (score >= 61) return 'Hard session';
  if (score >= 31) return 'Moderate training';
  return 'Light day';
}

/**
 * Get color for load score visualization
 * 
 * @param score - Load score (0-100)
 * @returns Hex color string
 */
export function getLoadColor(score: number): string {
  if (score >= 86) return '#FF3B30'; // Red
  if (score >= 61) return '#FF9500'; // Orange
  if (score >= 31) return '#FFCC00'; // Yellow
  return '#34C759'; // Green
}
