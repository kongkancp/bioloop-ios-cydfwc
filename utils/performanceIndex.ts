
// Performance Index Calculation
// Unified training score combining Load (40%), ACWR (30%), and Recovery (30%)
// Uses 7-day Exponential Moving Average for smoothing

import { clamp } from './validation';

export interface PerformanceIndexResult {
  performanceIndexRaw: number;
  performanceIndex: number; // smoothed with EMA
}

export interface PerformanceLevel {
  level: string;
  color: string;
}

/**
 * Calculate Performance Index from component scores
 * 
 * @param loadScore - Training volume driver (0-100)
 * @param acwrScore - Sustainability score (0-100)
 * @param recoveryEfficiency - Readiness score (0-100)
 * @returns Raw performance index (0-100)
 * 
 * Weights:
 * - Load: 40% (training volume driver)
 * - ACWR: 30% (sustainability)
 * - Recovery: 30% (readiness)
 */
export function calculatePerformanceIndex(
  loadScore: number,
  acwrScore: number,
  recoveryEfficiency: number
): number {
  console.log('PerformanceIndex: Calculating with components:', {
    loadScore,
    acwrScore,
    recoveryEfficiency,
  });
  
  const trendIndex = 
    (loadScore * 0.4) +        // Training volume driver
    (acwrScore * 0.3) +        // Sustainability
    (recoveryEfficiency * 0.3); // Readiness
  
  const clampedIndex = clamp(trendIndex, 0, 100) || 0;
  
  console.log('PerformanceIndex: Raw index calculated:', clampedIndex);
  
  return clampedIndex;
}

/**
 * Apply Exponential Moving Average smoothing
 * 
 * @param currentValue - Current raw value
 * @param previousEMA - Previous EMA value (undefined for first calculation)
 * @param period - EMA period (default: 7 days)
 * @returns Smoothed value
 */
export function applyEMA(
  currentValue: number,
  previousEMA: number | undefined,
  period: number = 7
): number {
  // First value - no previous EMA
  if (previousEMA === undefined) {
    console.log('PerformanceIndex: First EMA calculation, using raw value:', currentValue);
    return currentValue;
  }
  
  // Calculate smoothing factor (alpha)
  const alpha = 2 / (period + 1);
  
  // EMA formula: alpha * current + (1 - alpha) * previous
  const ema = (alpha * currentValue) + ((1 - alpha) * previousEMA);
  
  console.log('PerformanceIndex: EMA calculated:', {
    currentValue,
    previousEMA,
    alpha: alpha.toFixed(3),
    ema: ema.toFixed(2),
  });
  
  return ema;
}

/**
 * Get performance level interpretation
 * 
 * @param index - Performance index (0-100)
 * @returns Level name and color
 */
export function getPerformanceLevel(index: number): PerformanceLevel {
  if (index >= 80) {
    return { level: 'Peak', color: '#34C759' };
  }
  if (index >= 65) {
    return { level: 'Strong', color: '#30D158' };
  }
  if (index >= 50) {
    return { level: 'Moderate', color: '#FFCC00' };
  }
  if (index >= 35) {
    return { level: 'Developing', color: '#FF9500' };
  }
  return { level: 'Foundation', color: '#FF3B30' };
}

/**
 * Get detailed message for performance level
 * 
 * @param index - Performance index (0-100)
 * @returns Descriptive message
 */
export function getPerformanceMessage(index: number): string {
  if (index >= 80) {
    return 'You are performing at peak level. Your training load, sustainability, and recovery are all optimized.';
  }
  if (index >= 65) {
    return 'Strong performance. Your training is well-balanced and you are making good progress.';
  }
  if (index >= 50) {
    return 'Moderate performance. Consider optimizing your training load or recovery strategies.';
  }
  if (index >= 35) {
    return 'Developing performance. Focus on building consistency in training and recovery.';
  }
  return 'Foundation level. Start with lighter training and prioritize recovery to build a solid base.';
}

/**
 * Get color for performance index visualization
 * 
 * @param index - Performance index (0-100)
 * @returns Hex color code
 */
export function getPerformanceColor(index: number): string {
  return getPerformanceLevel(index).color;
}
