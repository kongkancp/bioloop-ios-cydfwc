
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import { HealthMetric } from '@/types/health';
import { useDailySync } from '@/hooks/useDailySync';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },
  performanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  performanceLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  performanceSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: '1%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  metricUnit: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  syncButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  syncButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncStatusText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default function HomeScreen() {
  const { metrics, loading, syncing, lastSyncDate, syncNow } = useDailySync(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    console.log('HomeScreen: User tapped sync button');
    const result = await syncNow(true);
    console.log('HomeScreen: Sync result:', result.message);
  };

  const handleRefresh = async () => {
    console.log('HomeScreen: User pulled to refresh');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const getHealthMetrics = (): HealthMetric[] => {
    if (!metrics) return [];

    const restingHRValue = metrics.restingHR?.toFixed(0) || '--';
    const hrvValue = metrics.hrv?.toFixed(0) || '--';
    const vo2maxValue = metrics.vo2max?.toFixed(1) || '--';
    const sleepValue = metrics.sleepDuration?.toFixed(1) || '--';

    return [
      {
        label: 'Resting HR',
        value: restingHRValue,
        unit: 'bpm',
        icon: 'favorite',
        iosIcon: 'heart.fill',
        color: colors.error,
      },
      {
        label: 'HRV',
        value: hrvValue,
        unit: 'ms',
        icon: 'show-chart',
        iosIcon: 'waveform.path.ecg',
        color: colors.primary,
      },
      {
        label: 'VO2 Max',
        value: vo2maxValue,
        unit: 'ml/kg/min',
        icon: 'air',
        iosIcon: 'wind',
        color: colors.success,
      },
      {
        label: 'Sleep',
        value: sleepValue,
        unit: 'hours',
        icon: 'bedtime',
        iosIcon: 'moon.fill',
        color: colors.accent,
      },
    ];
  };

  const performanceIndex = 85;
  const performanceChange = '+3';

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.syncStatusText, { marginTop: 16 }]}>
            Syncing HealthKit data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const healthMetrics = getHealthMetrics();
  const greetingText = 'Good morning';
  
  const lastSyncText = lastSyncDate
    ? `Last synced: ${lastSyncDate.toLocaleTimeString()}`
    : 'Never synced';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            title="Syncing HealthKit data..."
            titleColor={colors.textSecondary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{greetingText}</Text>
          <Text style={styles.title}>BioLoop</Text>
        </View>

        <View style={styles.performanceCard}>
          <Text style={styles.performanceLabel}>Performance Index</Text>
          <Text style={styles.performanceValue}>{performanceIndex}</Text>
          <Text style={styles.performanceSubtext}>{performanceChange} from yesterday</Text>
        </View>

        <Text style={styles.syncStatusText}>{lastSyncText}</Text>

        <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
          {syncing ? (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.syncButtonText}>Syncing HealthKit data...</Text>
            </>
          ) : (
            <>
              <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={20} color={colors.primary} />
              <Text style={styles.syncButtonText}>Sync HealthKit Data</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <IconSymbol ios_icon_name={metric.iosIcon} android_material_icon_name={metric.icon} size={20} color={metric.color} />
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
