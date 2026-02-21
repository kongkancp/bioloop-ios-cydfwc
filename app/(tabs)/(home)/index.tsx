
import { useDailySync } from '@/hooks/useDailySync';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Stack, useRouter } from 'expo-router';
import EmptyDataView from '@/components/EmptyDataView';
import HealthKitManager from '@/services/HealthKitManager';
import Svg, { Circle } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useMemo } from 'react';
import BioLoopDebugger from '@/utils/debugHelper';
import { calculateBioAgeWithProfile } from '@/utils/bioAge';

export default function HomeScreen() {
  const { metrics, baselines, loading, syncing, syncNow, userProfile } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    console.log('HomeScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    console.log('HomeScreen: User tapped Request Permission button');
    try {
      const granted = await HealthKitManager.requestAuthorization();
      if (granted) {
        await syncNow(true);
      }
    } catch (error) {
      console.error('HomeScreen: Permission request failed', error);
    }
  };

  // Calculate BioAge data
  const bioAgeData = useMemo(() => {
    if (!metrics || !baselines || !userProfile?.dateOfBirth) {
      return null;
    }

    return calculateBioAgeWithProfile(
      new Date(),
      userProfile.dateOfBirth,
      userProfile.height,
      metrics,
      baselines
    );
  }, [metrics, baselines, userProfile]);

  // Calculate readiness score (average of Performance Index and Recovery)
  const readinessScore = useMemo(() => {
    if (!metrics) return 0;
    
    let score = 0;
    let count = 0;

    if (metrics.performanceIndex !== undefined) {
      score += metrics.performanceIndex;
      count++;
    }

    if (metrics.recoveryEfficiency !== undefined) {
      score += metrics.recoveryEfficiency;
      count++;
    }

    return count > 0 ? score / count : 0;
  }, [metrics]);

  const getReadinessColor = (score: number): string => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Low';
  };

  const formatSleep = (sleepMinutes: number | undefined): string => {
    if (!sleepMinutes) return '--';
    const hours = Math.floor(sleepMinutes / 60);
    const mins = Math.round(sleepMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatStrain = (loadScore: number | undefined): string => {
    if (!loadScore) return '--';
    return loadScore.toFixed(0);
  };

  const formatRecovery = (recovery: number | undefined): string => {
    if (!recovery) return '--';
    return `${recovery.toFixed(0)}%`;
  };

  const formatBioAge = (bioAge: number | undefined): string => {
    if (!bioAge) return '--';
    return `${bioAge.toFixed(1)}y`;
  };

  const calculateSleepScore = (): number => {
    if (!metrics?.sleepDuration) return 0;
    const optimalSleep = 8 * 60; // 8 hours in minutes
    const score = (metrics.sleepDuration / optimalSleep) * 100;
    return Math.min(100, score);
  };

  const calculateBioAgeScore = (): number => {
    if (!bioAgeData) return 0;
    return bioAgeData.longevityScore || 50;
  };

  const getPerformanceRecommendation = (): string => {
    if (!metrics) return 'Sync your data to get personalized recommendations';
    
    const perfIndex = metrics.performanceIndex || 50;
    const recovery = metrics.recoveryEfficiency || 50;
    
    if (perfIndex >= 75 && recovery >= 75) {
      return 'You\'re in peak condition! Great day for intense training.';
    } else if (perfIndex >= 50 && recovery >= 50) {
      return 'Good balance. Moderate training recommended.';
    } else if (recovery < 50) {
      return 'Focus on recovery today. Light activity or rest.';
    } else {
      return 'Build gradually. Listen to your body.';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <EmptyDataView
          icon="favorite"
          iosIcon="heart.text.square"
          title="No Health Data"
          message="Grant HealthKit permissions to start tracking your health metrics."
          actionTitle="Grant Permission"
          action={handleRequestPermission}
        />
      </SafeAreaView>
    );
  }

  const readinessColor = getReadinessColor(readinessScore);
  const readinessLevel = getReadinessLevel(readinessScore);
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const progress = (readinessScore / 100) * circumference;
  const recommendation = getPerformanceRecommendation();

  const sleepValue = formatSleep(metrics.sleepDuration);
  const sleepScore = calculateSleepScore();
  const strainValue = formatStrain(metrics.loadScore);
  const strainScore = metrics.loadScore || 0;
  const recoveryValue = formatRecovery(metrics.recoveryEfficiency);
  const recoveryScore = metrics.recoveryEfficiency || 0;
  const bioAgeValue = formatBioAge(bioAgeData?.bioAgeSmoothed);
  const bioAgeScore = calculateBioAgeScore();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Hero: Readiness Circle */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Readiness</Text>
          
          <View style={styles.circleContainer}>
            <Svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2}>
              <Circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                stroke={readinessColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                rotation="-90"
                origin={`${radius + strokeWidth}, ${radius + strokeWidth}`}
              />
            </Svg>
            
            <View style={styles.circleTextContainer}>
              <Text style={[styles.circleValue, { color: readinessColor }]}>
                {Math.round(readinessScore)}
              </Text>
              <Text style={styles.circleLabel}>{readinessLevel}</Text>
            </View>
          </View>
        </View>

        {/* 2x2 Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Sleep Card */}
          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: getSleepColor(sleepScore) }]}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="moon.fill"
              android_material_icon_name="bedtime"
              size={28}
              color="#fff"
            />
            <Text style={styles.metricValue}>{sleepValue}</Text>
            <Text style={styles.metricTitle}>Sleep</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${sleepScore}%` }]} />
            </View>
          </TouchableOpacity>

          {/* Strain Card */}
          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: getStrainColor(strainScore) }]}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="flame.fill"
              android_material_icon_name="local-fire-department"
              size={28}
              color="#fff"
            />
            <Text style={styles.metricValue}>{strainValue}</Text>
            <Text style={styles.metricTitle}>Strain</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${strainScore}%` }]} />
            </View>
          </TouchableOpacity>

          {/* Recovery Card */}
          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: getRecoveryColor(recoveryScore) }]}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="heart.fill"
              android_material_icon_name="favorite"
              size={28}
              color="#fff"
            />
            <Text style={styles.metricValue}>{recoveryValue}</Text>
            <Text style={styles.metricTitle}>Recovery</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${recoveryScore}%` }]} />
            </View>
          </TouchableOpacity>

          {/* BioAge Card */}
          <TouchableOpacity 
            style={[styles.metricCard, { backgroundColor: getBioAgeColor(bioAgeScore) }]}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/biology')}
          >
            <IconSymbol
              ios_icon_name="figure.walk"
              android_material_icon_name="directions-walk"
              size={28}
              color="#fff"
            />
            <Text style={styles.metricValue}>{bioAgeValue}</Text>
            <Text style={styles.metricTitle}>BioAge</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${bioAgeScore}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Performance Index Card */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <IconSymbol
              ios_icon_name="chart.line.uptrend.xyaxis"
              android_material_icon_name="trending-up"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.performanceTitle}>Performance Index</Text>
          </View>
          
          <Text style={styles.performanceValue}>
            {metrics.performanceIndex?.toFixed(1) || '--'}
          </Text>
          
          <View style={styles.recommendationContainer}>
            <IconSymbol
              ios_icon_name="lightbulb.fill"
              android_material_icon_name="lightbulb"
              size={20}
              color={colors.warning}
            />
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSleepColor(score: number): string {
  if (score >= 80) return '#6366f1'; // Indigo
  if (score >= 60) return '#8b5cf6'; // Purple
  return '#a855f7'; // Light purple
}

function getStrainColor(score: number): string {
  if (score >= 70) return '#ef4444'; // Red
  if (score >= 40) return '#f97316'; // Orange
  return '#fb923c'; // Light orange
}

function getRecoveryColor(score: number): string {
  if (score >= 75) return '#10b981'; // Green
  if (score >= 50) return '#22c55e'; // Light green
  return '#84cc16'; // Lime
}

function getBioAgeColor(score: number): string {
  if (score >= 60) return '#06b6d4'; // Cyan
  if (score >= 40) return '#0ea5e9'; // Sky blue
  return '#3b82f6'; // Blue
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  circleLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  scoreBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  performanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
});
