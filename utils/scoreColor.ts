
import { Colors, getScoreColor as getScoreColorFromColors } from '@/constants/Colors';

/**
 * Global score color helper function
 * Maps a score (0-100) to a color based on performance thresholds
 * Uses BioLoop design colors
 */
export function getScoreColor(score: number): string {
  return getScoreColorFromColors(score);
}

/**
 * Get a descriptive level for a score
 */
export function getScoreLevel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Get color for inverse scores (lower is better, like resting heart rate)
 */
export function getInverseScoreColor(value: number, optimal: number, range: number): string {
  const deviation = Math.abs(value - optimal);
  const percentage = (deviation / range) * 100;
  
  if (percentage <= 10) return Colors.accentGreen;
  if (percentage <= 20) return Colors.accentBlue;
  if (percentage <= 30) return Colors.accentOrange;
  return Colors.accentRed;
}
