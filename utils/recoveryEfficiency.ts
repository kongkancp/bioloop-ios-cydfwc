
// Recovery Efficiency Calculation
// Measures cardiovascular recovery using Heart Rate Recovery (HRR) and HRV Rebound

import { clamp } from './validation';

/**
 * Calculate Heart Rate Recovery (HRR) Score
 * Measures how quickly heart rate drops after exercise
 * 
 * @param peakHR - Peak heart rate during workout
 * @param hrAfter60s - Heart rate 60 seconds after workout ends
 * @returns HRR score (0-100)
 * 
 * Interpretation:
 * - 80-100: Excellent (48+ BPM drop)
 * - 60-79: Good (36-47 BPM drop)
 * - 40-59: Moderate (24-35 BPM drop)
 * - 0-39: Poor (<24 BPM drop)
 */
export function calculateHRRScore(
  peakHR: number,
  hrAfter60s: number
): number {
  const hrDrop = peakHR - hrAfter60s;
  
  // Normalize: 60+ BPM drop = 100
  const hrrScore = (hrDrop / 60) * 100;
  
  return clamp(hrrScore, 0, 100) || 0;
}

/**
 * Calculate HRV Rebound
 * Compares today's HRV to 7-day average
 * 
 * @param todayHRV - Today's HRV value
 * @param last7DaysAvgHRV - Average HRV over last 7 days
 * @returns Rebound ratio (e.g., 0.1 = 10% above average)
 */
export function calculateHRVRebound(
  todayHRV: number,
  last7DaysAvgHRV: number
): number {
  if (last7DaysAvgHRV === 0) {
    console.warn('RecoveryEfficiency: Cannot calculate HRV rebound - average is 0');
    return 0;
  }
  
  return (todayHRV - last7DaysAvgHRV) / last7DaysAvgHRV;
}

/**
 * Calculate Recovery Efficiency
 * Combines HRR (70% weight) and HRV Rebound (30% weight)
 * 
 * @param peakHR - Peak heart rate during workout (optional)
 * @param hrAfter60s - Heart rate 60s after workout (optional)
 * @param todayHRV - Today's HRV value (optional)
 * @param avgHRV - 7-day average HRV (optional)
 * @returns Recovery Efficiency score (0-100)
 */
export function calculateRecoveryEfficiency(
  peakHR?: number,
  hrAfter60s?: number,
  todayHRV?: number,
  avgHRV?: number
): number {
  let efficiency = 50; // neutral baseline
  
  // Component 1: HRR (70% weight)
  if (peakHR !== undefined && hrAfter60s !== undefined) {
    const hrrScore = calculateHRRScore(peakHR, hrAfter60s);
    efficiency = hrrScore * 0.7;
    console.log('RecoveryEfficiency: HRR Score:', hrrScore, '(70% weight)');
  } else {
    console.log('RecoveryEfficiency: HRR data not available, using baseline');
  }
  
  // Component 2: HRV Rebound (30% weight)
  if (todayHRV !== undefined && avgHRV !== undefined && avgHRV > 0) {
    const rebound = calculateHRVRebound(todayHRV, avgHRV);
    // Scale rebound to a 0-100 score
    // 0% rebound = 50, +100% rebound = 100, -100% rebound = 0
    const reboundScore = (rebound + 1) * 50;
    const clampedReboundScore = clamp(reboundScore, 0, 100) || 50;
    efficiency += clampedReboundScore * 0.3;
    console.log('RecoveryEfficiency: HRV Rebound:', rebound, 'Score:', clampedReboundScore, '(30% weight)');
  } else {
    console.log('RecoveryEfficiency: HRV rebound data not available');
  }
  
  const finalScore = clamp(efficiency, 0, 100) || 50;
  console.log('RecoveryEfficiency: Final score:', finalScore);
  
  return finalScore;
}

/**
 * Get interpretation text for Recovery Efficiency score
 */
export function getRecoveryEfficiencyInterpretation(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

/**
 * Get color for Recovery Efficiency score
 */
export function getRecoveryEfficiencyColor(score: number): string {
  if (score >= 80) return '#34C759'; // Green
  if (score >= 60) return '#FFCC00'; // Yellow
  if (score >= 40) return '#FF9500'; // Orange
  return '#FF3B30'; // Red
}

/**
 * Get detailed message for Recovery Efficiency score
 */
export function getRecoveryEfficiencyMessage(score: number): string {
  if (score >= 80) {
    return 'Your cardiovascular recovery is excellent. Your body is adapting well to training stress.';
  }
  if (score >= 60) {
    return 'Good recovery. Your heart rate and HRV are responding well to training.';
  }
  if (score >= 40) {
    return 'Moderate recovery. Consider lighter training or additional rest.';
  }
  return 'Poor recovery detected. Your body may need more rest before intense training.';
}
