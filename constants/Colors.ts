
export const Colors = {
  // Backgrounds - LIGHT
  bgPrimary: '#FFFFFF',      // White
  bgSurface: '#F5F5F7',      // Light gray
  bgCard: '#FFFFFF',         // White cards
  borderSubtle: '#E5E5EA',   // Light borders
  
  // Accents - iOS standard
  accentBlue: '#007AFF',
  accentGreen: '#34C759',
  accentOrange: '#FF9500',
  accentRed: '#FF3B30',
  accentPurple: '#AF52DE',
  
  // Text - LIGHT
  textPrimary: '#000000',    // Black
  textSecondary: '#3C3C43',  // Dark gray
  textMuted: '#8E8E93',      // Medium gray
  
  divider: '#C6C6C8',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export function getScoreColor(score: number): string {
  if (score >= 80) return Colors.accentGreen;
  if (score >= 60) return Colors.accentBlue;
  if (score >= 40) return Colors.accentOrange;
  return Colors.accentRed;
}

export function getAgeGapColor(gap: number): string {
  if (gap > 2) return Colors.accentGreen;   // Younger
  if (gap > -2) return Colors.accentOrange; // Close
  return Colors.accentRed;                   // Older
}

export function getACWRColor(acwr: number): string {
  if (acwr >= 0.8 && acwr <= 1.3) return Colors.accentGreen;
  if ((acwr >= 0.6 && acwr < 0.8) || (acwr > 1.3 && acwr <= 1.5)) return Colors.accentOrange;
  return Colors.accentRed;
}
