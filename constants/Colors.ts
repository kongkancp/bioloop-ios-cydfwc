
export const Colors = {
  // Backgrounds
  bgPrimary: '#060A10',    // App background
  bgSurface: '#0D1421',    // Elevated surfaces
  bgCard: '#141C2A',       // Cards
  borderSubtle: '#1E2D42', // Borders
  
  // Accents
  accentBlue: '#0A84FF',
  accentGreen: '#30D158',
  accentOrange: '#FF9F0A',
  accentRed: '#FF453A',
  accentPurple: '#BF5AF2',
  
  // Text
  textPrimary: '#F5F5F7',
  textMuted: '#6E7A8A'
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
