
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { DailyMetrics } from '@/types/health';
import { IconSymbol } from '@/components/IconSymbol';
import { useDailySync } from '@/hooks/useDailySync';

// Sleep Stage interface
interface SleepStage {
  name: string;
  hours: number;
  pct: number;
  icon: keyof typeof import('@expo/vector-icons/MaterialIcons').glyphMap;
  color: string;
}

// SleepHeroCard: Displays total sleep duration and quality
function SleepHeroCard({ duration }: { duration: number }) {
  const getQuality = (h: number): string => {
    if (h >= 8) return 'Excellent sleep';
    if (h >= 7) return 'Good sleep';
    if (h >= 6) return 'Fair sleep';
    return 'Poor sleep';
  };

  const getColor = (h: number): string => {
    if (h >= 8) return colors.success;
    if (h >= 7) return colors.primary;
    if (h >= 6) return colors.warning;
    return colors.error;
  };

  const qualityText = getQuality(duration);
  const qualityColor = getColor(duration);
  const durationFormatted = duration.toFixed(1);

  return (
    <View style={styles.card}>
      <Text style={styles.heroTitle}>Total Sleep</Text>
      <View style={styles.heroDurationContainer}>
        <Text style={styles.heroDurationValue}>{durationFormatted}</Text>
        <Text style={styles.heroDurationUnit}>hours</Text>
      </View>
      <Text style={[styles.heroQuality, { color: qualityColor }]}>
        {qualityText}
      </Text>
    </View>
  );
}

// SleepStagesCard: Displays a breakdown of sleep stages
function SleepStagesCard({ metrics }: { metrics?: DailyMetrics }) {
  // Mock data for sleep stages (replace with actual data from metrics when available)
  const stages: SleepStage[] = [
    {
      name: 'Awake',
      hours: 0.5,
      pct: 7,
      icon: 'visibility',
      color: colors.warning,
    },
    {
      name: 'REM',
      hours: 1.5,
      pct: 20,
      icon: 'bedtime',
      color: '#9333EA', // Purple
    },
    {
      name: 'Core',
      hours: 3.5,
      pct: 47,
      icon: 'nightlight',
      color: colors.primary,
    },
    {
      name: 'Deep',
      hours: 2.0,
      pct: 26,
      icon: 'dark-mode',
      color: '#4F46E5', // Indigo
    },
  ];

  const screenWidth = Dimensions.get('window').width;
  const cardPadding = 16 * 2;
  const contentPadding = 24 * 2;
  const progressBarWidth = screenWidth - cardPadding - contentPadding;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Sleep Stages</Text>
      {stages.map((stage, index) => {
        const stageHoursFormatted = stage.hours.toFixed(1);
        const stagePctFormatted = `${stage.pct}%`;
        const progressWidth = progressBarWidth * (stage.pct / 100);

        return (
          <View key={index} style={styles.stageItem}>
            <View style={styles.stageHeader}>
              <View style={styles.stageIconContainer}>
                <IconSymbol
                  android_material_icon_name={stage.icon}
                  size={24}
                  color={stage.color}
                />
              </View>
              <Text style={styles.stageName}>{stage.name}</Text>
              <View style={styles.stageDetails}>
                <Text style={styles.stageHours}>{stageHoursFormatted}h</Text>
                <Text style={styles.stagePct}>{stagePctFormatted}</Text>
              </View>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: progressWidth, backgroundColor: stage.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// SleepQualityCard: Placeholder for future implementation
function SleepQualityCard({ metrics }: { metrics?: DailyMetrics }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Sleep Quality</Text>
      <Text style={styles.placeholderText}>
        Sleep Quality metrics coming soon
      </Text>
    </View>
  );
}

// Main SleepDetailView component
export default function SleepDetailView() {
  const { metrics } = useDailySync();
  const sleepDuration = metrics?.sleepDuration ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Sleep Analysis',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <SleepHeroCard duration={sleepDuration} />
          <SleepStagesCard metrics={metrics} />
          <SleepQualityCard metrics={metrics} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroDurationContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroDurationValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroDurationUnit: {
    fontSize: 28,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  heroQuality: {
    fontSize: 15,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
  stageItem: {
    marginBottom: 16,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageIconContainer: {
    width: 30,
    marginRight: 8,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  stageDetails: {
    alignItems: 'flex-end',
  },
  stageHours: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  stagePct: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  placeholderText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 15,
  },
});
