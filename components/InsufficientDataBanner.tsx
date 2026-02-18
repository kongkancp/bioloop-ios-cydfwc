
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface InsufficientDataBannerProps {
  missing: string[];
}

export default function InsufficientDataBanner({ missing }: InsufficientDataBannerProps) {
  const missingText = missing.join(', ');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="warning"
          size={24}
          color="#FF9500"
        />
        <Text style={styles.title}>Incomplete Data</Text>
      </View>
      <Text style={styles.missingText}>Missing: {missingText}</Text>
      <Text style={styles.helpText}>
        Use Apple Watch for HRV and VO2 max tracking
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  missingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
