
// ACWR (Acute to Chronic Workload Ratio) Calculation
// Compares 7-day load to 28-day average to assess training load balance
// Optimal range: 0.8-1.3

import { clamp } from './validation';

export interface ACWRResult {
  acwr: number;
  acwrScore: number;
}

export interface ACWRInterpretation {
  risk: string;
  message: string;
  color: string;
}

/**
 * Calculate ACWR from historical load data
 * @param last7DaysLoad - Array of daily load values for the last 7 days
 * @param last28DaysLoad - Array of daily load values for the last 28 days
 * @returns ACWR ratio and score (0-100)
 */
export function calculateACWR(
  last7DaysLoad: number[],
  last28DaysLoad: number[]
): ACWRResult {
  console.log('ACWR: Calculating with 7-day loads:', last7DaysLoad.length, 'and 28-day loads:', last28DaysLoad.length);
  
  const acuteLoad = average(last7DaysLoad);
  const chronicLoad = average(last28DaysLoad);
  
  console.log('ACWR: Acute load (7-day avg):', acuteLoad);
  console.log('ACWR: Chronic load (28-day avg):', chronicLoad);
  
  // Handle division by zero
  if (chronicLoad === 0) {
    console.warn('ACWR: Chronic load is zero, returning default values');
    return { acwr: 0, acwrScore: 0 };
  }
  
  const acwr = acuteLoad / chronicLoad;
  const acwrScore = calculateACWRScore(acwr);
  
  console.log('ACWR: Calculated ratio:', acwr, 'score:', acwrScore);
  
  return { acwr, acwrScore };
}

/**
 * Calculate average of an array of numbers
 * @param values - Array of numbers
 * @returns Average value, or 0 if array is empty
 */
export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/**
 * Convert ACWR ratio to a 0-100 score
 * Optimal ACWR is 1.0 (acute = chronic)
 * Score decreases as deviation from 1.0 increases
 * @param acwr - ACWR ratio
 * @returns Score from 0-100
 */
export function calculateACWRScore(acwr: number): number {
  const deviation = Math.abs(1 - acwr);
  const score = 100 - (deviation * 120);
  
  return clamp(score, 0, 100) || 0;
}

/**
 * Get interpretation of ACWR ratio and score
 * @param acwr - ACWR ratio
 * @param score - ACWR score (0-100)
 * @returns Risk level, message, and color
 */
export function getACWRInterpretation(acwr: number, score: number): ACWRInterpretation {
  if (score >= 90) {
    return {
      risk: 'Optimal',
      message: 'Training load well-balanced',
      color: '#34C759',
    };
  }
  
  if (score >= 70) {
    return {
      risk: 'Caution',
      message: acwr > 1.3 ? 'Loading too quickly' : 'Undertraining risk',
      color: '#FFCC00',
    };
  }
  
  return {
    risk: 'High Risk',
    message: acwr > 1.5 ? 'Reduce volume' : 'Significant detraining',
    color: '#FF3B30',
  };
}

/**
 * Check if there is sufficient data to calculate ACWR
 * Requires at least 21 days of data for meaningful 28-day average
 * @param data - Array of historical load values
 * @returns True if sufficient data exists
 */
export function canCalculateACWR(data: number[]): boolean {
  const hasEnoughData = data.length >= 21;
  
  if (!hasEnoughData) {
    console.log('ACWR: Insufficient data - need 21+ days, have:', data.length);
  }
  
  return hasEnoughData;
}

/**
 * Get color for ACWR score visualization
 * @param score - ACWR score (0-100)
 * @returns Hex color code
 */
export function getACWRColor(score: number): string {
  if (score >= 90) return '#34C759'; // Green - Optimal
  if (score >= 70) return '#FFCC00'; // Yellow - Caution
  return '#FF3B30'; // Red - High Risk
}
