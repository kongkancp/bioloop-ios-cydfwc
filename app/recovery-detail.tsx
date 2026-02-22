
import React, { useState, useEffect } from 'react';
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

interface HRVDay {
  id: string;
  hrv: number;
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
    backgroundColor: colors.primary,
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
  componentsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentIcon: {
    width: 30,
    alignItems: 'center',
  },
  componentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  componentSubtext: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  componentValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoCardContainer: {
    marginBottom: 24,
  },
});

function RecoveryHeroCard({ efficiency }: { efficiency: number }) {
  const efficiencyText = Math.round(efficiency).toString();
  const level = getRecoveryLevel(efficiency);
  const color = getRecoveryColor(efficiency);

  return (
    <View style={styles.heroCard}>
      <Text style={styles.heroLabel}>Recovery Efficiency</Text>
      <Text style={[styles.heroValue, { color }]}>{efficiencyText}%</Text>
      <Text style={[styles.heroSubtext, { color }]}>{level}</Text>
    </View>
  );
}

function getRecoveryLevel(eff: number): string {
  if (eff >= 80) return 'Excellent';
  if (eff >= 65) return 'Good';
  if (eff >= 50) return 'Fair';
  return 'Poor';
}

function getRecoveryColor(eff: number): string {
  if (eff >= 80) return '#34C759';
  if (eff >= 65) return '#007AFF';
  if (eff >= 50) return '#FF9500';
  return '#FF3B30';
}

function HRVTrendCard() {
  const [days, setDays] = useState<HRVDay[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const mockDays: HRVDay[] = [];
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < 7; i++) {
      mockDays.push({
        id: `day-${i}`,
        hrv: Math.random() * 40 + 40,
        label: labels[i],
      });
    }
    setDays(mockDays);
  };

  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>HRV Trend (7 Days)</Text>
      <View style={styles.chartContainer}>
        {days.map((day) => {
          const height = (day.hrv / 80) * 100;
          const heightValue = height;
          const hrvText = Math.round(day.hrv).toString();

          return (
            <View key={day.id} style={styles.barContainer}>
              <View style={[styles.bar, { height: heightValue }]} />
              <Text style={styles.barValue}>{hrvText}</Text>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RecoveryComponentsCard({ metrics }: { metrics: any }) {
  const hrv = metrics?.hrv ?? 65;
  const restingHR = metrics?.restingHR ?? 58;
  const sleepScore = metrics?.sleepDuration
    ? Math.min(100, (metrics.sleepDuration / 480) * 100)
    : 85;

  const hrvText = Math.round(hrv).toString();
  const restingHRText = Math.round(restingHR).toString();
  const sleepScoreText = Math.round(sleepScore).toString();

  const components = [
    {
      name: 'HRV',
      subtext: 'Heart rate variability',
      value: hrvText,
      icon: 'favorite',
      color: '#FF2D55',
    },
    {
      name: 'Resting HR',
      subtext: 'Morning heart rate',
      value: restingHRText,
      icon: 'monitor-heart',
      color: '#FF9500',
    },
    {
      name: 'Sleep Quality',
      subtext: 'Last night',
      value: sleepScoreText,
      icon: 'bedtime',
      color: '#5E5CE6',
    },
  ];

  return (
    <View style={styles.componentsCard}>
      <Text style={styles.cardTitle}>Recovery Components</Text>
      {components.map((comp, index) => (
        <View key={index} style={styles.componentRow}>
          <View style={styles.componentIcon}>
            <IconSymbol
              ios_icon_name={comp.icon}
              android_material_icon_name={comp.icon}
              size={24}
              color={comp.color}
            />
          </View>
          <View style={styles.componentInfo}>
            <Text style={styles.componentName}>{comp.name}</Text>
            <Text style={styles.componentSubtext}>{comp.subtext}</Text>
          </View>
          <Text style={[styles.componentValue, { color: comp.color }]}>
            {comp.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function RecoveryDetailView() {
  const { loading, metrics } = useDailySync();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Recovery Analysis',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 82;
  const recoveryValue = `${Math.round(recoveryEfficiency)}%`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Recovery Analysis',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollContent}>
        <RecoveryHeroCard efficiency={recoveryEfficiency} />
        <HRVTrendCard />
        <RecoveryComponentsCard metrics={metrics} />
        
        <View style={styles.infoCardContainer}>
          <InfoCard
            title="Recovery Efficiency"
            icon="favorite"
            description="How quickly your body bounces back from exercise. Based on HRV, resting heart rate, and sleep quality. Higher values indicate better recovery."
            idealRange="70-100%"
            yourValue={recoveryValue}
            importance="critical"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
