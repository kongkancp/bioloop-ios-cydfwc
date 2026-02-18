
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
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
import { Stack } from 'expo-router';
import { HealthMetric } from '@/types/health';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailySync } from '@/hooks/useDailySync';
import { getPerformanceLevel, getPerformanceMessage } from '@/utils/performanceIndex';

export default function HomeScreen() {
  const { metrics, baselines, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);

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

  const getHealthMetrics = (): HealthMetric[] => {
    if (!metrics) return [];

    const metricsArray: HealthMetric[] = [];

    if (metrics.restingHR !== undefined) {
      metricsArray.push({
        label: 'Resting HR',
        value: Math.round(metrics.restingHR).toString(),
        unit: 'BPM',
        icon: 'favorite',
        iosIcon: 'heart.fill',
        color: colors.primary,
      });
    }

    if (metrics.hrv !== undefined) {
      metricsArray.push({
        label: 'HRV',
        value: Math.round(metrics.hrv).toString(),
        unit: 'ms',
        icon: 'show-chart',
        iosIcon: 'waveform.path.ecg',
        color: colors.primary,
      });
    }

    if (metrics.vo2max !== undefined) {
      metricsArray.push({
        label: 'VO2 Max',
        value: metrics.vo2max.toFixed(1),
        unit: 'ml/kg/min',
        icon: 'air',
        iosIcon: 'wind',
        color: colors.primary,
      });
    }

    if (metrics.sleepDuration !== undefined) {
      const hours = Math.floor(metrics.sleepDuration);
      const minutes = Math.round((metrics.sleepDuration - hours) * 60);
      metricsArray.push({
        label: 'Sleep',
        value: `${hours}h ${minutes}m`,
        unit: '',
        icon: 'bedtime',
        iosIcon: 'bed.double.fill',
        color: colors.primary,
      });
    }

    return metricsArray;
  };

  // Calculate Performance Index display values
  const performanceIndex = metrics?.performanceIndex;
  const performanceIndexRaw = metrics?.performanceIndexRaw;
  const performanceLevel = performanceIndex !== undefined 
    ? getPerformanceLevel(performanceIndex) 
    : null;
  const performanceMessage = performanceIndex !== undefined 
    ? getPerformanceMessage(performanceIndex) 
    : null;

  const healthMetrics = getHealthMetrics();

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
          <Text style={styles.headerTitle}>BioLoop</Text>
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
            {/* Performance Index Card */}
            {performanceIndex !== undefined && performanceLevel && (
              <View style={styles.performanceCard}>
                <Text style={styles.performanceLabel}>Performance Index</Text>
                
                <View style={styles.performanceMainRow}>
                  <View style={styles.performanceScoreContainer}>
                    <Text style={[styles.performanceScore, { color: performanceLevel.color }]}>
                      {Math.round(performanceIndex)}
                    </Text>
                    <Text style={styles.performanceUnit}>/100</Text>
                  </View>
                  
                  <View style={styles.performanceLevelContainer}>
                    <View style={[styles.levelBadge, { backgroundColor: performanceLevel.color }]}>
                      <Text style={styles.levelBadgeText}>{performanceLevel.level}</Text>
                    </View>
                  </View>
                </View>

                {performanceMessage && (
                  <Text style={styles.performanceMessage}>{performanceMessage}</Text>
                )}

                {/* Component Breakdown */}
                <View style={styles.componentsContainer}>
                  <Text style={styles.componentsTitle}>Components</Text>
                  
                  <View style={styles.componentRow}>
                    <View style={styles.componentItem}>
                      <Text style={styles.componentLabel}>Load</Text>
                      <Text style={styles.componentValue}>
                        {metrics.loadScore !== undefined ? Math.round(metrics.loadScore) : '-'}
                      </Text>
                      <Text style={styles.componentWeight}>40%</Text>
                    </View>
                    
                    <View style={styles.componentItem}>
                      <Text style={styles.componentLabel}>ACWR</Text>
                      <Text style={styles.componentValue}>
                        {metrics.acwrScore !== undefined ? Math.round(metrics.acwrScore) : '-'}
                      </Text>
                      <Text style={styles.componentWeight}>30%</Text>
                    </View>
                    
                    <View style={styles.componentItem}>
                      <Text style={styles.componentLabel}>Recovery</Text>
                      <Text style={styles.componentValue}>
                        {metrics.recoveryEfficiency !== undefined ? Math.round(metrics.recoveryEfficiency) : '-'}
                      </Text>
                      <Text style={styles.componentWeight}>30%</Text>
                    </View>
                  </View>
                </View>

                {/* Raw vs Smoothed */}
                {performanceIndexRaw !== undefined && (
                  <View style={styles.smoothingInfo}>
                    <Text style={styles.smoothingLabel}>
                      Raw: {Math.round(performanceIndexRaw)} • Smoothed (7-day EMA): {Math.round(performanceIndex)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Health Metrics Grid */}
            {healthMetrics.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.sectionTitle}>Today's Metrics</Text>
                <View style={styles.metricsGrid}>
                  {healthMetrics.map((metric, index) => (
                    <View key={index} style={styles.metricCard}>
                      <IconSymbol
                        ios_icon_name={metric.iosIcon}
                        android_material_icon_name={metric.icon}
                        size={32}
                        color={metric.color}
                      />
                      <Text style={styles.metricLabel}>{metric.label}</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                        {metric.unit && (
                          <Text style={styles.metricUnit}>{metric.unit}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Workouts */}
            {metrics && metrics.workouts.length > 0 && (
              <View style={styles.workoutsSection}>
                <Text style={styles.sectionTitle}>Today's Workouts</Text>
                {metrics.workouts.map((workout, index) => {
                  const startTime = new Date(workout.startTime);
                  const timeString = startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <View key={index} style={styles.workoutCard}>
                      <View style={styles.workoutHeader}>
                        <Text style={styles.workoutType}>{workout.type}</Text>
                        <Text style={styles.workoutTime}>{timeString}</Text>
                      </View>
                      <View style={styles.workoutStats}>
                        <View style={styles.workoutStat}>
                          <Text style={styles.workoutStatLabel}>Duration</Text>
                          <Text style={styles.workoutStatValue}>
                            {Math.round(workout.duration)} min
                          </Text>
                        </View>
                        <View style={styles.workoutStat}>
                          <Text style={styles.workoutStatLabel}>Avg HR</Text>
                          <Text style={styles.workoutStatValue}>
                            {Math.round(workout.averageHR)} BPM
                          </Text>
                        </View>
                        <View style={styles.workoutStat}>
                          <Text style={styles.workoutStatLabel}>Peak HR</Text>
                          <Text style={styles.workoutStatValue}>
                            {Math.round(workout.peakHR)} BPM
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* No Data State */}
            {!metrics && (
              <View style={styles.noDataContainer}>
                <IconSymbol
                  ios_icon_name="heart.text.square"
                  android_material_icon_name="favorite-border"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.noDataTitle}>No Data Available</Text>
                <Text style={styles.noDataText}>
                  Pull down to sync your health data from HealthKit
                </Text>
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
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
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
  performanceCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  performanceMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  performanceScore: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  performanceUnit: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  performanceLevelContainer: {
    alignItems: 'flex-end',
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  performanceMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 20,
  },
  componentsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  componentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  componentItem: {
    flex: 1,
    alignItems: 'center',
  },
  componentLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  componentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  componentWeight: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  smoothingInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  smoothingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  workoutsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  workoutCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  workoutTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    flex: 1,
  },
  workoutStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  workoutStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
