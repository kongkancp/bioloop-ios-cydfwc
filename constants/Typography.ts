
import { Colors } from './Colors';

export const Typography = {
  // Hero numbers (BioAge, scores)
  heroNumber: {
    fontSize: 64,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as const,
    color: Colors.textPrimary
  },
  
  // Large numbers (gauges)
  largeNumber: {
    fontSize: 48,
    fontWeight: '600' as const,
    color: Colors.textPrimary
  },
  
  // Section headers
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary
  },
  
  // Card titles
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary
  },
  
  // Body text
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textSecondary
  },
  
  // Captions
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textMuted
  }
};
