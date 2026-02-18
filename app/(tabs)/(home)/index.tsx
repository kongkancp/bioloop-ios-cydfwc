
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
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
import { useDailySync } from '@/hooks/useDailySync';
import Svg, { Circle } from 'react-native-svg';
import EmptyDataView from '@/components/EmptyDataView';
import HealthKitManager from '@/services/HealthKitManager';

export default function HomeScreen() {
  const { metrics, baselines, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  const handleSync = async () => {
    console.log('HomeScreen: User tapped Sync button');
    await syncNow(true);
  };

  const handleRefresh = async () => {
    console.log('HomeScreen: User pulled to refresh');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    console.log('HomeScreen: User requesting HealthKit permission');
    try {
      const manager = new HealthKitManager();
      const authorized = await manager.requestAuthorization();
      setHasPermission(authorized);
      
      if (authorized) {
        await syncNow(true);
      }
    } catch (error) {
      console.error('HomeScreen: Error requesting permission:', error);
    }
  };

  // Calculate Readiness Score
  const calculateReadinessScore = (): number => {
    if (!metrics) return 0;
    
    const recovery = metrics.recoveryEfficiency ?? 50;
    const sleepScore = ((metrics.sleepDuration ?? 7) / 8) * 100;
    const strain = 100 - (metrics.loadScore ?? 0);
    
    const readiness = (recovery * 0.5) + (sleepScore * 0.3) + (strain * 0.2);
    return Math.max(0, Math.min(100, readiness));
  };

  const readinessScore = calculateReadinessScore();

  // Get readiness color
  const getReadinessColor = (score: number): string => {
    if (score >= 80) return '#34C759';
    if (score >= 65) return '#30D158';
    if (score >= 50) return '#FFCC00';
    if (score >= 35) return '#FF9500';
    return '#FF3B30';
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 80) return 'OPTIMAL';
    if (score >= 65) return 'GOOD';
    if (score >= 50) return 'MODERATE';
    if (score >= 35) return 'LOW';
    return 'POOR';
  };

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format current date
  const getCurrentDateString = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  const greeting = getGreeting();
  const dateString = getCurrentDateString();
  const readinessColor = getReadinessColor(readinessScore);
  const readinessLevel = getReadinessLevel(readinessScore);

  // Component scores
  const recoveryScore = metrics?.recoveryEfficiency ?? 0;
  const sleepScore = ((metrics?.sleepDuration ?? 7) / 8) * 100;
  const strainScore = 100 - (metrics?.loadScore ?? 0);

  // Check if we need to show empty states
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyDataView
          icon="favorite-border"
          iosIcon="heart.text.square"
          title="Connect Apple Health"
          message="Grant access to see your metrics"
          actionTitle="Grant Permission"
          action={handleRequestPermission}
        />
      </SafeAreaView>
    );
  }

  if (!loading && !metrics) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyDataView
          icon="refresh"
          iosIcon="arrow.clockwise"
          title="No Data Yet"
          message="Sync to see metrics"
          actionTitle="Sync Now"
          action={handleSync}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
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
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={24}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading health data...</Text>
          </View>
        ) : (
          <>
            {/* Readiness Card */}
            <View style={styles.readinessCard}>
              <Text style={styles.readinessTitle}>Today&apos;s Readiness</Text>
              
              <View style={styles.readinessMainRow}>
                {/* Circular Progress */}
                <View style={styles.circleContainer}>
                  <Svg width={120} height={120}>
                    {/* Background circle */}
                    <Circle
                      cx={60}
                      cy={60}
                      r={52}
                      stroke="#E5E7EB"
                      strokeWidth={16}
                      fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                      cx={60}
                      cy={60}
                      r={52}
                      stroke={readinessColor}
                      strokeWidth={16}
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - readinessScore / 100)}`}
                      strokeLinecap="round"
                      rotation="-90"
                      origin="60, 60"
                    />
                  </Svg>
                  <View style={styles.circleCenter}>
                    <Text style={[styles.readinessScoreText, { color: readinessColor }]}>
                      {Math.round(readinessScore)}
                    </Text>
                    <Text style={styles.readinessLevelText}>{readinessLevel}</Text>
                  </View>
                </View>

                {/* Component Breakdown */}
                <View style={styles.componentsBreakdown}>
                  <View style={styles.componentRow}>
                    <Text style={styles.componentLabel}>Recovery</Text>
                    <Text style={styles.componentValue}>{Math.round(recoveryScore)}</Text>
                  </View>
                  <View style={styles.componentRow}>
                    <Text style={styles.componentLabel}>Sleep</Text>
                    <Text style={styles.componentValue}>{Math.round(sleepScore)}</Text>
                  </View>
                  <View style={styles.componentRow}>
                    <Text style={styles.componentLabel}>Strain</Text>
                    <Text style={styles.componentValue}>{Math.round(strainScore)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsSection}>
              <View style={styles.metricsGrid}>
                {/* HRV Card */}
                <View style={styles.metricCard}>
                  <IconSymbol
                    ios_icon_name="waveform.path.ecg"
                    android_material_icon_name="show-chart"
                    size={28}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>HRV</Text>
                  <View style={styles.metricValueRow}>
                    <Text style={styles.metricValue}>
                      {metrics?.hrv !== undefined ? Math.round(metrics.hrv) : '-'}
                    </Text>
                    <Text style={styles.metricUnit}>ms</Text>
                  </View>
                </View>

                {/* Resting HR Card */}
                <View style={styles.metricCard}>
                  <IconSymbol
                    ios_icon_name="heart.fill"
                    android_material_icon_name="favorite"
                    size={28}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Resting HR</Text>
                  <View style={styles.metricValueRow}>
                    <Text style={styles.metricValue}>
                      {metrics?.restingHR !== undefined ? Math.round(metrics.restingHR) : '-'}
                    </Text>
                    <Text style={styles.metricUnit}>bpm</Text>
                  </View>
                </View>

                {/* Sleep Card */}
                <View style={styles.metricCard}>
                  <IconSymbol
                    ios_icon_name="moon.fill"
                    android_material_icon_name="bedtime"
                    size={28}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Sleep</Text>
                  <View style={styles.metricValueRow}>
                    <Text style={styles.metricValue}>
                      {metrics?.sleepDuration !== undefined 
                        ? metrics.sleepDuration.toFixed(1) 
                        : '-'}
                    </Text>
                    <Text style={styles.metricUnit}>hr</Text>
                  </View>
                </View>

                {/* BioAge Card */}
                <View style={styles.metricCard}>
                  <IconSymbol
                    ios_icon_name="figure.walk"
                    android_material_icon_name="directions-walk"
                    size={28}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>BioAge</Text>
                  <View style={styles.metricValueRow}>
                    <Text style={styles.metricValue}>
                      {metrics?.bioAgeSmoothed !== undefined 
                        ? metrics.bioAgeSmoothed.toFixed(1) 
                        : '-'}
                    </Text>
                    <Text style={styles.metricUnit}>yrs</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Insights Section */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Insights</Text>
              
              {readinessScore >= 80 && (
                <View style={styles.insightCard}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={24}
                    color="#34C759"
                  />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Excellent Readiness</Text>
                    <Text style={styles.insightText}>
                      Your body is well-recovered and ready for high-intensity training today.
                    </Text>
                  </View>
                </View>
              )}

              {readinessScore >= 50 && readinessScore < 80 && (
                <View style={styles.insightCard}>
                  <IconSymbol
                    ios_icon_name="info.circle.fill"
                    android_material_icon_name="info"
                    size={24}
                    color="#FFCC00"
                  />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Moderate Readiness</Text>
                    <Text style={styles.insightText}>
                      Consider moderate-intensity training. Listen to your body and avoid overtraining.
                    </Text>
                  </View>
                </View>
              )}

              {readinessScore < 50 && (
                <View style={styles.insightCard}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={24}
                    color="#FF9500"
                  />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Low Readiness</Text>
                    <Text style={styles.insightText}>
                      Focus on recovery today. Light activity or rest is recommended.
                    </Text>
                  </View>
                </View>
              )}

              {metrics?.sleepDuration !== undefined && metrics.sleepDuration < 7 && (
                <View style={styles.insightCard}>
                  <IconSymbol
                    ios_icon_name="moon.zzz.fill"
                    android_material_icon_name="bedtime"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.insightTextContainer}>
                    <Text style={styles.insightTitle}>Sleep Opportunity</Text>
                    <Text style={styles.insightText}>
                      You got {metrics.sleepDuration.toFixed(1)} hours of sleep. Aim for 7-9 hours for optimal recovery.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* BioAge Preview */}
            {metrics?.bioAgeSmoothed !== undefined && baselines && (
              <View style={styles.bioAgePreview}>
                <Text style={styles.sectionTitle}>Biological Age</Text>
                <View style={styles.bioAgeCard}>
                  <View style={styles.bioAgeRow}>
                    <View style={styles.bioAgeItem}>
                      <Text style={styles.bioAgeLabel}>Biological Age</Text>
                      <Text style={styles.bioAgeValue}>
                        {metrics.bioAgeSmoothed.toFixed(1)}
                      </Text>
                      <Text style={styles.bioAgeUnit}>years</Text>
                    </View>
                    
                    <View style={styles.bioAgeDivider} />
                    
                    <View style={styles.bioAgeItem}>
                      <Text style={styles.bioAgeLabel}>Longevity Score</Text>
                      <Text style={styles.bioAgeValue}>
                        {metrics.longevityScore !== undefined 
                          ? Math.round(metrics.longevityScore) 
                          : '-'}
                      </Text>
                      <Text style={styles.bioAgeUnit}>/100</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.bioAgeButton}>
                    <Text style={styles.bioAgeButtonText}>View Details</Text>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron-right"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  readinessCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  readinessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  readinessMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  circleCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readinessScoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  readinessLevelText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  componentsBreakdown: {
    flex: 1,
    marginLeft: 20,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  componentLabel: {
    fontSize: 15,
    color: colors.text,
  },
  componentValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    margin: '1%',
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  metricUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bioAgePreview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bioAgeCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 20,
  },
  bioAgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  bioAgeItem: {
    alignItems: 'center',
  },
  bioAgeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bioAgeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  bioAgeUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bioAgeDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  bioAgeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bioAgeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
});
