
// Mock Health Data Generator
// Simulates HealthKit data for testing and demonstration purposes

import AsyncStorage from '@react-native-async-storage/async-storage';
import { startOfDay, subDays } from 'date-fns';
import { DailyMetrics, WorkoutSession } from '@/types/health';

const MOCK_DATA_ENABLED_KEY = '@bioloop_mock_data_enabled';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';
const USER_DOB_KEY = '@bioloop_user_dob';
const USER_HEIGHT_KEY = '@bioloop_user_height';
const USER_WEIGHT_KEY = '@bioloop_user_weight';

class MockHealthDataGenerator {
  private static instance: MockHealthDataGenerator;

  private constructor() {
    console.log('MockHealthDataGenerator: Initialized');
  }

  static getInstance(): MockHealthDataGenerator {
    if (!MockHealthDataGenerator.instance) {
      MockHealthDataGenerator.instance = new MockHealthDataGenerator();
    }
    return MockHealthDataGenerator.instance;
  }

  /**
   * Enable mock data mode
   */
  async enableMockData(): Promise<void> {
    await AsyncStorage.setItem(MOCK_DATA_ENABLED_KEY, 'true');
    console.log('✓ Mock data mode enabled');
  }

  /**
   * Disable mock data mode
   */
  async disableMockData(): Promise<void> {
    await AsyncStorage.removeItem(MOCK_DATA_ENABLED_KEY);
    console.log('✓ Mock data mode disabled');
  }

  /**
   * Check if mock data mode is enabled
   */
  async isMockDataEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(MOCK_DATA_ENABLED_KEY);
    return enabled === 'true';
  }

  /**
   * Generate realistic mock profile data
   */
  async generateMockProfile(): Promise<void> {
    console.log('📝 Generating mock profile...');

    // Generate a date of birth (30 years old)
    const dateOfBirth = new Date();
    dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 30);
    dateOfBirth.setMonth(5); // June
    dateOfBirth.setDate(15);

    // Generate height (175 cm)
    const height = 175;

    // Generate weight (70 kg)
    const weight = 70;

    await AsyncStorage.setItem(USER_DOB_KEY, dateOfBirth.toISOString());
    await AsyncStorage.setItem(USER_HEIGHT_KEY, height.toString());
    await AsyncStorage.setItem(USER_WEIGHT_KEY, weight.toString());

    console.log('✓ Mock profile generated:', {
      dateOfBirth: dateOfBirth.toISOString().split('T')[0],
      age: 30,
      height: `${height} cm`,
      weight: `${weight} kg`,
    });
  }

  /**
   * Generate realistic workout data
   */
  private generateWorkout(date: Date, workoutType: 'rest' | 'light' | 'moderate' | 'hard'): WorkoutSession[] {
    if (workoutType === 'rest') {
      return [];
    }

    const workouts: WorkoutSession[] = [];

    // Morning workout
    const morningStart = new Date(date);
    morningStart.setHours(7, 30, 0, 0);

    if (workoutType === 'light') {
      workouts.push({
        startTime: morningStart,
        duration: 30,
        averageHR: 125,
        peakHR: 145,
        hrAfter60s: 95,
        type: 'Walking',
      });
    } else if (workoutType === 'moderate') {
      workouts.push({
        startTime: morningStart,
        duration: 45,
        averageHR: 145,
        peakHR: 165,
        hrAfter60s: 110,
        type: 'Running',
      });
    } else if (workoutType === 'hard') {
      workouts.push({
        startTime: morningStart,
        duration: 60,
        averageHR: 160,
        peakHR: 180,
        hrAfter60s: 125,
        type: 'HIIT',
      });
    }

    return workouts;
  }

  /**
   * Generate realistic health metrics for a specific day
   */
  private generateDayMetrics(date: Date, dayIndex: number): DailyMetrics {
    // Create a realistic pattern over 30 days
    // Week 1: Light training
    // Week 2: Moderate training
    // Week 3: Hard training
    // Week 4: Recovery

    const weekNumber = Math.floor(dayIndex / 7);
    const dayOfWeek = dayIndex % 7;

    let workoutType: 'rest' | 'light' | 'moderate' | 'hard' = 'rest';
    let baseHRV = 55;
    let baseRestingHR = 62;
    let baseSleep = 7.5;

    // Determine workout intensity based on training cycle
    if (weekNumber === 0) {
      // Week 1: Light
      workoutType = dayOfWeek < 5 ? 'light' : 'rest';
      baseHRV = 60;
      baseRestingHR = 60;
      baseSleep = 7.8;
    } else if (weekNumber === 1) {
      // Week 2: Moderate
      workoutType = dayOfWeek < 5 ? 'moderate' : 'rest';
      baseHRV = 55;
      baseRestingHR = 63;
      baseSleep = 7.5;
    } else if (weekNumber === 2) {
      // Week 3: Hard
      workoutType = dayOfWeek < 4 ? 'hard' : dayOfWeek === 4 ? 'light' : 'rest';
      baseHRV = 48;
      baseRestingHR = 66;
      baseSleep = 7.0;
    } else {
      // Week 4: Recovery
      workoutType = dayOfWeek < 3 ? 'light' : 'rest';
      baseHRV = 62;
      baseRestingHR = 59;
      baseSleep = 8.0;
    }

    // Add some natural variation
    const hrvVariation = (Math.random() - 0.5) * 8;
    const rhrVariation = (Math.random() - 0.5) * 4;
    const sleepVariation = (Math.random() - 0.5) * 1.5;

    const workouts = this.generateWorkout(date, workoutType);

    const metrics: DailyMetrics = {
      date: startOfDay(date),
      restingHR: Math.round(baseRestingHR + rhrVariation),
      hrv: Math.round(baseHRV + hrvVariation),
      vo2max: 42 + (Math.random() - 0.5) * 3,
      sleepDuration: Math.max(6, Math.min(9, baseSleep + sleepVariation)),
      bodyMass: 70 + (Math.random() - 0.5) * 2,
      workouts,
      computedAt: new Date(),
    };

    return metrics;
  }

  /**
   * Generate 30 days of historical health data
   */
  async generateHistoricalData(days: number = 30): Promise<void> {
    console.log(`📊 Generating ${days} days of mock health data...`);

    const today = startOfDay(new Date());
    const metricsToSave: Array<{ key: string; data: string }> = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const metrics = this.generateDayMetrics(date, days - i - 1);

      const key = `${METRICS_STORAGE_PREFIX}${date.toISOString()}`;
      metricsToSave.push({
        key,
        data: JSON.stringify(metrics),
      });
    }

    // Save all metrics in batch
    for (const item of metricsToSave) {
      await AsyncStorage.setItem(item.key, item.data);
    }

    console.log(`✓ Generated ${days} days of mock health data`);
    console.log('✓ Data includes:');
    console.log('  - Resting heart rate (59-66 bpm)');
    console.log('  - HRV (48-62 ms)');
    console.log('  - VO2 max (40-45 ml/kg/min)');
    console.log('  - Sleep duration (6.5-8.5 hours)');
    console.log('  - Body mass (69-71 kg)');
    console.log('  - Workouts (varied intensity)');
  }

  /**
   * Setup complete mock environment
   */
  async setupMockEnvironment(): Promise<void> {
    console.log('🚀 Setting up complete mock environment...');

    // Enable mock data mode
    await this.enableMockData();

    // Generate profile
    await this.generateMockProfile();

    // Generate 30 days of historical data
    await this.generateHistoricalData(30);

    console.log('✅ Mock environment setup complete!');
    console.log('');
    console.log('You can now:');
    console.log('  1. View your Performance Index on the Home tab');
    console.log('  2. See detailed metrics on the Activity tab');
    console.log('  3. Check your BioAge on the Biology tab');
    console.log('  4. Edit your profile on the Profile tab');
  }

  /**
   * Clear all mock data
   */
  async clearMockData(): Promise<void> {
    console.log('🗑 Clearing all mock data...');

    const allKeys = await AsyncStorage.getAllKeys();
    const mockKeys = allKeys.filter(
      (key) =>
        key.startsWith(METRICS_STORAGE_PREFIX) ||
        key === USER_DOB_KEY ||
        key === USER_HEIGHT_KEY ||
        key === USER_WEIGHT_KEY ||
        key === MOCK_DATA_ENABLED_KEY
    );

    if (mockKeys.length > 0) {
      await AsyncStorage.multiRemove(mockKeys);
      console.log(`✓ Cleared ${mockKeys.length} mock data items`);
    }

    console.log('✅ Mock data cleared');
  }
}

export default MockHealthDataGenerator.getInstance();
</write file>

<write file="services/HealthKitManager.ts">
// HealthKit Manager Service
// Handles all HealthKit data queries with defensive programming and validation
// This is a TypeScript wrapper that will interface with native HealthKit

import { DailyMetrics, WorkoutSession, HealthKitError } from '@/types/health';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import MockHealthDataGenerator from './MockHealthDataGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_DATA_ENABLED_KEY = '@bioloop_mock_data_enabled';
const METRICS_STORAGE_PREFIX = '@bioloop_metrics_';

class HealthKitManager {
  private static instance: HealthKitManager;
  private healthKitAvailable: boolean = false;

  private constructor() {
    console.log('HealthKitManager: Initializing');
    this.healthKitAvailable = this.checkHealthKitAvailability();
  }

  public static getInstance(): HealthKitManager {
    if (!HealthKitManager.instance) {
      HealthKitManager.instance = new HealthKitManager();
    }
    return HealthKitManager.instance;
  }

  private checkHealthKitAvailability(): boolean {
    // In a real implementation, this would check HKHealthStore.isHealthDataAvailable()
    console.log('HealthKitManager: Checking HealthKit availability');
    return true;
  }

  async isAuthorized(): Promise<boolean> {
    // Check if mock data mode is enabled
    const mockEnabled = await AsyncStorage.getItem(MOCK_DATA_ENABLED_KEY);
    if (mockEnabled === 'true') {
      console.log('HealthKitManager: Mock data mode enabled - simulating authorization');
      return true;
    }

    // In real implementation, check actual HealthKit authorization
    return false;
  }

  async requestAuthorization(): Promise<boolean> {
    try {
      console.log('HealthKitManager: Requesting HealthKit authorization');
      
      // Check if mock data mode is enabled
      const mockEnabled = await AsyncStorage.getItem(MOCK_DATA_ENABLED_KEY);
      if (mockEnabled === 'true') {
        console.log('HealthKitManager: Mock data mode - authorization granted');
        return true;
      }

      // In a real implementation, this would call:
      // HKHealthStore.requestAuthorization(toShare: nil, read: healthKitReadTypes)
      // For the following types:
      // - Heart rate samples (HKQuantityType.heartRate)
      // - Resting heart rate (HKQuantityType.restingHeartRate)
      // - Heart rate variability SDNN (HKQuantityType.heartRateVariabilitySDNN)
      // - VO2 max (HKQuantityType.vo2Max)
      // - Workout type (HKWorkoutType)
      // - Sleep analysis (HKCategoryType.sleepAnalysis)
      // - Body mass (HKQuantityType.bodyMass)
      // - Height (HKQuantityType.height)
      // - Date of birth (HKCharacteristicType.dateOfBirth)
      
      // Mock authorization success
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('HealthKitManager: Authorization granted');
      return true;
    } catch (error) {
      console.error('HealthKitManager: Authorization failed', error);
      throw new Error(HealthKitError.Unauthorized);
    }
  }

  /**
   * Fetch daily metrics for a specific date
   * Queries HealthKit for all required data types
   */
  async fetchDailyMetrics(date: Date): Promise<DailyMetrics> {
    try {
      console.log('HealthKitManager: Fetching daily metrics for', date.toISOString());
      
      // Check if mock data mode is enabled
      const mockEnabled = await AsyncStorage.getItem(MOCK_DATA_ENABLED_KEY);
      if (mockEnabled === 'true') {
        console.log('HealthKitManager: Using mock data');
        return await this.fetchMockMetrics(date);
      }

      const authorized = await this.requestAuthorization();
      if (!authorized) {
        throw new Error(HealthKitError.Unauthorized);
      }

      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Query all metrics in parallel for efficiency
      const [restingHR, hrv, vo2max, sleepDuration, bodyMass, workouts] = await Promise.all([
        this.queryRestingHeartRate(dayStart, dayEnd),
        this.queryHRV(dayStart, dayEnd),
        this.queryVO2Max(),
        this.querySleepDuration(dayStart),
        this.queryBodyMass(dayStart, dayEnd),
        this.queryWorkouts(dayStart, dayEnd),
      ]);

      const metrics: DailyMetrics = {
        date: dayStart,
        restingHR,
        hrv,
        vo2max,
        sleepDuration,
        bodyMass,
        workouts,
        computedAt: new Date(),
      };

      console.log('HealthKitManager: Successfully fetched daily metrics', metrics);
      return metrics;
    } catch (error) {
      console.error('HealthKitManager: Error fetching daily metrics', error);
      
      // Return default/empty metrics on error (defensive programming)
      return {
        date: startOfDay(date),
        workouts: [],
        computedAt: new Date(),
      };
    }
  }

  /**
   * Fetch metrics from mock data storage
   */
  private async fetchMockMetrics(date: Date): Promise<DailyMetrics> {
    try {
      const key = `${METRICS_STORAGE_PREFIX}${startOfDay(date).toISOString()}`;
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        console.log('HealthKitManager: No mock data found for date');
        return {
          date: startOfDay(date),
          workouts: [],
          computedAt: new Date(),
        };
      }

      const metrics = JSON.parse(data);
      // Convert date strings back to Date objects
      metrics.date = new Date(metrics.date);
      metrics.computedAt = new Date(metrics.computedAt);
      if (metrics.workouts) {
        metrics.workouts = metrics.workouts.map((w: any) => ({
          ...w,
          startTime: new Date(w.startTime),
        }));
      }

      return metrics;
    } catch (error) {
      console.error('HealthKitManager: Error fetching mock metrics', error);
      return {
        date: startOfDay(date),
        workouts: [],
        computedAt: new Date(),
      };
    }
  }

  /**
   * Query Resting Heart Rate - Most recent sample from today
   * HKQuantityType.restingHeartRate
   */
  private async queryRestingHeartRate(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying resting heart rate');
      
      // Native implementation would use:
      // let type = HKQuantityType.restingHeartRate
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // Query for most recent sample
      
      // Mock data
      const mockValue = 62 + Math.random() * 10;
      return this.validateNumber(mockValue);
    } catch (error) {
      console.error('HealthKitManager: Error querying resting heart rate', error);
      return undefined;
    }
  }

  /**
   * Query HRV (SDNN) - Average of all samples from today
   * HKQuantityType.heartRateVariabilitySDNN
   */
  private async queryHRV(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying HRV (SDNN)');
      
      // Native implementation would use:
      // let type = HKQuantityType.heartRateVariabilitySDNN
      // Query all samples from today and calculate average
      
      // Mock data
      const mockValue = 45 + Math.random() * 15;
      return this.validateNumber(mockValue);
    } catch (error) {
      console.error('HealthKitManager: Error querying HRV', error);
      return undefined;
    }
  }

  /**
   * Query VO2 Max - Most recent sample within 30 days
   * HKQuantityType.vo2Max
   */
  private async queryVO2Max(): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying VO2 Max');
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      const now = new Date();
      
      // Native implementation would use:
      // let type = HKQuantityType.vo2Max
      // let predicate = HKQuery.predicateForSamples(withStart: thirtyDaysAgo, end: now)
      // Query for most recent sample within 30 days
      
      // Mock data
      const mockValue = 40 + Math.random() * 10;
      return this.validateNumber(mockValue);
    } catch (error) {
      console.error('HealthKitManager: Error querying VO2 Max', error);
      return undefined;
    }
  }

  /**
   * Query Sleep Duration - Sum of all sleep stages from previous night
   * HKCategoryType.sleepAnalysis
   */
  private async querySleepDuration(forDate: Date): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying sleep duration');
      
      // Previous night ends at the start of the current day
      const previousNightEnd = startOfDay(forDate);
      const previousNightStart = subDays(previousNightEnd, 1);
      
      // Native implementation would use:
      // let type = HKCategoryType.sleepAnalysis
      // Query all sleep stages from previous night
      // Sum durations of all sleep stages (asleep, core, deep, REM)
      
      // Mock data (in hours)
      const mockValue = 6.5 + Math.random() * 2;
      return this.validateNumber(mockValue);
    } catch (error) {
      console.error('HealthKitManager: Error querying sleep duration', error);
      return undefined;
    }
  }

  /**
   * Query Body Mass - Most recent sample from today
   * HKQuantityType.bodyMass
   */
  private async queryBodyMass(
    startDate: Date,
    endDate: Date
  ): Promise<number | undefined> {
    try {
      console.log('HealthKitManager: Querying body mass');
      
      // Native implementation would use:
      // let type = HKQuantityType.bodyMass
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // Query for most recent sample
      
      // Mock data (in kg)
      const mockValue = 70 + Math.random() * 10;
      return this.validateNumber(mockValue);
    } catch (error) {
      console.error('HealthKitManager: Error querying body mass', error);
      return undefined;
    }
  }

  /**
   * Query Workouts - All workouts from today
   * HKWorkoutType.workoutType()
   * For each: duration, avg HR, peak HR, HR 60s after
   */
  private async queryWorkouts(
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutSession[]> {
    try {
      console.log('HealthKitManager: Querying workouts');
      
      // Native implementation would use:
      // let workoutType = HKWorkoutType.workoutType()
      // let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
      // For each workout, query:
      // - duration
      // - average heart rate
      // - peak heart rate
      // - heart rate 60 seconds after workout end
      
      // Mock data
      const mockWorkouts: WorkoutSession[] = [
        {
          startTime: new Date(Date.now() - 3600000 * 2),
          duration: 45,
          averageHR: 145,
          peakHR: 172,
          hrAfter60s: 120,
          type: 'Running',
        },
      ];
      
      return mockWorkouts.map(w => this.validateWorkout(w));
    } catch (error) {
      console.error('HealthKitManager: Error querying workouts', error);
      return [];
    }
  }

  /**
   * Validate a number - check for nil, NaN, Infinity
   */
  private validateNumber(value: number | undefined | null): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    
    if (isNaN(value) || !isFinite(value)) {
      console.warn('HealthKitManager: Invalid number detected:', value);
      return undefined;
    }
    
    return value;
  }

  /**
   * Validate a workout session
   */
  private validateWorkout(workout: WorkoutSession): WorkoutSession {
    return {
      ...workout,
      duration: this.validateNumber(workout.duration) || 0,
      averageHR: this.validateNumber(workout.averageHR) || 0,
      peakHR: this.validateNumber(workout.peakHR) || 0,
      hrAfter60s: this.validateNumber(workout.hrAfter60s),
    };
  }
}

export default HealthKitManager.getInstance();
</write file>

Now let's add a button to the Profile screen to enable mock data:

<write file="app/(tabs)/profile.ios.tsx">
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionProduct } from '@/types/subscription';
import DataManager from '@/services/DataManager';
import MockHealthDataGenerator from '@/services/MockHealthDataGenerator';
import SyncManager from '@/services/SyncManager';

export default function ProfileScreen() {
  const router = useRouter();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingMockData, setIsGeneratingMockData] = useState(false);

  const handleEditProfile = () => {
    console.log('ProfileScreen: Navigating to edit profile');
    router.push('/edit-profile');
  };

  const handleUpgradeToPremium = () => {
    console.log('ProfileScreen: Navigating to subscription');
    router.push('/subscription');
  };

  const handleHealthKitPermissions = async () => {
    console.log('ProfileScreen: Opening HealthKit permissions');
    // In a real app, this would open iOS Settings > Health > Data Access & Devices > BioLoop
    Alert.alert(
      'HealthKit Permissions',
      'To modify HealthKit permissions, go to:\nSettings > Health > Data Access & Devices > BioLoop',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyLink = () => {
    console.log('ProfileScreen: Opening privacy policy');
    Linking.openURL('https://example.com/privacy');
  };

  const handleTermsLink = () => {
    console.log('ProfileScreen: Opening terms of service');
    Linking.openURL('https://example.com/terms');
  };

  const handleDeleteAllData = () => {
    console.log('ProfileScreen: Delete all data requested');
    setShowDeleteModal(true);
  };

  const confirmDeleteAllData = async () => {
    console.log('ProfileScreen: Confirming delete all data');
    setIsDeleting(true);
    
    try {
      await DataManager.deleteAllData();
      console.log('ProfileScreen: All data deleted successfully');
      setShowDeleteModal(false);
      Alert.alert('Success', 'All data has been deleted', [{ text: 'OK' }]);
    } catch (error) {
      console.error('ProfileScreen: Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteAllData = () => {
    console.log('ProfileScreen: Delete cancelled');
    setShowDeleteModal(false);
  };

  const handleEnableMockData = async () => {
    console.log('ProfileScreen: Enabling mock data');
    setIsGeneratingMockData(true);

    try {
      await MockHealthDataGenerator.setupMockEnvironment();
      
      // Trigger a sync to calculate all metrics
      await SyncManager.performSync();
      
      Alert.alert(
        'Mock Data Enabled',
        '30 days of realistic health data has been generated. All features are now available!\n\nYou can now:\n• View Performance Index\n• See Activity metrics\n• Check BioAge\n• Explore all features',
        [{ text: 'OK' }]
      );
      
      console.log('ProfileScreen: Mock data setup complete');
    } catch (error) {
      console.error('ProfileScreen: Error setting up mock data:', error);
      Alert.alert('Error', 'Failed to generate mock data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsGeneratingMockData(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerLargeTitle: true,
          headerTransparent: false,
          headerBlurEffect: 'systemMaterial',
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            {subscriptionLoading ? (
              <View style={styles.listItem}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.listItemText}>Loading subscription status...</Text>
              </View>
            ) : isPremium ? (
              <View style={styles.listItem}>
                <IconSymbol
                  ios_icon_name="checkmark.seal.fill"
                  android_material_icon_name="verified"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.listItemText}>Premium Active</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.listItem} onPress={handleUpgradeToPremium}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.listItemText}>Upgrade to Premium</Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handleEditProfile}>
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="person"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Edit Profile</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handleHealthKitPermissions}>
              <IconSymbol
                ios_icon_name="heart.text.square"
                android_material_icon_name="favorite"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>HealthKit Permissions</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.listItem} 
              onPress={handleEnableMockData}
              disabled={isGeneratingMockData}
            >
              <IconSymbol
                ios_icon_name="wand.and.stars"
                android_material_icon_name="auto-fix-high"
                size={24}
                color={colors.primary}
              />
              {isGeneratingMockData ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 12 }} />
                  <Text style={[styles.listItemText, { color: colors.primary }]}>Generating...</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.listItemText, { color: colors.primary }]}>Enable Mock Data</Text>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.primary}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            Enable mock data to simulate 30 days of health data and see all features in action
          </Text>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handlePrivacyLink}>
              <IconSymbol
                ios_icon_name="hand.raised"
                android_material_icon_name="privacy-tip"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Privacy Policy</Text>
              <IconSymbol
                ios_icon_name="arrow.up.right"
                android_material_icon_name="open-in-new"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={handleTermsLink}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Terms of Service</Text>
              <IconSymbol
                ios_icon_name="arrow.up.right"
                android_material_icon_name="open-in-new"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handleDeleteAllData}>
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={24}
                color={colors.error}
              />
              <Text style={[styles.listItemText, { color: colors.error }]}>Delete All Data</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            This will permanently delete all your health data and cannot be undone
          </Text>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>BioLoop v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteAllData}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete All Data?</Text>
            <Text style={styles.modalMessage}>
              This will permanently delete all your health data, metrics, and profile information. This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDeleteAllData}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteAllData}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextDelete}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionFooter: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  listItemText: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonDelete: {
    backgroundColor: colors.error,
  },
  modalButtonTextCancel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextDelete: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
