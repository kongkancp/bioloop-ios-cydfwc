
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useDailySync } from '@/hooks/useDailySync';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.secondaryText,
  },
  gaugeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gaugeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gaugeValueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 50,
  },
  gaugeValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
  },
  gaugeLevel: {
    fontSize: 15,
    color: colors.secondaryText,
    marginTop: 4,
  },
  recCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recIconContainer: {
    marginRight: 16,
  },
  recContent: {
    flex: 1,
  },
  recLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  recMessage: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 22,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  bar: {
    width: 40,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricBox: {
    width: '50%',
    padding: 8,
  },
  metricBoxInner: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
});

interface Recommendation {
  icon: string;
  color: string;
  message: string;
}

interface PerfDay {
  id: string;
  perf: number;
  label: string;
}

function getRecommendation(pi: number, loadScore: number, recoveryEfficiency: number): Recommendation {
  if (pi >= 80 && loadScore < 50) {
    return {
      icon: 'bolt',
      color: '#34C759',
      message: 'Perfect for intense training. Your body is recovered.',
    };
  }
  if (pi >= 65 && loadScore >= 70) {
    return {
      icon: 'directions-walk',
      color: '#FF9500',
      message: 'Good readiness but high strain. Moderate activity recommended.',
    };
  }
  if (recoveryEfficiency < 40) {
    return {
      icon: 'hotel',
      color: '#FF3B30',
      message: 'Low recovery. Focus on rest and sleep.',
    };
  }
  if (pi >= 50) {
    return {
      icon: 'directions-run',
      color: '#007AFF',
      message: 'Moderate training day. Good for endurance work.',
    };
  }
  return {
    icon: 'favorite',
    color: '#AF52DE',
    message: 'Prioritize recovery. Light activity or rest.',
  };
}

function getPerformanceLevel(index: number): string {
  if (index >= 80) return 'Peak';
  if (index >= 65) return 'Good';
  if (index >= 50) return 'Moderate';
  return 'Low';
}

function PerformanceGauge({ index }: { index: number }) {
  // Standardized gauge: size=160, lineWidth=14
  const gaugeSize = 160;
  const strokeWidth = 14;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (index / 100) * 0.5;
  const strokeDashoffset = circumference - progress * circumference;

  const performanceLevel = getPerformanceLevel(index);
  const indexRounded = Math.round(index);

  return (
    <View style={styles.gaugeCard}>
      <Text style={styles.gaugeTitle}>Performance Index</Text>
      <View style={styles.gaugeContainer}>
        <Svg width={gaugeSize} height={gaugeSize / 2 + 20}>
          <Defs>
            <LinearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#0A84FF" />
              <Stop offset="100%" stopColor="#30D158" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference / 2}
            transform={`rotate(180 ${gaugeSize / 2} ${gaugeSize / 2})`}
          />
          <Circle
            cx={gaugeSize / 2}
            cy={gaugeSize / 2}
            r={radius}
            stroke="url(#performanceGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(180 ${gaugeSize / 2} ${gaugeSize / 2})`}
          />
        </Svg>
        <View style={styles.gaugeValueContainer}>
          <Text style={styles.gaugeValue}>{indexRounded}</Text>
          <Text style={styles.gaugeLevel}>{performanceLevel}</Text>
        </View>
      </View>
    </View>
  );
}

function DailyRecCard({ rec }: { rec: Recommendation }) {
  const recLabel = 'Today';

  return (
    <View style={[styles.recCard, { backgroundColor: `${rec.color}26` }]}>
      <View style={styles.recIconContainer}>
        <IconSymbol
          ios_icon_name="bolt.fill"
          android_material_icon_name={rec.icon}
          size={32}
          color={rec.color}
        />
      </View>
      <View style={styles.recContent}>
        <Text style={styles.recLabel}>{recLabel}</Text>
        <Text style={styles.recMessage}>{rec.message}</Text>
      </View>
    </View>
  );
}

function WeeklyPerfChart() {
  const [days, setDays] = useState<PerfDay[]>([]);

  useEffect(() => {
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const generatedDays = dayLabels.map((label, index) => ({
      id: `day-${index}`,
      perf: Math.random() * 40 + 50,
      label,
    }));
    setDays(generatedDays);
  }, []);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Performance</Text>
      <View style={styles.chartContainer}>
        {days.map((day) => {
          const barHeight = (day.perf / 100) * 100;
          const perfRounded = Math.round(day.perf);

          return (
            <View key={day.id} style={styles.barContainer}>
              <View style={[styles.bar, { height: barHeight }]} />
              <Text style={styles.barValue}>{perfRounded}</Text>
              <Text style={styles.barLabel}>{day.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MetricsGrid({ metrics }: { metrics: any }) {
  const loadScore = metrics?.loadScore ?? 0;
  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 0;
  const vo2max = metrics?.vo2max ?? 0;
  const hrv = metrics?.hrv ?? 0;

  const loadRounded = Math.round(loadScore);
  const recoveryRounded = Math.round(recoveryEfficiency);
  const vo2maxRounded = Math.round(vo2max);
  const hrvRounded = Math.round(hrv);

  return (
    <View style={styles.metricsGrid}>
      <View style={styles.metricBox}>
        <View style={styles.metricBoxInner}>
          <IconSymbol
            ios_icon_name="flame.fill"
            android_material_icon_name="local-fire-department"
            size={28}
            color="#007AFF"
            style={styles.metricIcon}
          />
          <Text style={styles.metricTitle}>Load</Text>
          <Text style={styles.metricValue}>{loadRounded}</Text>
        </View>
      </View>

      <View style={styles.metricBox}>
        <View style={styles.metricBoxInner}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={28}
            color="#007AFF"
            style={styles.metricIcon}
          />
          <Text style={styles.metricTitle}>Recovery</Text>
          <Text style={styles.metricValue}>{recoveryRounded}</Text>
        </View>
      </View>

      <View style={styles.metricBox}>
        <View style={styles.metricBoxInner}>
          <IconSymbol
            ios_icon_name="wind"
            android_material_icon_name="air"
            size={28}
            color="#007AFF"
            style={styles.metricIcon}
          />
          <Text style={styles.metricTitle}>VO2 Max</Text>
          <Text style={styles.metricValue}>{vo2maxRounded}</Text>
        </View>
      </View>

      <View style={styles.metricBox}>
        <View style={styles.metricBoxInner}>
          <IconSymbol
            ios_icon_name="waveform.path.ecg"
            android_material_icon_name="monitor-heart"
            size={28}
            color="#007AFF"
            style={styles.metricIcon}
          />
          <Text style={styles.metricTitle}>HRV</Text>
          <Text style={styles.metricValue}>{hrvRounded}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  const { metrics, loading } = useDailySync();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Performance Lab',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading performance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const performanceIndex = metrics?.performanceIndex ?? 0;
  const loadScore = metrics?.loadScore ?? 0;
  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 0;

  const recommendation = getRecommendation(performanceIndex, loadScore, recoveryEfficiency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Performance Lab',
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PerformanceGauge index={performanceIndex} />
        <DailyRecCard rec={recommendation} />
        <WeeklyPerfChart />
        <MetricsGrid metrics={metrics} />
      </ScrollView>
    </SafeAreaView>
  );
}
