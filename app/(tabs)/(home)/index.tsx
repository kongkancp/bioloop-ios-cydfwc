
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
import { Stack } from 'expo-router';
import EmptyDataView from '@/components/EmptyDataView';
import HealthKitManager from '@/services/HealthKitManager';
import Svg, { Circle } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import BioLoopDebugger from '@/utils/debugHelper';

export default function HomeScreen() {
  const { metrics, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    console.log('HomeScreen: User tapped Sync button');
    BioLoopDebugger.log('HomeScreen', 'Manual sync initiated by user');
    await syncNow(true);
  };

  const handleRefresh = async () => {
    console.log('HomeScreen: Pull-to-refresh triggered');
    BioLoopDebugger.log('HomeScreen', 'Pull-to-refresh sync initiated');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    console.log('HomeScreen: User tapped Request Permission button');
    BioLoopDebugger.log('HomeScreen', 'HealthKit permission request initiated');
    try {
      const granted = await HealthKitManager.requestAuthorization();
      if (granted) {
        BioLoopDebugger.success('HomeScreen', 'HealthKit permission granted');
        await syncNow(true);
      } else {
        BioLoopDebugger.warn('HomeScreen', 'HealthKit permission denied');
      }
    } catch (error) {
      BioLoopDebugger.error('HomeScreen', 'HealthKit permission request failed', error);
    }
  };

  const handleDebugInfo = async () => {
    console.log('HomeScreen: User tapped Debug Info button');
    await BioLoopDebugger.printStatus();
  };

  const calculateReadinessScore = (): number => {
    if (!metrics) return 0;
    
    let score = 0;
    let components = 0;

    if (metrics.performanceIndex !== undefined) {
      score += metrics.performanceIndex;
      components++;
    }

    if (metrics.recoveryEfficiency !== undefined) {
      score += metrics.recoveryEfficiency;
      components++;
    }

    if (components === 0) return 0;
    
    const readinessScore = score / components;
    BioLoopDebugger.log('HomeScreen', 'Readiness score calculated', { score: readinessScore, components });
    return readinessScore;
  };

  const getReadinessColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDateString = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    BioLoopDebugger.log('HomeScreen', 'Loading initial data');
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
    BioLoopDebugger.warn('HomeScreen', 'No metrics available, showing empty state');
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

  const readinessScore = calculateReadinessScore();
  const readinessColor = getReadinessColor(readinessScore);
  const readinessLevel = getReadinessLevel(readinessScore);
  const greeting = getGreeting();
  const dateString = getCurrentDateString();

  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (readinessScore / 100) * circumference;

  BioLoopDebugger.log('HomeScreen', 'Rendering home screen', {
    readinessScore,
    readinessLevel,
    hasMetrics: !!metrics,
  });

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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleDebugInfo}
          >
            <IconSymbol
              ios_icon_name="ellipsis.circle"
              android_material_icon_name="more-vert"
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.readinessCard}>
          <Text style={styles.cardTitle}>Today's Readiness</Text>
          
          <View style={styles.scoreContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
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
                stroke={readinessColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                rotation="-90"
                origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
              />
            </Svg>
            
            <View style={styles.scoreTextContainer}>
              <Text style={[styles.scoreValue, { color: readinessColor }]}>
                {readinessScore.toFixed(0)}
              </Text>
              <Text style={styles.scoreLabel}>{readinessLevel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.performanceIndex !== undefined && (
            <View style={styles.metricCard}>
              <IconSymbol
                ios_icon_name="chart.line.uptrend.xyaxis"
                android_material_icon_name="trending-up"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.metricValue}>
                {metrics.performanceIndex.toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>Performance</Text>
            </View>
          )}

          {metrics.recoveryEfficiency !== undefined && (
            <View style={styles.metricCard}>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={24}
                color={colors.success}
              />
              <Text style={styles.metricValue}>
                {metrics.recoveryEfficiency.toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Recovery</Text>
            </View>
          )}

          {metrics.restingHR !== undefined && (
            <View style={styles.metricCard}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={24}
                color={colors.error}
              />
              <Text style={styles.metricValue}>
                {Math.round(metrics.restingHR)}
              </Text>
              <Text style={styles.metricLabel}>Resting HR</Text>
            </View>
          )}

          {metrics.hrv !== undefined && (
            <View style={styles.metricCard}>
              <IconSymbol
                ios_icon_name="waveform.path.ecg"
                android_material_icon_name="show-chart"
                size={24}
                color={colors.warning}
              />
              <Text style={styles.metricValue}>
                {Math.round(metrics.hrv)}
              </Text>
              <Text style={styles.metricLabel}>HRV</Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuButton: {
    padding: 4,
  },
  readinessCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  scoreContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
