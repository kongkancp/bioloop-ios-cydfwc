
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BioLoopDebugger from '@/utils/debugHelper';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import React, { useState, useEffect } from 'react';
import HealthKitManager from '@/services/HealthKitManager';
import EmptyDataView from '@/components/EmptyDataView';
import { IconSymbol } from '@/components/IconSymbol';
import MockDataGenerator from '@/services/MockDataGenerator';
import { useRouter } from 'expo-router';
import { useDailySync } from '@/hooks/useDailySync';
import { getScoreColor } from '@/utils/scoreColor';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  date: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 4,
  },
  syncButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readinessCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  readinessLabel: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  gaugeContainer: {
    marginBottom: 16,
  },
  readinessValue: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  readinessLevel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  readinessMessage: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
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
    fontSize: 13,
    color: colors.secondaryText,
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  actionsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  actionChevron: {
    marginLeft: 8,
  },
  debugButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [generatingMockData, setGeneratingMockData] = useState(false);
  const router = useRouter();
  const { metrics, syncNow } = useDailySync();

  useEffect(() => {
    console.log('HomeScreen: Component mounted');
  }, []);

  const handleRefresh = async () => {
    console.log('HomeScreen: User initiated refresh');
    setLoading(true);
    await syncNow();
    setLoading(false);
  };

  const handleRequestPermission = async () => {
    console.log('HomeScreen: User tapped Request HealthKit Permission');
    try {
      const authorized = await HealthKitManager.requestAuthorization();
      console.log('HomeScreen: HealthKit authorization result:', authorized);
      if (authorized) {
        await handleRefresh();
      }
    } catch (error) {
      console.error('HomeScreen: Error requesting HealthKit permission:', error);
    }
  };

  const handleGenerateMockData = async () => {
    console.log('HomeScreen: User tapped Generate Mock Data');
    setGeneratingMockData(true);
    try {
      await MockDataGenerator.generateMockData();
      console.log('HomeScreen: Mock data generated successfully');
      await handleRefresh();
    } catch (error) {
      console.error('HomeScreen: Error generating mock data:', error);
    } finally {
      setGeneratingMockData(false);
    }
  };

  const calculateReadinessScore = (): number => {
    if (!metrics) return 50;
    
    const recoveryWeight = 0.5;
    const sleepWeight = 0.3;
    const strainWeight = 0.2;

    const recoveryScore = metrics.recoveryEfficiency ?? 50;
    const sleepScore = metrics.sleepDuration
      ? Math.min(100, (metrics.sleepDuration / 480) * 100)
      : 50;
    const strainScore = metrics.loadScore ? Math.max(0, 100 - metrics.loadScore) : 50;

    const readiness =
      recoveryScore * recoveryWeight +
      sleepScore * sleepWeight +
      strainScore * strainWeight;

    return Math.round(readiness);
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 80) return 'Peak Readiness';
    if (score >= 65) return 'Good Readiness';
    if (score >= 50) return 'Moderate Readiness';
    return 'Low Readiness';
  };

  const getReadinessMessage = (score: number): string => {
    if (score >= 80) return 'Your body is ready for intense training';
    if (score >= 65) return 'Good day for moderate to high intensity';
    if (score >= 50) return 'Consider lighter activity today';
    return 'Focus on recovery and rest';
  };

  const getGradientColors = (score: number): [string, string] => {
    if (score >= 80) return ['#34C759', '#30D158'];
    if (score >= 65) return ['#007AFF', '#0A84FF'];
    if (score >= 50) return ['#FF9500', '#FF9F0A'];
    return ['#FF3B30', '#FF453A'];
  };

  const formatSleep = (minutes: number | undefined): string => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!metrics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>BioLoop</Text>
            <Text style={styles.date}>Welcome</Text>
          </View>
        </View>
        <EmptyDataView
          icon="favorite"
          iosIcon="heart.fill"
          title="Welcome to BioLoop"
          message="Grant HealthKit access to start tracking your health metrics and biological age."
          actionTitle="Enable HealthKit"
          action={handleRequestPermission}
        />
      </SafeAreaView>
    );
  }

  const readinessScore = calculateReadinessScore();
  const readinessLevel = getReadinessLevel(readinessScore);
  const readinessMessage = getReadinessMessage(readinessScore);
  const [gradientStart, gradientEnd] = getGradientColors(readinessScore);
  const scoreColor = getScoreColor(readinessScore);
  const readinessText = readinessScore.toString();
  const sleepText = formatSleep(metrics.sleepDuration);
  const hrvText = metrics.hrv ? Math.round(metrics.hrv).toString() : '--';
  const restingHRText = metrics.restingHR ? Math.round(metrics.restingHR).toString() : '--';
  const vo2maxText = metrics.vo2max ? Math.round(metrics.vo2max).toString() : '--';
  const greetingText = getGreeting();
  const dateText = formatDate(new Date());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greetingText}</Text>
          <Text style={styles.date}>{dateText}</Text>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleRefresh}
          disabled={loading}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.readinessCard}>
          <Text style={styles.readinessLabel}>Today's Readiness</Text>
          
          <View style={styles.gaugeContainer}>
            <Svg width={200} height={200}>
              <Defs>
                <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={gradientStart} />
                  <Stop offset="100%" stopColor={gradientEnd} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={100}
                cy={100}
                r={80}
                stroke={colors.cardBackground}
                strokeWidth={16}
                fill="none"
              />
              <Circle
                cx={100}
                cy={100}
                r={80}
                stroke="url(#gaugeGradient)"
                strokeWidth={16}
                fill="none"
                strokeDasharray={`${(readinessScore / 100) * 502.4} 502.4`}
                strokeLinecap="round"
                rotation="-90"
                origin="100, 100"
              />
            </Svg>
          </View>

          <Text style={[styles.readinessValue, { color: scoreColor }]}>
            {readinessText}
          </Text>
          <Text style={[styles.readinessLevel, { color: scoreColor }]}>
            {readinessLevel}
          </Text>
          <Text style={styles.readinessMessage}>{readinessMessage}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/sleep-detail')}
            activeOpacity={0.7}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="bedtime"
                size={20}
                color="#5E5CE6"
                style={styles.metricIcon}
              />
              <Text style={styles.metricTitle}>Sleep</Text>
            </View>
            <Text style={styles.metricValue}>{sleepText}</Text>
            <Text style={styles.metricSubtext}>Last night</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/recovery-detail')}
            activeOpacity={0.7}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={20}
                color="#FF2D55"
                style={styles.metricIcon}
              />
              <Text style={styles.metricTitle}>HRV</Text>
            </View>
            <Text style={styles.metricValue}>{hrvText}</Text>
            <Text style={styles.metricSubtext}>ms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/recovery-detail')}
            activeOpacity={0.7}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="waveform.path.ecg"
                android_material_icon_name="monitor-heart"
                size={20}
                color="#FF9500"
                style={styles.metricIcon}
              />
              <Text style={styles.metricTitle}>Resting HR</Text>
            </View>
            <Text style={styles.metricValue}>{restingHRText}</Text>
            <Text style={styles.metricSubtext}>bpm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/strain-detail')}
            activeOpacity={0.7}
          >
            <View style={styles.metricHeader}>
              <IconSymbol
                ios_icon_name="wind"
                android_material_icon_name="air"
                size={20}
                color="#32ADE6"
                style={styles.metricIcon}
              />
              <Text style={styles.metricTitle}>VO2 Max</Text>
            </View>
            <Text style={styles.metricValue}>{vo2maxText}</Text>
            <Text style={styles.metricSubtext}>ml/kg/min</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/activity')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="bar-chart"
              size={24}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>View Performance</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.actionChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/biology')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="figure.walk"
              android_material_icon_name="directions-walk"
              size={24}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Check Biological Age</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.actionChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/metrics-glossary')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="book.fill"
              android_material_icon_name="menu-book"
              size={24}
              color={colors.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Metrics Guide</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.actionChevron}
            />
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleGenerateMockData}
            disabled={generatingMockData}
            activeOpacity={0.7}
          >
            <Text style={styles.debugButtonText}>
              {generatingMockData ? 'Generating...' : 'Generate Mock Data (Dev Only)'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
