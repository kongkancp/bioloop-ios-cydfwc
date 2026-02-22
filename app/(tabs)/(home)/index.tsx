
import React, { useState, useEffect } from 'react';
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
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';
import BioLoopDebugger from '@/utils/debugHelper';
import { calculateBioAgeWithProfile } from '@/utils/bioAge';
import MockDataGenerator from '@/services/MockDataGenerator';

export default function HomeScreen() {
  const { metrics, baselines, userProfile, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);
  const [generatingMockData, setGeneratingMockData] = useState(false);
  const router = useRouter();

  // Auto-generate mock data on first load if no data exists
  useEffect(() => {
    const autoGenerateMockData = async () => {
      if (!loading && !metrics && !generatingMockData) {
        console.log('HomeScreen: No data found, auto-generating mock data to simulate HealthKit permission granted');
        setGeneratingMockData(true);
        try {
          await MockDataGenerator.generateAllData();
          console.log('HomeScreen: Mock data generated, triggering sync');
          await syncNow(true);
        } catch (error) {
          console.error('HomeScreen: Failed to generate mock data:', error);
        } finally {
          setGeneratingMockData(false);
        }
      }
    };

    autoGenerateMockData();
  }, [loading, metrics, generatingMockData, syncNow]);

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

  const handleGenerateMockData = async () => {
    console.log('HomeScreen: User tapped Generate Mock Data button');
    setGeneratingMockData(true);
    try {
      await MockDataGenerator.generateAllData();
      console.log('HomeScreen: Mock data generated, triggering sync');
      await syncNow(true);
    } catch (error) {
      console.error('HomeScreen: Failed to generate mock data:', error);
    } finally {
      setGeneratingMockData(false);
    }
  };

  // Calculate readiness score
  const calculateReadinessScore = (): number => {
    if (!metrics) return 0;
    
    const recovery = metrics.recoveryEfficiency ?? 50;
    const sleepScore = ((metrics.sleepDuration ?? 420) / 480) * 100;
    const strain = Math.max(0, 100 - (metrics.loadScore ?? 0));
    
    const readiness = (recovery * 0.5) + (sleepScore * 0.3) + (strain * 0.2);
    return Math.max(0, Math.min(100, readiness));
  };

  const readinessScore = calculateReadinessScore();

  const getReadinessLevel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Rest Needed';
  };

  const readinessLevel = getReadinessLevel(readinessScore);

  const getReadinessMessage = (score: number): string => {
    if (score >= 80) return 'Ready for intense training';
    if (score >= 65) return 'Good for moderate activity';
    if (score >= 50) return 'Consider light exercise';
    return 'Focus on recovery';
  };

  const readinessMessage = getReadinessMessage(readinessScore);

  const getGradientColors = (score: number): string[] => {
    if (score >= 80) return ['#10b981', '#3b82f6'];
    if (score >= 50) return ['#3b82f6', '#f97316'];
    return ['#f97316', '#ef4444'];
  };

  const gradientColors = getGradientColors(readinessScore);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#3b82f6';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(readinessScore);

  const bioAgeDisplay = metrics && baselines && userProfile?.dateOfBirth
    ? (() => {
        const age = Math.floor((Date.now() - userProfile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const indices = {
          autonomic: metrics.autonomicIndex ?? null,
          vo2: metrics.vo2Index ?? null,
          sleep: metrics.sleepIndex ?? null,
          workout: metrics.workoutIndex ?? null,
          bmi: metrics.bmiIndex ?? null,
        };
        const componentCount = [indices.autonomic, indices.vo2, indices.sleep, indices.workout, indices.bmi]
          .filter(x => x !== null).length;
        
        if (componentCount >= 3) {
          return metrics.bioAgeSmoothed ?? metrics.bioAge ?? age;
        }
        return null;
      })()
    : null;

  const bioAgeScore = bioAgeDisplay && userProfile?.dateOfBirth
    ? (() => {
        const age = Math.floor((Date.now() - userProfile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const ageGap = age - bioAgeDisplay;
        return Math.max(0, Math.min(100, 50 + ageGap * 5));
      })()
    : 50;

  const formatSleep = (minutes: number | undefined): string => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const sleepDisplay = formatSleep(metrics?.sleepDuration);
  const sleepScore = metrics?.sleepDuration ? Math.min(100, (metrics.sleepDuration / 480) * 100) : 0;

  const strainDisplay = metrics?.loadScore ? Math.round(metrics.loadScore).toString() : '--';
  const strainScore = metrics?.loadScore ?? 0;

  const recoveryDisplay = metrics?.recoveryEfficiency ? `${Math.round(metrics.recoveryEfficiency)}%` : '--';
  const recoveryScore = metrics?.recoveryEfficiency ?? 0;

  const bioAgeDisplayText = bioAgeDisplay ? `${bioAgeDisplay.toFixed(1)} yrs` : '--';

  const performanceDisplay = metrics?.performanceIndex ? metrics.performanceIndex.toFixed(1) : '--';
  const performanceMessage = metrics?.performanceIndex
    ? (() => {
        const pi = metrics.performanceIndex;
        if (pi >= 80) return 'Peak performance - maintain intensity';
        if (pi >= 65) return 'Strong performance - push harder';
        if (pi >= 50) return 'Moderate performance - steady progress';
        return 'Building phase - focus on recovery';
      })()
    : 'Sync data to see your performance';

  if (loading || generatingMockData) {
    const loadingText = generatingMockData 
      ? 'Generating mock health data...' 
      : 'Loading your health data...';
    
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Home', headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
          {generatingMockData && (
            <Text style={styles.loadingSubtext}>
              Simulating HealthKit permission granted...
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Home', headerShown: false }} />
        <View style={styles.emptyContainer}>
          <EmptyDataView
            icon="favorite"
            iosIcon="heart.text.square"
            title="No Health Data"
            message="Grant HealthKit permissions to start tracking your health metrics, or generate mock data to see how the app works."
            actionTitle="Grant Permission"
            action={handleRequestPermission}
          />
          <TouchableOpacity 
            style={styles.mockDataButton}
            onPress={handleGenerateMockData}
            disabled={generatingMockData}
          >
            <Text style={styles.mockDataButtonText}>
              {generatingMockData ? 'Generating...' : 'Generate Mock Data'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const radius = 100;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = (readinessScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Home', headerShown: false }} />
      
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
        {/* Section 1: Readiness Hero Circle */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Today's Readiness</Text>
          
          <View style={styles.circleContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
              <Defs>
                <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={gradientColors[0]} />
                  <Stop offset="100%" stopColor={gradientColors[1]} />
                </LinearGradient>
              </Defs>
              
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                rotation="-90"
                origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
              />
            </Svg>
            
            <View style={styles.circleContent}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {Math.round(readinessScore)}
              </Text>
              <Text style={styles.scoreLevel}>{readinessLevel}</Text>
            </View>
          </View>
          
          <Text style={styles.heroMessage}>{readinessMessage}</Text>
        </View>

        {/* Section 2: 4 Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity 
            style={styles.metricCard} 
            activeOpacity={0.7}
            onPress={() => {
              console.log('HomeScreen: User tapped Sleep card, navigating to sleep-detail');
              router.push('/sleep-detail');
            }}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="bedtime"
                size={24}
                color={getScoreColor(sleepScore)}
              />
              <Text style={[styles.metricScore, { color: getScoreColor(sleepScore) }]}>
                {Math.round(sleepScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Sleep</Text>
            <Text style={styles.metricValue}>{sleepDisplay}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.metricCard} 
            activeOpacity={0.7}
            onPress={() => {
              console.log('HomeScreen: User tapped Strain card, navigating to strain-detail');
              router.push('/strain-detail');
            }}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="flame.fill"
                android_material_icon_name="local-fire-department"
                size={24}
                color={getScoreColor(100 - strainScore)}
              />
              <Text style={[styles.metricScore, { color: getScoreColor(100 - strainScore) }]}>
                {Math.round(100 - strainScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Strain</Text>
            <Text style={styles.metricValue}>{strainDisplay}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} activeOpacity={0.7}>
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={24}
                color={getScoreColor(recoveryScore)}
              />
              <Text style={[styles.metricScore, { color: getScoreColor(recoveryScore) }]}>
                {Math.round(recoveryScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>Recovery</Text>
            <Text style={styles.metricValue}>{recoveryDisplay}</Text>
          </TouchableOpacity>

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
                color={getScoreColor(bioAgeScore)}
              />
              <Text style={[styles.metricScore, { color: getScoreColor(bioAgeScore) }]}>
                {Math.round(bioAgeScore)}
              </Text>
            </View>
            <Text style={styles.metricTitle}>BioAge</Text>
            <Text style={styles.metricValue}>{bioAgeDisplayText}</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3: Performance Index Card */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>Performance Index</Text>
            <Text style={styles.performanceValue}>{performanceDisplay}</Text>
          </View>
          <Text style={styles.performanceMessage}>{performanceMessage}</Text>
        </View>

        {/* Regenerate Mock Data Button */}
        <TouchableOpacity 
          style={styles.regenerateButton}
          onPress={handleGenerateMockData}
          disabled={generatingMockData}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.regenerateButtonText}>
            {generatingMockData ? 'Generating...' : 'Regenerate Mock Data'}
          </Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
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
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockDataButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockDataButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 64,
  },
  scoreLevel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    height: 140,
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
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  performanceMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});
