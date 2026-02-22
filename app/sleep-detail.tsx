
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useDailySync } from '@/hooks/useDailySync';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import InfoCard from '@/components/InfoCard';
import EmptyDataView from '@/components/EmptyDataView';

interface Stage {
  name: string;
  hours: number;
  pct: number;
  icon: string;
  color: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroSubtext: {
    fontSize: 15,
    color: colors.secondaryText,
    marginTop: 4,
  },
  stagesCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageIcon: {
    width: 30,
    alignItems: 'center',
  },
  stageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stageName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  stageSubtext: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  stageValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  qualityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  qualityScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  qualityLevel: {
    fontSize: 15,
    marginTop: 4,
  },
  infoCardContainer: {
    marginBottom: 24,
  },
});

function SleepHeroCard({ totalHours }: { totalHours: number }) {
  const hoursText = totalHours.toFixed(1);
  const subtext = 'Total Sleep';

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Last Night</Text>
      <Text style={styles.heroValue}>{hoursText}h</Text>
      <Text style={styles.heroSubtext}>{subtext}</Text>
    </View>
  );
}

function SleepStagesCard() {
  const stages: Stage[] = [
    { name: 'Deep Sleep', hours: 1.5, pct: 20, icon: 'bedtime', color: '#5E5CE6' },
    { name: 'REM Sleep', hours: 1.8, pct: 24, icon: 'psychology', color: '#AF52DE' },
    { name: 'Light Sleep', hours: 3.2, pct: 43, icon: 'nightlight', color: '#32ADE6' },
    { name: 'Awake', hours: 1.0, pct: 13, icon: 'visibility', color: '#FF9500' },
  ];

  return (
    <View style={styles.stagesCard}>
      <Text style={styles.cardTitle}>Sleep Stages</Text>
      {stages.map((stage, index) => {
        const hoursText = stage.hours.toFixed(1);
        const pctText = `${stage.pct}%`;
        const subtextValue = `${hoursText}h`;

        return (
          <View key={index} style={styles.stageRow}>
            <View style={styles.stageIcon}>
              <IconSymbol
                ios_icon_name={stage.icon}
                android_material_icon_name={stage.icon}
                size={24}
                color={stage.color}
              />
            </View>
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>{stage.name}</Text>
              <Text style={styles.stageSubtext}>{subtextValue}</Text>
            </View>
            <Text style={styles.stageValue}>{pctText}</Text>
          </View>
        );
      })}
    </View>
  );
}

function SleepQualityCard({ score }: { score: number }) {
  const scoreText = Math.round(score).toString();
  const level = getQualityLevel(score);
  const color = getQualityColor(score);

  return (
    <View style={styles.qualityCard}>
      <Text style={styles.qualityLabel}>Sleep Quality Score</Text>
      <Text style={[styles.qualityScore, { color }]}>{scoreText}</Text>
      <Text style={[styles.qualityLevel, { color }]}>{level}</Text>
    </View>
  );
}

function getQualityLevel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

function getQualityColor(score: number): string {
  if (score >= 85) return '#34C759';
  if (score >= 70) return '#007AFF';
  if (score >= 50) return '#FF9500';
  return '#FF3B30';
}

export default function SleepDetailView() {
  const { loading, metrics, syncNow } = useDailySync();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Sleep Analysis',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasSleepData = metrics?.sleepDuration && metrics.sleepDuration > 0;

  if (!hasSleepData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Sleep Analysis',
            headerShown: true,
          }}
        />
        <EmptyDataView
          icon="bedtime"
          iosIcon="moon.fill"
          title="No Sleep Data"
          message="Sync HealthKit to see your sleep analysis and track your sleep quality over time."
          actionTitle="Sync Data"
          action={syncNow}
        />
      </SafeAreaView>
    );
  }

  const sleepHours = metrics.sleepDuration / 60;
  const sleepScore = Math.min(100, (metrics.sleepDuration / 480) * 100);

  const yourValueText = `${sleepHours.toFixed(1)}h`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Sleep Analysis',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollContent}>
        <SleepHeroCard totalHours={sleepHours} />
        <SleepStagesCard />
        <SleepQualityCard score={sleepScore} />
        
        <View style={styles.infoCardContainer}>
          <InfoCard
            title="About Sleep"
            icon="bedtime"
            description="Sleep is crucial for recovery and health. Adults need 7-9 hours of quality sleep per night for optimal physical and mental performance."
            idealRange="7-9 hours"
            yourValue={yourValueText}
            importance="critical"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
