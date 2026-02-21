
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateBioAgeWithProfile } from '@/utils/bioAge';
import { colors } from '@/styles/commonStyles';
import HealthKitManager from '@/services/HealthKitManager';
import { useDailySync } from '@/hooks/useDailySync';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { Stack, useRouter } from 'expo-router';
import EmptyDataView from '@/components/EmptyDataView';
import { IconSymbol } from '@/components/IconSymbol';
import MockDataGenerator from '@/services/MockDataGenerator';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [generatingMockData, setGeneratingMockData] = useState(false);
  const { metrics, baselines, loading, syncing, userProfile, syncNow, loadMetrics } = useDailySync();

  const bioAge = useMemo(() => {
    if (!metrics || !baselines || !userProfile?.dateOfBirth) return null;
    return calculateBioAgeWithProfile(
      new Date(),
      userProfile.dateOfBirth,
      userProfile.height,
      metrics,
      baselines
    );
  }, [metrics, baselines, userProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncNow(true);
    await loadMetrics(new Date());
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    const granted = await HealthKitManager.requestAuthorization();
    if (granted) {
      await syncNow(true);
    }
  };

  const handleGenerateMockData = async () => {
    console.log('User tapped Generate Mock Data button');
    setGeneratingMockData(true);
    try {
      await MockDataGenerator.generateAllData();
      // Reload data after generation
      await loadMetrics(new Date());
      console.log('Mock data generated and loaded successfully');
    } catch (error) {
      console.error('Failed to generate mock data:', error);
    } finally {
      setGeneratingMockData(false);
    }
  };

  // Calculate readiness score
  const readinessScore = useMemo(() => {
    if (!metrics) return 0;
    const recovery = metrics.recoveryEfficiency ?? 50;
    const sleep = ((metrics.sleepDuration ?? 420) / 480) * 100;
    const strain = Math.max(0, 100 - (metrics.loadScore ?? 0));
    return recovery * 0.5 + sleep * 0.3 + strain * 0.2;
  }, [metrics]);

  const getReadinessColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 65) return colors.primary;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Rest Needed';
  };

  const getReadinessMessage = (score: number): string => {
    if (score >= 80) return "You're ready for intense training";
    if (score >= 65) return 'Good day for moderate activity';
    if (score >= 50) return 'Consider light exercise';
    return 'Focus on recovery today';
  };

  const formatSleep = (sleepMinutes: number | undefined): string => {
    if (!sleepMinutes) return '--';
    const hours = Math.floor(sleepMinutes / 60);
    const minutes = Math.round(sleepMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const formatStrain = (loadScore: number | undefined): string => {
    if (!loadScore) return '--';
    return `${Math.round(loadScore)}`;
  };

  const formatRecovery = (recovery: number | undefined): string => {
    if (!recovery) return '--';
    return `${Math.round(recovery)}%`;
  };

  const formatBioAge = (bioAge: number | undefined): string => {
    if (!bioAge) return '--';
    return `${Math.round(bioAge)} yrs`;
  };

  const calculateSleepScore = (): number => {
    if (!metrics?.sleepDuration) return 0;
    return Math.min(100, (metrics.sleepDuration / 480) * 100);
  };

  const calculateBioAgeScore = (): number => {
    if (!bioAge) return 0;
    const ageGap = bioAge.ageGap || 0;
    return Math.max(0, Math.min(100, 75 - ageGap * 5));
  };

  const getPerformanceRecommendation = (): string => {
    const pi = metrics?.performanceIndex;
    const recovery = metrics?.recoveryEfficiency;

    if (!pi || !recovery) return 'Sync data for insights.';
    if (pi >= 90 && recovery >= 80) return 'Peak condition! Consider intense training.';
    if (pi >= 70 && recovery >= 60) return 'Good balance. Moderate training is ideal.';
    if (pi < 50 || recovery < 50) return 'Low recovery. Focus on rest and light activity.';
    return 'Building phase. Gradual progression is key.';
  };

  const readinessLevel = getReadinessLevel(readinessScore);
  const readinessMessage = getReadinessMessage(readinessScore);
  const readinessColor = getReadinessColor(readinessScore);
  const sleepValue = formatSleep(metrics?.sleepDuration);
  const sleepScore = calculateSleepScore();
  const strainValue = formatStrain(metrics?.loadScore);
  const strainScore = metrics?.loadScore ?? 0;
  const recoveryValue = formatRecovery(metrics?.recoveryEfficiency);
  const recoveryScore = metrics?.recoveryEfficiency ?? 0;
  const bioAgeValue = formatBioAge(bioAge?.bioAgeSmoothed);
  const bioAgeScore = calculateBioAgeScore();
  const performanceRecommendation = getPerformanceRecommendation();
  const performanceIndex = metrics?.performanceIndex ?? 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading health data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!metrics && !syncing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyDataView
          icon="heart-outline"
          iosIcon="heart"
          title="No Health Data"
          message="Grant HealthKit access to see your metrics, or generate mock data to preview the app."
          actionTitle="Request Permission"
          action={handleRequestPermission}
        />
        <View style={styles.mockDataButtonContainer}>
          <TouchableOpacity
            style={styles.mockDataButton}
            onPress={handleGenerateMockData}
            disabled={generatingMockData}
          >
            {generatingMockData ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="wand.and.stars"
                  android_material_icon_name="auto-fix-high"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.mockDataButtonText}>Generate Mock Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        {/* Readiness Hero Circle */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroLabel}>Today's Readiness</Text>

          <View style={styles.circleContainer}>
            <Svg width={200} height={200}>
              <Defs>
                <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={readinessColor} stopOpacity="1" />
                  <Stop offset="100%" stopColor={readinessColor} stopOpacity="0.6" />
                </LinearGradient>
              </Defs>
              {/* Background circle */}
              <Circle
                cx="100"
                cy="100"
                r="88"
                stroke={colors.border}
                strokeWidth="24"
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx="100"
                cy="100"
                r="88"
                stroke="url(#gradient)"
                strokeWidth="24"
                fill="none"
                strokeDasharray={`${(readinessScore / 100) * 553} 553`}
                strokeLinecap="round"
                rotation="-90"
                origin="100, 100"
              />
            </Svg>

            <View style={styles.circleContent}>
              <Text style={[styles.circleScore, { color: readinessColor }]}>
                {Math.round(readinessScore)}
              </Text>
              <Text style={styles.circleLevel}>{readinessLevel}</Text>
            </View>
          </View>

          <Text style={styles.heroMessage}>{readinessMessage}</Text>
        </View>

        {/* Metric Cards Grid */}
        <View style={styles.gridContainer}>
          {/* Sleep Card */}
          <TouchableOpacity style={styles.metricCard} activeOpacity={0.7}>
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="bedtime"
                size={24}
                color={getSleepColor(sleepScore)}
              />
              <Text style={[styles.metricScore, { color: getSleepColor(sleepScore) }]}>
                {Math.round(sleepScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Sleep</Text>
            <Text style={styles.metricValue}>{sleepValue}</Text>
          </TouchableOpacity>

          {/* Strain Card */}
          <TouchableOpacity style={styles.metricCard} activeOpacity={0.7}>
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={24}
                color={getStrainColor(strainScore)}
              />
              <Text style={[styles.metricScore, { color: getStrainColor(strainScore) }]}>
                {Math.round(strainScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Strain</Text>
            <Text style={styles.metricValue}>{strainValue}</Text>
          </TouchableOpacity>

          {/* Recovery Card */}
          <TouchableOpacity style={styles.metricCard} activeOpacity={0.7}>
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={24}
                color={getRecoveryColor(recoveryScore)}
              />
              <Text style={[styles.metricScore, { color: getRecoveryColor(recoveryScore) }]}>
                {Math.round(recoveryScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Recovery</Text>
            <Text style={styles.metricValue}>{recoveryValue}</Text>
          </TouchableOpacity>

          {/* BioAge Card */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/biology')}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="figure.walk"
                android_material_icon_name="directions-walk"
                size={24}
                color={getBioAgeColor(bioAgeScore)}
              />
              <Text style={[styles.metricScore, { color: getBioAgeColor(bioAgeScore) }]}>
                {Math.round(bioAgeScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>BioAge</Text>
            <Text style={styles.metricValue}>{bioAgeValue}</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Index Card */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Performance Index</Text>
            <Text style={[styles.performanceScore, { color: getReadinessColor(performanceIndex) }]}>
              {Math.round(performanceIndex)}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${performanceIndex}%`,
                    backgroundColor: getReadinessColor(performanceIndex),
                  },
                ]}
              />
            </View>
          </View>

          <Text style={styles.performanceRecommendation}>{performanceRecommendation}</Text>
        </View>

        {/* Mock Data Button (for testing) */}
        <View style={styles.mockDataSection}>
          <TouchableOpacity
            style={styles.mockDataButtonSmall}
            onPress={handleGenerateMockData}
            disabled={generatingMockData}
          >
            {generatingMockData ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="wand.and.stars"
                  android_material_icon_name="auto-fix-high"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.mockDataButtonSmallText}>Regenerate Mock Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSleepColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.primary;
  if (score >= 40) return colors.warning;
  return colors.error;
}

function getStrainColor(score: number): string {
  if (score >= 80) return colors.error;
  if (score >= 60) return colors.warning;
  if (score >= 40) return colors.primary;
  return colors.success;
}

function getRecoveryColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.primary;
  if (score >= 40) return colors.warning;
  return colors.error;
}

function getBioAgeColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.primary;
  if (score >= 40) return colors.warning;
  return colors.error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  circleContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleScore: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  circleLevel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  performanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  performanceScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceRecommendation: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mockDataButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  mockDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  mockDataButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mockDataSection: {
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  mockDataButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockDataButtonSmallText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
