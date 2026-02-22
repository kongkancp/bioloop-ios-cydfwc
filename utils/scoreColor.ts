
/**
 * Global score color helper function
 * Maps a score (0-100) to a color based on performance thresholds
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#34C759'; // Green - Excellent
  if (score >= 65) return '#007AFF'; // Blue - Good
  if (score >= 50) return '#FF9500'; // Orange - Fair
  return '#FF3B30'; // Red - Poor
}

/**
 * Get a descriptive level for a score
 */
export function getScoreLevel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

/**
 * Get color for inverse scores (lower is better, like resting heart rate)
 */
export function getInverseScoreColor(value: number, optimal: number, range: number): string {
  const deviation = Math.abs(value - optimal);
  const percentage = (deviation / range) * 100;
  
  if (percentage <= 10) return '#34C759'; // Green - Excellent
  if (percentage <= 20) return '#007AFF'; // Blue - Good
  if (percentage <= 30) return '#FF9500'; // Orange - Fair
  return '#FF3B30'; // Red - Poor
}
