
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';

export type Importance = 'critical' | 'high' | 'medium';

interface InfoCardProps {
  title: string;
  icon: string;
  description: string;
  idealRange: string;
  yourValue: string;
  importance: Importance;
}

export default function InfoCard({
  title,
  icon,
  description,
  idealRange,
  yourValue,
  importance,
}: InfoCardProps) {
  const importanceColor = getImportanceColor(importance);
  const importanceLabel = getImportanceLabel(importance);

  return (
    <View style={[styles.container, { borderColor: importanceColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={Colors.accentBlue}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${importanceColor}20` }]}>
          <Text style={[styles.badgeText, { color: importanceColor }]}>
            {importanceLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.divider} />

      <View style={styles.valuesRow}>
        <View style={styles.valueColumn}>
          <Text style={styles.valueLabel}>Ideal Range</Text>
          <Text style={styles.valueText}>{idealRange}</Text>
        </View>
        <View style={styles.valueColumnRight}>
          <Text style={styles.valueLabelRight}>Your Value</Text>
          <Text style={[styles.valueText, { color: Colors.accentBlue }]}>
            {yourValue}
          </Text>
        </View>
      </View>
    </View>
  );
}

function getImportanceColor(importance: Importance): string {
  switch (importance) {
    case 'critical':
      return Colors.accentRed;
    case 'high':
      return Colors.accentOrange;
    case 'medium':
      return Colors.accentBlue;
    default:
      return Colors.accentBlue;
  }
}

function getImportanceLabel(importance: Importance): string {
  switch (importance) {
    case 'critical':
      return 'Critical';
    case 'high':
      return 'Important';
    case 'medium':
      return 'Supporting';
    default:
      return 'Supporting';
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginBottom: 16,
  },
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueColumn: {
    flex: 1,
  },
  valueColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  valueLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  valueLabelRight: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
