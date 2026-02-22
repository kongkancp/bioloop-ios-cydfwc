
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAgeGapColor, getAgeGapEmoji } from '@/utils/bioAge';

interface BioAgeHeroCardProps {
  bioAge: number;
  chronologicalAge: number;
  ageGap: number;
}

export default function BioAgeHeroCard({
  bioAge,
  chronologicalAge,
  ageGap,
}: BioAgeHeroCardProps) {
  // Calculate age gap text
  // ageGap = chronologicalAge - bioAge
  // Positive ageGap means you're YOUNGER (chronological > bio)
  // Negative ageGap means you're OLDER (chronological < bio)
  const ageGapText = React.useMemo(() => {
    if (ageGap > 0.5) {
      // Positive gap = younger
      return `${ageGap.toFixed(1)} years younger`;
    } else if (ageGap < -0.5) {
      // Negative gap = older
      const absGap = Math.abs(ageGap);
      return `${absGap.toFixed(1)} years older`;
    }
    return 'Right on target';
  }, [ageGap]);

  // Get color based on age gap
  const color = React.useMemo(() => getAgeGapColor(ageGap), [ageGap]);

  // Get emoji based on age gap
  const emoji = React.useMemo(() => getAgeGapEmoji(ageGap), [ageGap]);

  // Format bio age display
  const bioAgeDisplay = bioAge.toFixed(1);

  // Format chronological age display
  const chronologicalAgeDisplay = `Chronological: ${chronologicalAge}`;

  return (
    <LinearGradient
      colors={[color, color + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Your Biological Age</Text>

        <View style={styles.ageRow}>
          <Text style={styles.ageValue}>{bioAgeDisplay}</Text>
          <Text style={styles.ageUnit}>years</Text>
        </View>

        <View style={styles.gapRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.gapText}>{ageGapText}</Text>
        </View>

        <Text style={styles.chronologicalText}>{chronologicalAgeDisplay}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 24,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  ageValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  ageUnit: {
    fontSize: 28,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 8,
  },
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginRight: 8,
  },
  gapText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chronologicalText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
