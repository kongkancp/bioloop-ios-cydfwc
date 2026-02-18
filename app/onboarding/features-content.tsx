
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function FeaturesContent() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>What You Get</Text>

        <View style={styles.featuresList}>
          <FeatureRow
            icon="show-chart"
            iosIcon="chart.bar.fill"
            title="Performance Lab"
            desc="Track load, ACWR, recovery"
          />
          <FeatureRow
            icon="favorite"
            iosIcon="heart.text.square.fill"
            title="BioAge 2.0"
            desc="Estimate biological age"
          />
          <FeatureRow
            icon="lock"
            iosIcon="lock.shield.fill"
            title="Privacy"
            desc="All data stays on device"
          />
          <FeatureRow
            icon="star"
            iosIcon="crown.fill"
            title="Premium"
            desc="30-day trends, export"
          />
        </View>

        <View style={styles.spacer} />

        <Text style={styles.swipeText}>Swipe to continue →</Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  iosIcon,
  title,
  desc,
}: {
  icon: string;
  iosIcon: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.iconContainer}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={icon}
          size={32}
          color="#0066FF"
        />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 108 : 60,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 32,
  },
  featuresList: {
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  swipeText: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingBottom: 40,
    textAlign: 'center',
  },
});
