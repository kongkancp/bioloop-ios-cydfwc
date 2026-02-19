
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
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyDataView from '@/components/EmptyDataView';
import HealthKitManager from '@/services/HealthKitManager';
import Svg, { Circle } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import BioLoopDebugger from '@/utils/debugHelper';

export default function HomeScreen() {
  const { metrics, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

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
          icon="heart"
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{dateString}</Text>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              console.log('HomeScreen: User tapped menu button');
              setShowDebugMenu(!showDebugMenu);
            }}
          >
            <IconSymbol
              ios_icon_name="ellipsis.circle"
              android_material_icon_name="more-vert"
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Debug Menu */}
        {showDebugMenu && (
          <View style={styles.debugMenu}>
            <TouchableOpacity 
              style={styles.debugMenuItem}
              onPress={handleDebugInfo}
            >
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.debugMenuText}>Debug Info</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.debugMenuItem}
              onPress={handleSync}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="sync"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.debugMenuText}>Force Sync</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Readiness Score Card */}
        <View style={styles.readinessCard}>
          <Text style={styles.cardTitle}>Today's Readiness</Text>
          
          <View style={styles.scoreContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
              {/* Background circle */}
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
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

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Performance Index */}
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
              <Text style={styles.metricLabel}>PerformanceNow I'll create a comprehensive debug helper utility and add logging throughout the app:

<write file="utils/debugHelper.ts">
// BioLoop Debug Helper
// Comprehensive logging and status reporting for debugging

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyMetrics, Baselines } from '@/types/health';
import { calculateAge } from './age';
import { startOfDay } from 'date-fns';

const STORAGE_KEYS = {
  USER_DOB: '@bioloop_user_dob',
  USER_HEIGHT: '@bioloop_user_height',
  USER_WEIGHT: '@bioloop_user_weight',
  METRICS_PREFIX: '@bioloop_metrics_',
  BASELINES: '@bioloop_baselines',
  BIOAGE_PREFIX: '@bioloop_bioage_',
  LAST_SYNC_DATE: '@bioloop_last_sync_date',
  ONBOARDING_COMPLETE: '@bioloop_onboarding_complete',
};

interface ProfileStatus {
  exists: boolean;
  dateOfBirth?: Date;
  age?: number;
  height?: number;
  weight?: number;
}

interface MetricsStatus {
  exists: boolean;
  date?: Date;
  restingHR?: number;
  hrv?: number;
  vo2max?: number;
  sleepDuration?: number;
  performanceIndex?: number;
  acwr?: number;
  loadScore?: number;
  recoveryEfficiency?: number;
  workoutCount?: number;
}

interface BioAgeStatus {
  exists: boolean;
  bioAge?: number;
  chronologicalAge?: number;
  ageGap?: number;
  longevityScore?: number;
}

interface BaselinesStatus {
  exists: boolean;
  restingHR?: number;
  hrv?: number;
  vo2max?: number;
}

interface DebugStatus {
  profile: ProfileStatus;
  metrics: MetricsStatus;
  bioAge: BioAgeStatus;
  baselines: BaselinesStatus;
  storage: {
    totalKeys: number;
    bioloopKeys: number;
  };
  lastSync?: Date;
  onboardingComplete: boolean;
}

class BioLoopDebugger {
  private static instance: BioLoopDebugger;

  private constructor() {}

  static getInstance(): BioLoopDebugger {
    if (!BioLoopDebugger.instance) {
      BioLoopDebugger.instance = new BioLoopDebugger();
    }
    return BioLoopDebugger.instance;
  }

  /**
   * Print comprehensive status to console
   */
  async printStatus(): Promise<void> {
    const status = await this.getStatus();
    
    console.log('\n' + '='.repeat(50));
    console.log('🔍 BIOLOOP STATUS');
    console.log('='.repeat(50));
    
    // Profile Status
    console.log('\n📋 PROFILE:');
    if (status.profile.exists) {
      console.log('  ✓ Profile exists');
      if (status.profile.dateOfBirth) {
        console.log(`  📅 Date of Birth: ${status.profile.dateOfBirth.toLocaleDateString()}`);
        console.log(`  🎂 Age: ${status.profile.age} years`);
      }
      if (status.profile.height) {
        console.log(`  📏 Height: ${status.profile.height} cm`);
      }
      if (status.profile.weight) {
        console.log(`  ⚖️  Weight: ${status.profile.weight} kg`);
      }
    } else {
      console.log('  ❌ No profile found');
    }
    
    // Metrics Status
    console.log('\n📊 METRICS:');
    if (status.metrics.exists) {
      console.log('  ✓ Metrics exist');
      if (status.metrics.date) {
        console.log(`  📅 Date: ${status.metrics.date.toLocaleDateString()}`);
      }
      if (status.metrics.restingHR !== undefined) {
        console.log(`  ❤️  Resting HR: ${status.metrics.restingHR.toFixed(0)} bpm`);
      }
      if (status.metrics.hrv !== undefined) {
        console.log(`  💓 HRV: ${status.metrics.hrv.toFixed(1)} ms`);
      }
      if (status.metrics.vo2max !== undefined) {
        console.log(`  🏃 VO2 Max: ${status.metrics.vo2max.toFixed(1)} ml/kg/min`);
      }
      if (status.metrics.sleepDuration !== undefined) {
        console.log(`  😴 Sleep: ${status.metrics.sleepDuration.toFixed(1)} hours`);
      }
      if (status.metrics.performanceIndex !== undefined) {
        console.log(`  📈 Performance Index: ${status.metrics.performanceIndex.toFixed(1)}`);
      }
      if (status.metrics.acwr !== undefined) {
        console.log(`  📊 ACWR: ${status.metrics.acwr.toFixed(2)}`);
      }
      if (status.metrics.loadScore !== undefined) {
        console.log(`  💪 Load Score: ${status.metrics.loadScore.toFixed(1)}`);
      }
      if (status.metrics.recoveryEfficiency !== undefined) {
        console.log(`  🔄 Recovery: ${status.metrics.recoveryEfficiency.toFixed(1)}%`);
      }
      if (status.metrics.workoutCount !== undefined) {
        console.log(`  🏋️  Workouts: ${status.metrics.workoutCount}`);
      }
    } else {
      console.log('  ❌ No metrics found');
    }
    
    // BioAge Status
    console.log('\n🧬 BIOAGE:');
    if (status.bioAge.exists) {
      console.log('  ✓ BioAge calculated');
      if (status.bioAge.bioAge !== undefined) {
        console.log(`  🎯 BioAge: ${status.bioAge.bioAge.toFixed(1)} years`);
      }
      if (status.bioAge.chronologicalAge !== undefined) {
        console.log(`  📅 Chronological Age: ${status.bioAge.chronologicalAge} years`);
      }
      if (status.bioAge.ageGap !== undefined) {
        const gapSign = status.bioAge.ageGap >= 0 ? '+' : '';
        const emoji = status.bioAge.ageGap < -2 ? '🌟' : status.bioAge.ageGap > 2 ? '⚠️' : '💪';
        console.log(`  ${emoji} Age Gap: ${gapSign}${status.bioAge.ageGap.toFixed(1)} years`);
      }
      if (status.bioAge.longevityScore !== undefined) {
        console.log(`  ⭐ Longevity Score: ${status.bioAge.longevityScore.toFixed(0)}/100`);
      }
    } else {
      console.log('  ❌ No BioAge data');
    }
    
    // Baselines Status
    console.log('\n📐 BASELINES:');
    if (status.baselines.exists) {
      console.log('  ✓ Baselines calculated');
      if (status.baselines.restingHR !== undefined) {
        console.log(`  ❤️  Baseline Resting HR: ${status.baselines.restingHR.toFixed(0)} bpm`);
      }
      if (status.baselines.hrv !== undefined) {
        console.log(`  💓 Baseline HRV: ${status.baselines.hrv.toFixed(1)} ms`);
      }
      if (status.baselines.vo2max !== undefined) {
        console.log(`  🏃 Baseline VO2 Max: ${status.baselines.vo2max.toFixed(1)} ml/kg/min`);
      }
    } else {
      console.log('  ❌ No baselines calculated');
    }
    
    // Storage Status
    console.log('\n💾 STORAGE:');
    console.log(`  📦 Total Keys: ${status.storage.totalKeys}`);
    console.log(`  🔑 BioLoop Keys: ${status.storage.bioloopKeys}`);
    
    // Sync Status
    console.log('\n🔄 SYNC:');
    console.log(`  ✓ Onboarding Complete: ${status.onboardingComplete ? 'Yes' : 'No'}`);
    if (status.lastSync) {
      console.log(`  📅 Last Sync: ${status.lastSync.toLocaleString()}`);
    } else {
      console.log('  ❌ Never synced');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }

  /**
   * Get comprehensive status object
   */
  async getStatus(): Promise<DebugStatus> {
    const profile = await this.getProfileStatus();
    const metrics = await this.getMetricsStatus();
    const bioAge = await this.getBioAgeStatus();
    const baselines = await this.getBaselinesStatus();
    const storage = await this.getStorageStatus();
    const lastSync = await this.getLastSyncDate();
    const onboardingComplete = await this.isOnboardingComplete();
    
    return {
      profile,
      metrics,
      bioAge,
      baselines,
      storage,
      lastSync,
      onboardingComplete,
    };
  }

  /**
   * Get profile status
   */
  private async getProfileStatus(): Promise<ProfileStatus> {
    try {
      const dobStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DOB);
      const heightStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_HEIGHT);
      const weightStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_WEIGHT);
      
      if (!dobStr) {
        return { exists: false };
      }
      
      const dateOfBirth = new Date(dobStr);
      const age = calculateAge(dateOfBirth);
      const height = heightStr ? parseFloat(heightStr) : undefined;
      const weight = weightStr ? parseFloat(weightStr) : undefined;
      
      return {
        exists: true,
        dateOfBirth,
        age,
        height,
        weight,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting profile status', error);
      return { exists: false };
    }
  }

  /**
   * Get metrics status
   */
  private async getMetricsStatus(): Promise<MetricsStatus> {
    try {
      const today = startOfDay(new Date());
      const key = `${STORAGE_KEYS.METRICS_PREFIX}${today.toISOString()}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        return { exists: false };
      }
      
      const metrics: DailyMetrics = JSON.parse(data);
      
      return {
        exists: true,
        date: new Date(metrics.date),
        restingHR: metrics.restingHR,
        hrv: metrics.hrv,
        vo2max: metrics.vo2max,
        sleepDuration: metrics.sleepDuration,
        performanceIndex: metrics.performanceIndex,
        acwr: metrics.acwr,
        loadScore: metrics.loadScore,
        recoveryEfficiency: metrics.recoveryEfficiency,
        workoutCount: metrics.workouts?.length || 0,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting metrics status', error);
      return { exists: false };
    }
  }

  /**
   * Get BioAge status
   */
  private async getBioAgeStatus(): Promise<BioAgeStatus> {
    try {
      const today = startOfDay(new Date());
      const key = `${STORAGE_KEYS.BIOAGE_PREFIX}${today.toISOString()}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        return { exists: false };
      }
      
      const bioAgeData = JSON.parse(data);
      
      return {
        exists: true,
        bioAge: bioAgeData.bioAgeSmoothed,
        chronologicalAge: bioAgeData.chronologicalAge,
        ageGap: bioAgeData.bioAgeSmoothed - bioAgeData.chronologicalAge,
        longevityScore: bioAgeData.longevityScore,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting BioAge status', error);
      return { exists: false };
    }
  }

  /**
   * Get baselines status
   */
  private async getBaselinesStatus(): Promise<BaselinesStatus> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BASELINES);
      
      if (!data) {
        return { exists: false };
      }
      
      const baselines: Baselines = JSON.parse(data);
      
      return {
        exists: true,
        restingHR: baselines.restingHR,
        hrv: baselines.hrv,
        vo2max: baselines.vo2max,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting baselines status', error);
      return { exists: false };
    }
  }

  /**
   * Get storage status
   */
  private async getStorageStatus(): Promise<{ totalKeys: number; bioloopKeys: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const bioloopKeys = allKeys.filter(key => 
        key.startsWith('@bioloop_') || key.includes('bioloop')
      );
      
      return {
        totalKeys: allKeys.length,
        bioloopKeys: bioloopKeys.length,
      };
    } catch (error) {
      console.error('DebugHelper: Error getting storage status', error);
      return { totalKeys: 0, bioloopKeys: 0 };
    }
  }

  /**
   * Get last sync date
   */
  private async getLastSyncDate(): Promise<Date | undefined> {
    try {
      const dateStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_DATE);
      return dateStr ? new Date(dateStr) : undefined;
    } catch (error) {
      console.error('DebugHelper: Error getting last sync date', error);
      return undefined;
    }
  }

  /**
   * Check if onboarding is complete
   */
  private async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('DebugHelper: Error checking onboarding status', error);
      return false;
    }
  }

  /**
   * Log a formatted message with timestamp
   */
  log(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}]`;
    
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Log an error with stack trace
   */
  error(category: string, message: string, error?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ❌`;
    
    console.error(prefix, message);
    if (error) {
      console.error(prefix, 'Error details:', error);
      if (error.stack) {
        console.error(prefix, 'Stack trace:', error.stack);
      }
    }
  }

  /**
   * Log a warning
   */
  warn(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ⚠️`;
    
    if (data !== undefined) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }

  /**
   * Log a success message
   */
  success(category: string, message: string, data?: any): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${category}] ✓`;
    
    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

export default BioLoopDebugger.getInstance();
</write file>

Now I'll add the debug menu to the Home screen with both base and iOS versions:

<write file="app/(tabs)/(home)/index.tsx">
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
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    BioLoopDebugger.log('HomeScreen', 'User tapped Sync button');
    await syncNow(true);
  };

  const handleRefresh = async () => {
    BioLoopDebugger.log('HomeScreen', 'User pulled to refresh');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    BioLoopDebugger.log('HomeScreen', 'User tapped Request Permission button');
    try {
      const granted = await HealthKitManager.requestAuthorization();
      if (granted) {
        BioLoopDebugger.success('HomeScreen', 'HealthKit permission granted');
        await syncNow(true);
      } else {
        BioLoopDebugger.warn('HomeScreen', 'HealthKit permission denied');
      }
    } catch (error) {
      BioLoopDebugger.error('HomeScreen', 'Failed to request HealthKit permission', error);
    }
  };

  const handleDebugInfo = () => {
    BioLoopDebugger.log('HomeScreen', 'User tapped Debug Info button');
    BioLoopDebugger.printStatus();
  };

  const calculateReadinessScore = (): number => {
    if (!metrics) return 0;
    
    let score = 50;
    
    if (metrics.performanceIndex !== undefined) {
      score += (metrics.performanceIndex - 50) * 0.5;
    }
    
    if (metrics.recoveryEfficiency !== undefined) {
      score += (metrics.recoveryEfficiency - 50) * 0.3;
    }
    
    if (metrics.acwr !== undefined) {
      const acwrScore = metrics.acwr >= 0.8 && metrics.acwr <= 1.3 ? 20 : 0;
      score += acwrScore * 0.2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const getReadinessColor = (score: number): string => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Poor';
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

  const readinessScore = calculateReadinessScore();
  const readinessColor = getReadinessColor(readinessScore);
  const readinessLevel = getReadinessLevel(readinessScore);
  const greetingText = getGreeting();
  const dateString = getCurrentDateString();

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Home',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={handleDebugInfo}>
                <IconSymbol 
                  ios_icon_name="info.circle" 
                  android_material_icon_name="info" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSync} disabled={syncing}>
                <IconSymbol 
                  ios_icon_name="arrow.clockwise" 
                  android_material_icon_name="refresh" 
                  size={24} 
                  color={syncing ? colors.textSecondary : colors.text} 
                />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your health data...</Text>
          </View>
        ) : !metrics ? (
          <EmptyDataView
            icon="heart"
            iosIcon="heart.fill"
            title="No Health Data"
            message="Grant HealthKit permissions to see your daily readiness score and health metrics."
            actionTitle="Grant Permission"
            onAction={handleRequestPermission}
          />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>{greetingText}</Text>
              <Text style={styles.date}>{dateString}</Text>
            </View>

            <View style={styles.readinessCard}>
              <Text style={styles.cardTitle}>Daily Readiness</Text>
              
              <View style={styles.scoreContainer}>
                <Svg width={180} height={180}>
                  <Circle
                    cx={90}
                    cy={90}
                    r={70}
                    stroke={colors.border}
                    strokeWidth={12}
                    fill="none"
                  />
                  <Circle
                    cx={90}
                    cy={90}
                    r={70}
                    stroke={readinessColor}
                    strokeWidth={12}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 90 90)`}
                  />
                </Svg>
                
                <View style={styles.scoreTextContainer}>
                  <Text style={[styles.scoreValue, { color: readinessColor }]}>
                    {Math.round(readinessScore)}
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
          </>
        )}
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
