
import { Stack } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useDailySync } from '@/hooks/useDailySync';
import { DailyMetrics } from '@/types/health';
import React, { useState, useEffect } from 'react';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  secondaryText: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  largeScore: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 24,
    color: colors.secondaryText,
    marginLeft: 4,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  chartContainer: {
    height: 150,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  bar: {
    width: 40,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  componentRow: {
    marginBottom: 20,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentIcon: {
    width: 30,
    alignItems: 'center',
  },
  componentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  componentValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  componentWeight: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

interface RecoveryHeroCardProps {
  eff: number;
}

function RecoveryHeroCard({ eff }: RecoveryHeroCardProps) {
  const getLevel = (e: number): string => {
    if (e >= 80) return 'Excellent';
    if (e >= 65) return 'Good';
    if (e >= 50) return 'Fair';
    return 'Poor';
  };

  const getColor = (e: number): string => {
    if (e >= 80) return '#34C759';
    if (e >= 65) return colors.primary;
    if (e >= 50) return '#FF9500';
    return '#FF3B30';
  };

  const efficiencyScore = Math.round(eff);
  const levelText = getLevel(eff);
  const scoreColor = getColor(eff);

  return (
    <View style={[styles.card, styles.heroCard]}>
      <Text style={styles.secondaryText}>Recovery Efficiency</Text>
      <View style={styles.scoreContainer}>
        <Text style={[styles.largeScore, { color: scoreColor }]}>
          {efficiencyScore}
        </Text>
        <Text style={styles.scoreUnit}>%</Text>
      </View>
      <Text style={[styles.levelText, { color: scoreColor }]}>
        {levelText}
      </Text>
    </View>
  );
}

interface HRVDay {
  id: string;
  hrv: number;
  label: string;
}

function HRVTrendCard() {
  const [days, setDays] = useState<HRVDay[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const mockDays: HRVDay[] = dayLabels.map((label, index) => ({
      id: `hrv-${index}`,
      hrv: Math.random() * 40 + 40,
      label,
    }));
    setDays(mockDays);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>7-Day HRV Trend</Text>
      <View style={styles.chartContainer}>
        {days.map((d) => {
          const barHeight = (d.hrv / 100) * 120;
          const hrvValue = Math.round(d.hrv);
          return (
            <View key={d.id} style={styles.barContainer}>
              <View style={[styles.bar, { height: barHeight }]} />
              <Text style={styles.barValue}>{hrvValue}</Text>
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface ComponentRowProps {
  name: string;
  val: number;
  weight: number;
  iconName: string;
}

function ComponentRow({ name, val, weight, iconName }: ComponentRowProps) {
  const valuePercent = Math.round(val);
  const weightText = `${weight}% weight`;
  const progressWidth = `${val}%`;

  return (
    <View style={styles.componentRow}>
      <View style={styles.componentHeader}>
        <View style={styles.componentIcon}>
          <IconSymbol
            ios_icon_name={iconName}
            android_material_icon_name={iconName === 'waveform.path.ecg' ? 'show-chart' : 'favorite'}
            size={20}
            color={colors.primary}
          />
        </View>
        <Text style={styles.componentName}>{name}</Text>
        <Text style={styles.componentValue}>{valuePercent}%</Text>
      </View>
      <Text style={styles.componentWeight}>{weightText}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: progressWidth }]} />
      </View>
    </View>
  );
}

interface RecoveryComponentsCardProps {
  metrics?: DailyMetrics;
}

function RecoveryComponentsCard({ metrics }: RecoveryComponentsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Recovery Components</Text>
      <ComponentRow
        name="HRV Rebound"
        val={75}
        weight={30}
        iconName="waveform.path.ecg"
      />
      <ComponentRow
        name="HR Recovery"
        val={85}
        weight={70}
        iconName="heart.fill"
      />
    </View>
  );
}

export default function RecoveryDetailView() {
  const { metrics } = useDailySync();

  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Recovery Analysis',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RecoveryHeroCard eff={recoveryEfficiency} />
        <HRVTrendCard />
        <RecoveryComponentsCard metrics={metrics} />
      </ScrollView>
    </SafeAreaView>
  );
}
