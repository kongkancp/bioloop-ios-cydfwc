
// Age-Adjusted Baselines Calculator
// Calculates expected health metric values based on age

import { Baselines } from '@/types/health';

/**
 * Calculate age-adjusted expected values for health metrics
 * Based on population averages for different age groups
 * 
 * @param age - User's age in years
 * @returns Baselines object with expected values
 */
export function calculateBaselines(age: number): Baselines {
  console.log('Baselines: Calculating age-adjusted baselines for age:', age);
  
  // Maximum heart rate (220 - age formula)
  const hrMax = 220 - age;
  
  // Expected HRV (Heart Rate Variability) in milliseconds
  // Higher values indicate better cardiovascular fitness and recovery
  const expectedHRV = age < 30 ? 65 :
                      age < 40 ? 60 :
                      age < 50 ? 50 :
                      age < 60 ? 45 : 40;
  
  // Expected Resting Heart Rate in beats per minute
  // Lower values generally indicate better cardiovascular fitness
  const expectedRHR = age < 30 ? 62 :
                      age < 40 ? 65 :
                      age < 50 ? 68 :
                      age < 60 ? 70 : 72;
  
  // Expected VO2 max in mL/kg/min
  // Measure of aerobic fitness - higher is better
  const expectedVO2max = age < 30 ? 45 :
                         age < 40 ? 42 :
                         age < 50 ? 38 :
                         age < 60 ? 35 : 32;
  
  const baselines: Baselines = {
    expectedHRV,
    expectedRHR,
    expectedVO2max,
    hrMax,
    updatedAt: new Date(),
  };
  
  console.log('Baselines: Calculated baselines:', {
    age,
    hrMax,
    expectedHRV,
    expectedRHR,
    expectedVO2max,
  });
  
  return baselines;
}

/**
 * Calculate age from date of birth
 * 
 * @param dateOfBirth - User's date of birth
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  console.log('Baselines: Calculated age from DOB:', age);
  return age;
}

/**
 * Get performance percentage compared to baseline
 * 
 * @param actual - Actual measured value
 * @param expected - Expected baseline value
 * @param higherIsBetter - Whether higher values are better (true for HRV, VO2max; false for RHR)
 * @returns Percentage (100 = at baseline, >100 = above baseline, <100 = below baseline)
 */
export function getPerformancePercentage(
  actual: number,
  expected: number,
  higherIsBetter: boolean = true
): number {
  if (higherIsBetter) {
    // For metrics where higher is better (HRV, VO2max)
    return Math.round((actual / expected) * 100);
  } else {
    // For metrics where lower is better (RHR)
    return Math.round((expected / actual) * 100);
  }
}
