
import React from 'react';
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
    top: 60,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    width: '50%',
    padding: 8,
  },
  metricCardInner: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
});

interface Recommendation {
  icon: string;
  color: string;
  message: string;
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
  const radius = 90;
  const strokeWidth = 20;
  const circumference = Math.PI * radius;
  const progress = (index / 100) * 0.5;
  const strokeDashoffset = circumference - progress * circumference;

  const performanceLevel = getPerformanceLevel(index);
  const indexRounded = Math.round(index);

  return (
    <View style={styles.gaugeCard}>
      <Text style={styles.gaugeTitle}>Performance Index</Text>
      <View style={styles.gaugeContainer}>
        <Svg width={radius * 2 + strokeWidth} height={radius + strokeWidth + 20}>
          <Defs>
            <LinearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#007AFF" />
              <Stop offset="100%" stopColor="#34C759" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference / 2}
            transform={`rotate(180 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="url(#performanceGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(180 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
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

function MetricsGrid({ metrics }: { metrics: any }) {
  const router = useRouter();

  const sleepDurationHours = metrics?.sleepDuration ? (metrics.sleepDuration / 60).toFixed(1) : '0.0';
  const hrvValue = metrics?.hrv ? Math.round(metrics.hrv) : 0;
  const restingHRValue = metrics?.restingHR ? Math.round(metrics.restingHR) : 0;
  const vo2maxValue = metrics?.vo2max ? Math.round(metrics.vo2max) : 0;

  return (
    <View style={styles.metricsGrid}>
      <TouchableOpacity
        style={styles.metricCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('Navigating to Sleep detail');
          router.push('/sleep-detail');
        }}
      >
        <View style={styles.metricCardInner}>
          <View style={styles.metricHeader}>
            <IconSymbol
              ios_icon_name="moon.fill"
              android_material_icon_name="hotel"
              size={20}
              color="#AF52DE"
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>Sleep</Text>
          </View>
          <Text style={styles.metricValue}>{sleepDurationHours}</Text>
          <Text style={styles.metricLabel}>hours</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.metricCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('Navigating to Recovery detail');
          router.push('/recovery-detail');
        }}
      >
        <View style={styles.metricCardInner}>
          <View style={styles.metricHeader}>
            <IconSymbol
              ios_icon_name="waveform.path.ecg"
              android_material_icon_name="favorite"
              size={20}
              color="#FF3B30"
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>HRV</Text>
          </View>
          <Text style={styles.metricValue}>{hrvValue}</Text>
          <Text style={styles.metricLabel}>ms</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.metricCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('Navigating to Recovery detail');
          router.push('/recovery-detail');
        }}
      >
        <View style={styles.metricCardInner}>
          <View style={styles.metricHeader}>
            <IconSymbol
              ios_icon_name="heart.fill"
              android_material_icon_name="favorite"
              size={20}
              color="#FF2D55"
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>Resting HR</Text>
          </View>
          <Text style={styles.metricValue}>{restingHRValue}</Text>
          <Text style={styles.metricLabel}>bpm</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.metricCard}
        activeOpacity={0.7}
        onPress={() => {
          console.log('Navigating to Strain detail');
          router.push('/strain-detail');
        }}
      >
        <View style={styles.metricCardInner}>
          <View style={styles.metricHeader}>
            <IconSymbol
              ios_icon_name="figure.run"
              android_material_icon_name="directions-run"
              size={20}
              color="#34C759"
              style={styles.metricIcon}
            />
            <Text style={styles.metricTitle}>VO2 Max</Text>
          </View>
          <Text style={styles.metricValue}>{vo2maxValue}</Text>
          <Text style={styles.metricLabel}>ml/kg/min</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function ActivityScreen() {
  const { metrics, loading } = useDailySync();
  const router = useRouter();

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
        <MetricsGrid metrics={metrics} />
      </ScrollView>
    </SafeAreaView>
  );
}
