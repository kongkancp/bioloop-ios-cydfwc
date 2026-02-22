
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAgeGapColor as getAgeGapColorUtil, getAgeGapEmoji } from '@/utils/bioAge';
import { getAgeGapColor } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

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
  const ageGapText = React.useMemo(() => {
    if (ageGap > 0.5) {
      return `${ageGap.toFixed(1)} years younger`;
    } else if (ageGap < -0.5) {
      const absGap = Math.abs(ageGap);
      return `${absGap.toFixed(1)} years older`;
    }
    return 'Right on target';
  }, [ageGap]);

  // Use BioLoop color function
  const color = React.useMemo(() => getAgeGapColor(ageGap), [ageGap]);

  // Get emoji based on age gap
  const emoji = React.useMemo(() => getAgeGapEmoji(ageGap), [ageGap]);

  // Format displays
  const bioAgeDisplay = bioAge.toFixed(1);
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
    ...Typography.sectionTitle,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 24,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  ageValue: {
    ...Typography.heroNumber,
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
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
