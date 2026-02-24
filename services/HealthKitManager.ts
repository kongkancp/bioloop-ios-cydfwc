
// HealthKit Manager Service
// Handles all HealthKit data queries with defensive programming and validation
// This is a TypeScript wrapper that will interface with native HealthKit

import { DailyMetrics, WorkoutSession, HealthKitError } from '@/types/health';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_MODE_KEY = '@bioloop_mock_mode';

class HealthKitManager {
  private static instance: HealthKitManager;
  private healthKitAvailable: boolean = false;
  private mockMode: boolean = false;

  private constructor() {
    console.log('HealthKitManager: Initializing');
    this.healthKitAvailable = this.checkHealthKitAvailability();
    this.loadMockMode();
  }

  public static getInstance(): HealthKitManager {
    if (!HealthKitManager.instance) {
      HealthKitManager.instance = new HealthKitManager();
    }
    return HealthKitManager.instance;
  }

  private async loadMockMode(): Promise<void> {
    try {
      const mockModeValue = await AsyncStorage.getItem(MOCK_MODE_KEY);
      this.mockMode = mockModeValue === 'true';
      console.log('HealthKitManager: Mock mode:', this.mockMode);
    } catch (error) {
      console.error('HealthKitManager: Failed to load mock mode', error);
      this.mockMode = false;
    }
  }

  /**
   * Enable mock mode for App Store review
   * This simulates HealthKit permissions being granted
   */
  async enableMockMode(): Promise<void> {
    console.log('HealthKitManager: Enabling mock mode (simulated permissions)');
    this.mockMode = true;
    await AsyncStorage.setItem(MOCK_MODE_KEY, 'true');
  }

  /**
   * Disable mock mode
   */
  async disableMockMode(): Promise<void> {
    console.log('HealthKitManager: Disabling mock mode');
    this.mockMode = false;
    await AsyncStorage.setItem(MOCK_MODE_KEY, 'false');
  }

  /**
   * Check if mock mode is enabled
   */
  async isMockModeEnabled(): Promise<boolean> {
    try {
      const mockModeValue = await AsyncStorage.getItem(MOCK_MODE_KEY);
      return mockModeValue === 'true';
    } catch (error) {
      console.error('HealthKitManager: Failed to check mock mode', error);
      return false;
    }
  }

  private checkHealthKitAvailability(): boolean {
    // In a real implementation, this would check HKHealthStore.isHealthDataAvailable()
    console.log('HealthKitManager: Checking HealthKit availability');
    return true;
  }

  async requestAuthorization(): Promise<boolean> {
    try {
      console.log('HealthKitManager: Requesting HealthKit authorization');
      
      // If mock mode is enabled, simulate granted permissions
      if (this.mockMode) {
        console.log('HealthKitManager: Mock mode enabled - simulating granted permissions');
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
      
      // TODO: Implement native HealthKit authorization
      // This requires native iOS module integration
      console.log('HealthKitManager: Authorization request - native implementation required');
      return false;
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
      
      const authorized = await this.requestAuthorization();
      if (!authorized) {
        console.log('HealthKitManager: Not authorized, returning empty metrics');
        return {
          date: startOfDay(date),
          workouts: [],
          computedAt: new Date(),
        };
      }

      // If mock mode is enabled, generate realistic mock data
      if (this.mockMode) {
        console.log('HealthKitManager: Mock mode - generating simulated data');
        return this.generateMockMetrics(date);
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
   * Generate realistic mock metrics for demo/review purposes
   */
  private generateMockMetrics(date: Date): DailyMetrics {
    const dayStart = startOfDay(date);
    const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Add realistic variation
    const trend = Math.sin(daysAgo / 7) * 5;
    const randomVariation = (Math.random() - 0.5) * 10;

    // Resting HR: 58-66 bpm
    const restingHR = Math.max(55, Math.min(70, 62 + trend + randomVariation * 0.5));

    // HRV: 50-70 ms
    const hrv = Math.max(45, Math.min(75, 60 + trend * 1.5 + randomVariation));

    // VO2 Max: 38-46 ml/kg/min
    const vo2max = Math.max(38, Math.min(46, 42 + trend * 0.5 + randomVariation * 0.3));

    // Sleep: 6.5-8.5 hours (in minutes)
    const sleepDuration = Math.max(360, Math.min(540, (7.5 + trend * 0.2 + randomVariation * 0.15) * 60));

    // Body mass: 74-76 kg
    const bodyMass = Math.max(73, Math.min(77, 75 + randomVariation * 0.1));

    // Generate workouts (60% chance)
    const workouts: WorkoutSession[] = [];
    if (Math.random() > 0.4) {
      const numWorkouts = Math.random() > 0.7 ? 2 : 1;
      for (let i = 0; i < numWorkouts; i++) {
        workouts.push(this.generateMockWorkout(date, i));
      }
    }

    return {
      date: dayStart,
      restingHR,
      hrv,
      vo2max,
      sleepDuration,
      bodyMass,
      workouts,
      computedAt: new Date(),
    };
  }

  /**
   * Generate a realistic mock workout
   */
  private generateMockWorkout(date: Date, index: number): WorkoutSession {
    const workoutTypes = ['Running', 'Cycling', 'Swimming', 'Strength Training', 'HIIT'];
    const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];

    const startTime = new Date(date);
    if (index === 0) {
      startTime.setHours(7, 0, 0, 0);
    } else {
      startTime.setHours(18, 0, 0, 0);
    }

    const duration = 45 + Math.floor(Math.random() * 45);
    const averageHR = 145 + Math.floor(Math.random() * 30);
    const peakHR = 170 + Math.floor(Math.random() * 15);
    const hrAfter60s = 125 + Math.floor(Math.random() * 15);

    return {
      startTime,
      duration,
      averageHR,
      peakHR,
      hrAfter60s,
      type,
    };
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Resting HR query - native implementation required');
      return undefined;
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: HRV query - native implementation required');
      return undefined;
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: VO2 Max query - native implementation required');
      return undefined;
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Sleep duration query - native implementation required');
      return undefined;
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Body mass query - native implementation required');
      return undefined;
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
      
      // TODO: Implement native HealthKit query
      console.log('HealthKitManager: Workouts query - native implementation required');
      return [];
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

Now I'll add a developer menu in the Profile screen to enable/disable mock mode:

<write file="app/(tabs)/profile.tsx">
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { SubscriptionProduct } from '@/types/subscription';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import DataManager from '@/services/DataManager';
import RestoreButton from '@/components/RestoreButton';
import HealthKitManager from '@/services/HealthKitManager';
import MockDataGenerator from '@/services/MockDataGenerator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  rowChevron: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
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
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
  },
  subscribedCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  manageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  freeCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  freeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devSection: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  devHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 12,
  },
  devDescription: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  mockModeButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  mockModeButtonDisabled: {
    backgroundColor: '#6C757D',
  },
  mockModeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateDataButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mockModeStatus: {
    fontSize: 14,
    color: '#856404',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});

function getPlanName(productId: string | null | undefined): string {
  if (!productId) return 'Premium';
  if (productId.includes('monthly')) return 'Monthly';
  if (productId.includes('annual')) return 'Annual';
  if (productId.includes('lifetime')) return 'Lifetime';
  return 'Premium';
}

function getPlanPrice(productId: string | null | undefined): string {
  if (!productId) return '';
  if (productId.includes('monthly')) return '$1.49/mo';
  if (productId.includes('annual')) return '$9.99/yr';
  if (productId.includes('lifetime')) return '$89.99';
  return '';
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isLifetime(productId: string | null | undefined): boolean {
  return productId?.includes('lifetime') ?? false;
}

function openAppStore(): void {
  Linking.openURL('https://apps.apple.com/account/subscriptions');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { status, loading, error, refetch } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mockModeEnabled, setMockModeEnabled] = useState(false);
  const [isTogglingMock, setIsTogglingMock] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  useEffect(() => {
    checkMockMode();
  }, []);

  async function checkMockMode() {
    const enabled = await HealthKitManager.isMockModeEnabled();
    setMockModeEnabled(enabled);
  }

  function handleEditProfile() {
    console.log('User tapped Edit Profile');
    router.push('/edit-profile');
  }

  function handleUpgradeToPremium() {
    console.log('User tapped Upgrade to Premium');
    router.push('/subscription-onboarding');
  }

  function handleManageSubscription() {
    console.log('User tapped Manage Subscription');
    openAppStore();
  }

  function handleHealthKitPermissions() {
    console.log('User tapped HealthKit Permissions');
    Alert.alert(
      'HealthKit Permissions',
      'To modify HealthKit permissions, please go to Settings > Health > Data Access & Devices > BioLoop',
      [{ text: 'OK' }]
    );
  }

  function handleMetricsGuide() {
    console.log('User tapped Metrics Guide');
    router.push('/metrics-glossary');
  }

  function handlePrivacyLink() {
    console.log('User tapped Privacy Policy');
    Linking.openURL('https://bioloop.app/privacy');
  }

  function handleTermsLink() {
    console.log('User tapped Terms of Service');
    Linking.openURL('https://bioloop.app/terms');
  }

  function handleDeleteAllData() {
    console.log('User tapped Delete All Data');
    setShowDeleteModal(true);
  }

  async function confirmDeleteAllData() {
    console.log('User confirmed Delete All Data');
    setShowDeleteModal(false);
    
    try {
      await DataManager.clearAllData();
      Alert.alert(
        'Success',
        'All data has been deleted. The app will now restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/onboarding');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to delete data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  }

  function cancelDeleteAllData() {
    console.log('User cancelled Delete All Data');
    setShowDeleteModal(false);
  }

  async function handleToggleMockMode() {
    if (isTogglingMock) return;
    
    console.log('User toggling mock mode');
    setIsTogglingMock(true);
    
    try {
      if (mockModeEnabled) {
        await HealthKitManager.disableMockMode();
        setMockModeEnabled(false);
        Alert.alert(
          'Mock Mode Disabled',
          'Real HealthKit data will be used (if permissions are granted).',
          [{ text: 'OK' }]
        );
      } else {
        await HealthKitManager.enableMockMode();
        setMockModeEnabled(true);
        Alert.alert(
          'Mock Mode Enabled',
          'Simulated health data will be used. Perfect for App Store review!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to toggle mock mode:', error);
      Alert.alert('Error', 'Failed to toggle mock mode. Please try again.');
    } finally {
      setIsTogglingMock(false);
    }
  }

  async function handleGenerateMockData() {
    if (isGeneratingData) return;
    
    console.log('User generating mock data');
    setIsGeneratingData(true);
    
    try {
      await MockDataGenerator.generateAllData();
      Alert.alert(
        'Success',
        '30 days of realistic health data has been generated! Pull to refresh on the Home screen to see it.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to generate mock data:', error);
      Alert.alert('Error', 'Failed to generate mock data. Please try again.');
    } finally {
      setIsGeneratingData(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="warning"
          size={48}
          color="#FF3B30"
        />
        <Text style={styles.errorText}>Failed to load subscription</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSubscribed = status?.isSubscribed ?? false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerLargeTitle: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Developer Tools Section */}
        <View style={styles.devSection}>
          <Text style={styles.devHeader}>🧪 App Review Mode</Text>
          <Text style={styles.devDescription}>
            Enable mock mode to simulate HealthKit permissions being granted. Perfect for App Store review!
          </Text>
          
          <TouchableOpacity
            style={[
              styles.mockModeButton,
              mockModeEnabled && styles.mockModeButtonDisabled,
            ]}
            onPress={handleToggleMockMode}
            disabled={isTogglingMock}
          >
            {isTogglingMock ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.mockModeButtonText}>
                {mockModeEnabled ? '✓ Mock Mode Enabled' : 'Enable Mock Mode'}
              </Text>
            )}
          </TouchableOpacity>

          {mockModeEnabled && (
            <>
              <TouchableOpacity
                style={styles.generateDataButton}
                onPress={handleGenerateMockData}
                disabled={isGeneratingData}
              >
                {isGeneratingData ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.mockModeButtonText}>Generate 30 Days of Data</Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.mockModeStatus}>
                Mock permissions are active. The app will show simulated health data.
              </Text>
            </>
          )}
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Subscription</Text>
          {isSubscribed ? (
            <SubscribedView
              productId={status?.productId}
              expirationDate={status?.expirationDate}
              onManage={handleManageSubscription}
            />
          ) : (
            <FreeUserView onUpgrade={handleUpgradeToPremium} />
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          
          <TouchableOpacity style={styles.row} onPress={handleEditProfile}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="person"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Edit Profile</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.lastRow]} onPress={handleHealthKitPermissions}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="heart.text.square"
                android_material_icon_name="favorite"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>HealthKit Permissions</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Help</Text>
          
          <TouchableOpacity style={styles.row} onPress={handleMetricsGuide}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="book"
                android_material_icon_name="menu-open"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Metrics Glossary</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handlePrivacyLink}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="lock.shield"
                android_material_icon_name="lock"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Privacy Policy</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.lastRow]} onPress={handleTermsLink}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Terms of Service</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Delete Data Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAllData}>
          <Text style={styles.deleteButtonText}>Delete All Data</Text>
        </TouchableOpacity>
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
              This will permanently delete all your health data, metrics, and settings. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDeleteAllData}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDeleteAllData}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SubscribedView({
  productId,
  expirationDate,
  onManage,
}: {
  productId?: string | null;
  expirationDate?: Date | null;
  onManage: () => void;
}) {
  const lifetime = isLifetime(productId);
  const planName = getPlanName(productId);
  const planPrice = getPlanPrice(productId);
  const expirationText = formatDate(expirationDate);

  return (
    <View style={styles.subscribedCard}>
      <View style={styles.premiumBadge}>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="star"
          size={18}
          color="#FFD700"
        />
        <Text style={styles.badgeText}>Premium Active</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {planName}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {planPrice}
          </Text>
        </View>
        {!lifetime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {expirationText}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.manageButton} onPress={onManage}>
        <Text style={styles.manageText}>Manage</Text>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="arrow-forward"
          size={14}
          color="#007AFF"
        />
      </TouchableOpacity>
    </View>
  );
}

function FreeUserView({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={styles.freeCard}>
      <Text style={styles.freeTitle}>Free Plan</Text>
      <Text style={styles.freeDescription}>
        Upgrade to Premium to unlock advanced analytics, longevity insights, and unlimited history.
      </Text>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}
