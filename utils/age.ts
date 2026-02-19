
/**
 * Calculate age from date of birth with precise month/day handling
 * @param dateOfBirth - The user's date of birth
 * @returns The calculated age in years
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate age is within acceptable range for BioAge calculation
 * @param age - The calculated age
 * @returns true if age is valid (18-100), false otherwise
 */
export function isValidAge(age: number): boolean {
  return age >= 18 && age <= 100;
}

/**
 * Format date of birth for display
 * @param dateOfBirth - The date of birth to format
 * @returns Formatted date string (e.g., "Jan 15, 1990")
 */
export function formatDateOfBirth(dateOfBirth: Date): string {
  const birth = new Date(dateOfBirth);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[birth.getMonth()]} ${birth.getDate()}, ${birth.getFullYear()}`;
}
