
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useDailySync } from '@/hooks/useDailySync';
import { DailyMetrics } from '@/types/health';
import EmptyDataView from '@/components/EmptyDataView';
import InfoCard from '@/components/InfoCard';

interface DayLoad {
  id: string;
  load: number;
  label: string;
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
  },
  heroSubtext: {
    fontSize: 15,
    marginTop: 4,
  },
  chartCard: {
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 40,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 11,
    color: colors.text,
    marginTop: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  acwrCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  acwrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  acwrLabel: {
    fontSize: 15,
    color: colors.secondaryText,
  },
  acwrValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  workoutsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  workoutType: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  workoutDuration: {
    fontSize: 15,
    color: colors.secondaryText,
  },
  infoCardContainer: {
    marginBottom: 24,
  },
});

function StrainHeroCard({ load }: { load: number }) {
  const loadText = Math.round(load).toString();
  const level = getLevel(load);
  const color = getColor(load);

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Training Load</Text>
      <Text style={[styles.heroValue, { color }]}>{loadText}</Text>
      <Text style={[styles.heroSubtext, { color }]}>{level}</Text>
    </View>
  );
}

function getLevel(l: number): string {
  if (l >= 80) return 'Very High Strain';
  if (l >= 60) return 'High Strain';
  if (l >= 40) return 'Moderate Strain';
  return 'Low Strain';
}

function getColor(l: number): string {
  if (l >= 80) return '#FF3B30';
  if (l >= 60) return '#FF9500';
  if (l >= 40) return '#007AFF';
  return '#34C759';
}

function WeeklyLoadChart() {
  const [days, setDays] = useState<DayLoad[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const mockDays: DayLoad[] = [];
    for (let i = 0; i < 7; i++) {
      mockDays.push({
        id: `day-${i}`,
        load: Math.random() * 60 + 20,
        label: getDayLabel(i),
      });
    }
    setDays(mockDays);
  };

  const getDayLabel = (i: number): string => {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return labels[i];
  };

  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Weekly Load</Text>
      <View style={styles.chartContainer}>
        {days.map((day) => {
          const height = (day.load / 100) * 100;
          const heightValue = height;
          const color = getColor(day.load);
          const loadText = Math.round(day.load).toString();

          return (
            <View key={day.id} style={styles.barContainer}>
              <View style={[styles.bar, { height: heightValue, backgroundColor: color }]} />
              <Text style={styles.barValue}>{loadText}</Text>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ACWRCard({ metrics }: { metrics?: DailyMetrics }) {
  const acwr = metrics?.acwr ?? 1.0;
  const acwrText = acwr.toFixed(2);
  const status = acwr >= 0.8 && acwr <= 1.3 ? 'Optimal' : acwr > 1.3 ? 'High Risk' : 'Low Load';
  const statusColor = acwr >= 0.8 && acwr <= 1.3 ? '#34C759' : acwr > 1.3 ? '#FF3B30' : '#FF9500';

  return (
    <View style={styles.acwrCard}>
      <Text style={styles.cardTitle}>Acute:Chronic Workload Ratio</Text>
      <View style={styles.acwrRow}>
        <Text style={styles.acwrLabel}>Ratio</Text>
        <Text style={styles.acwrValue}>{acwrText}</Text>
      </View>
      <View style={styles.acwrRow}>
        <Text style={styles.acwrLabel}>Status</Text>
        <Text style={[styles.acwrValue, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

function WorkoutsCard({ metrics }: { metrics?: DailyMetrics }) {
  const workouts = metrics?.workouts ?? [];

  if (workouts.length === 0) {
    return (
      <View style={styles.workoutsCard}>
        <Text style={styles.cardTitle}>Recent Workouts</Text>
        <Text style={styles.acwrLabel}>No workouts recorded today</Text>
      </View>
    );
  }

  return (
    <View style={styles.workoutsCard}>
      <Text style={styles.cardTitle}>Recent Workouts</Text>
      {workouts.map((workout, index) => {
        const durationMinutes = Math.round(workout.duration / 60);
        const durationText = `${durationMinutes} min`;

        return (
          <View key={index} style={styles.workoutRow}>
            <Text style={styles.workoutType}>{workout.type}</Text>
            <Text style={styles.workoutDuration}>{durationText}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StrainDetailView() {
  const { loading, metrics, syncNow } = useDailySync();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Training Strain',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const hasLoadData = metrics?.loadScore !== undefined && metrics.loadScore !== null;

  if (!hasLoadData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Training Strain',
            headerShown: true,
          }}
        />
        <EmptyDataView
          icon="local-fire-department"
          iosIcon="flame.fill"
          title="No Workout Data"
          message="Complete a workout to see your training strain and load analysis."
          actionTitle="Sync Data"
          action={syncNow}
        />
      </SafeAreaView>
    );
  }

  const loadScore = metrics.loadScore;
  const loadValueText = Math.round(loadScore).toString();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Training Strain',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollContent}>
        <StrainHeroCard load={loadScore} />
        <WeeklyLoadChart />
        <ACWRCard metrics={metrics} />
        <WorkoutsCard metrics={metrics} />
        
        <View style={styles.infoCardContainer}>
          <InfoCard
            title="Training Load"
            icon="local-fire-department"
            description="Training load measures the intensity and volume of your workouts. It helps you balance training stress with recovery to optimize performance and prevent overtraining."
            idealRange="40-70"
            yourValue={loadValueText}
            importance="high"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
