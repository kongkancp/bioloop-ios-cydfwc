
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

// Helper to resolve image sources
function resolveImageSource(source: string | number | any): any {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source;
}

interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Mock health metrics - in production, these would come from HealthKit via backend
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      label: 'Resting Heart Rate',
      value: '62',
      unit: 'bpm',
      icon: 'favorite',
      trend: 'stable',
      color: colors.error,
    },
    {
      label: 'HRV (SDNN)',
      value: '45',
      unit: 'ms',
      icon: 'show-chart',
      trend: 'up',
      color: colors.primary,
    },
    {
      label: 'VO2 Max',
      value: '42',
      unit: 'ml/kg/min',
      icon: 'directions-run',
      trend: 'up',
      color: colors.success,
    },
    {
      label: 'Sleep Duration',
      value: '7.5',
      unit: 'hours',
      icon: 'bedtime',
      trend: 'stable',
      color: colors.accent,
    },
  ]);

  const performanceIndex = 78;
  const biologicalAge = 28;
  const chronologicalAge = 32;

  const handleSync = async () => {
    console.log('User tapped Sync Health Data button');
    setLoading(true);
    
    // TODO: Backend Integration - POST /api/health/sync to trigger HealthKit data sync
    // This would request HealthKit permissions and fetch latest health data
    // Expected response: { success: boolean, lastSync: string (ISO 8601), metrics: HealthMetric[] }
    
    // Simulate sync delay
    setTimeout(() => {
      setLastSync(new Date());
      setLoading(false);
      console.log('Health data sync completed');
    }, 1500);
  };

  const lastSyncText = lastSync 
    ? `Last synced: ${lastSync.toLocaleTimeString()}`
    : 'Never synced';

  const performanceColor = performanceIndex >= 80 
    ? colors.success 
    : performanceIndex >= 60 
    ? colors.warning 
    : colors.error;

  const ageColor = biologicalAge < chronologicalAge 
    ? colors.success 
    : biologicalAge > chronologicalAge 
    ? colors.error 
    : colors.textSecondary;

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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>BioLoop</Text>
          <Text style={styles.subtitle}>Health Analytics Platform</Text>
        </View>

        {/* Performance Index Card */}
        <View style={[styles.card, styles.performanceCard]}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="analytics"
              size={32}
              color={performanceColor}
            />
            <Text style={styles.cardTitle}>Performance Index</Text>
          </View>
          <View style={styles.performanceContent}>
            <Text style={[styles.performanceValue, { color: performanceColor }]}>
              {performanceIndex}
            </Text>
            <Text style={styles.performanceLabel}>out of 100</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${performanceIndex}%`, backgroundColor: performanceColor }
              ]} 
            />
          </View>
        </View>

        {/* Biological Age Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol
              ios_icon_name="birthday.cake.fill"
              android_material_icon_name="cake"
              size={28}
              color={ageColor}
            />
            <Text style={styles.cardTitle}>Biological Age</Text>
          </View>
          <View style={styles.ageContent}>
            <View style={styles.ageItem}>
              <Text style={[styles.ageValue, { color: ageColor }]}>
                {biologicalAge}
              </Text>
              <Text style={styles.ageLabel}>Biological</Text>
            </View>
            <View style={styles.ageDivider} />
            <View style={styles.ageItem}>
              <Text style={styles.ageValue}>{chronologicalAge}</Text>
              <Text style={styles.ageLabel}>Chronological</Text>
            </View>
          </View>
          <View style={styles.ageDifferenceContainer}>
            <Text style={styles.ageDifference}>
              {biologicalAge < chronologicalAge ? '🎉 ' : ''}
              {Math.abs(chronologicalAge - biologicalAge)} years{' '}
              {biologicalAge < chronologicalAge ? 'younger' : 'older'}
            </Text>
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => {
            const trendIcon = metric.trend === 'up' 
              ? 'trending-up' 
              : metric.trend === 'down' 
              ? 'trending-down' 
              : 'trending-flat';
            
            const trendColor = metric.trend === 'up' 
              ? colors.success 
              : metric.trend === 'down' 
              ? colors.error 
              : colors.textSecondary;

            return (
              <View key={index} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <IconSymbol
                    ios_icon_name={metric.icon}
                    android_material_icon_name={metric.icon}
                    size={24}
                    color={metric.color}
                  />
                  {metric.trend && (
                    <IconSymbol
                      ios_icon_name={trendIcon}
                      android_material_icon_name={trendIcon}
                      size={16}
                      color={trendColor}
                    />
                  )}
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricUnit}>{metric.unit}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="sync"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.syncButtonText}>Sync Health Data</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.lastSyncText}>{lastSyncText}</Text>

        {/* Info Card */}
        <View style={[styles.card, styles.infoCard]}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            BioLoop analyzes your heart rate, HRV, sleep, and workout data to calculate your Performance Index and biological age. Your data never leaves your device.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  performanceCard: {
    backgroundColor: colors.highlight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  performanceContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceValue: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  performanceLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  ageContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
  },
  ageItem: {
    alignItems: 'center',
    flex: 1,
  },
  ageValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 56,
  },
  ageLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 4,
  },
  ageDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  ageDifferenceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  ageDifference: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 38,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  syncButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  syncButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.highlight,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 18,
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 20,
  },
});
