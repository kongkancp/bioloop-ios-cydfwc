
import React, { useState, useEffect } from 'react';
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
import { useDailySync } from '@/hooks/useDailySync';

// DayLoad interface for weekly chart
interface DayLoad {
  id: string;
  load: number;
  label: string;
}

// StrainHeroCard: Displays today's load score
function StrainHeroCard({ load }: { load: number }) {
  const getLevel = (l: number): string => {
    if (l >= 80) return 'Very High Strain';
    if (l >= 60) return 'High Strain';
    if (l >= 40) return 'Moderate Strain';
    return 'Low Strain';
  };

  const getColor = (l: number): string => {
    if (l >= 80) return colors.error;
    if (l >= 60) return colors.warning;
    if (l >= 40) return colors.primary;
    return colors.success;
  };

  const levelText = getLevel(load);
  const levelColor = getColor(load);
  const loadInt = Math.round(load);

  return (
    <View style={styles.card}>
      <Text style={styles.heroTitle}>Today's Load Score</Text>
      <View style={styles.heroDurationContainer}>
        <Text style={[styles.heroDurationValue, { color: levelColor }]}>
          {loadInt}
        </Text>
        <Text style={styles.heroDurationUnit}>/100</Text>
      </View>
      <Text style={[styles.heroQuality, { color: levelColor }]}>
        {levelText}
      </Text>
    </View>
  );
}

// WeeklyLoadChart: Displays bar chart of weekly training load
function WeeklyLoadChart() {
  const [days, setDays] = useState<DayLoad[]>([]);

  const getColor = (l: number): string => {
    if (l >= 80) return colors.error;
    if (l >= 60) return colors.warning;
    if (l >= 40) return colors.primary;
    return colors.success;
  };

  const getDayLabel = (i: number): string => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels[i];
  };

  const loadData = () => {
    const mockDays: DayLoad[] = [];
    for (let i = 0; i < 7; i++) {
      const randomLoad = Math.random() * 60 + 30; // 30-90 range
      mockDays.push({
        id: `day-${i}`,
        load: randomLoad,
        label: getDayLabel(i),
      });
    }
    setDays(mockDays);
  };

  useEffect(() => {
    loadData();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const cardPadding = 16 * 2;
  const contentPadding = 24 * 2;
  const chartWidth = screenWidth - cardPadding - contentPadding;
  const barSpacing = 8;
  const totalSpacing = barSpacing * (days.length - 1);
  const barWidth = (chartWidth - totalSpacing) / days.length;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Weekly Training Load</Text>
      <View style={styles.chartContainer}>
        {days.map((day) => {
          const barHeight = (day.load / 100) * 120;
          const barColor = getColor(day.load);
          const loadInt = Math.round(day.load);

          return (
            <View key={day.id} style={[styles.barContainer, { width: barWidth }]}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{loadInt}</Text>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ACWRCard: Placeholder for Acute to Chronic Workload Ratio
function ACWRCard({ metrics }: { metrics?: DailyMetrics }) {
  const acwr = metrics?.acwr;
  const acwrScore = metrics?.acwrScore;

  if (!acwr || !acwrScore) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Training Balance (ACWR)</Text>
        <Text style={styles.placeholderText}>
          ACWR metrics will appear after 28 days of data
        </Text>
      </View>
    );
  }

  const acwrFormatted = acwr.toFixed(2);
  const scoreInt = Math.round(acwrScore);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Training Balance (ACWR)</Text>
      <View style={styles.acwrContainer}>
        <Text style={styles.acwrValue}>{acwrFormatted}</Text>
        <Text style={styles.acwrScore}>Score: {scoreInt}/100</Text>
      </View>
    </View>
  );
}

// WorkoutsCard: Displays list of today's workouts
function WorkoutsCard({ metrics }: { metrics?: DailyMetrics }) {
  const workouts = metrics?.workouts ?? [];

  if (workouts.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Workouts</Text>
        <Text style={styles.placeholderText}>No workouts recorded today</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Today's Workouts</Text>
      {workouts.map((workout, index) => {
        const durationMin = Math.round(workout.duration);
        const avgHR = Math.round(workout.averageHR);
        const peakHR = Math.round(workout.peakHR);

        return (
          <View key={index} style={styles.workoutItem}>
            <Text style={styles.workoutType}>{workout.type}</Text>
            <View style={styles.workoutStats}>
              <Text style={styles.workoutStat}>{durationMin} min</Text>
              <Text style={styles.workoutStat}>Avg HR: {avgHR}</Text>
              <Text style={styles.workoutStat}>Peak HR: {peakHR}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Main StrainDetailView component
export default function StrainDetailView() {
  const { metrics } = useDailySync();
  const loadScore = metrics?.loadScore ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Training Strain',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <StrainHeroCard load={loadScore} />
          <WeeklyLoadChart />
          <ACWRCard metrics={metrics} />
          <WorkoutsCard metrics={metrics} />
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: 40,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  acwrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  acwrValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  acwrScore: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  workoutItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workoutType: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  placeholderText: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 15,
  },
});
