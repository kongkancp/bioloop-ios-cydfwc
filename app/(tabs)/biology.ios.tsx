
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useDailySync } from '@/hooks/useDailySync';
import { getPerformancePercentage } from '@/utils/baselines';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  metricUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  comparisonLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  comparisonValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  performanceGood: {
    color: '#34C759',
  },
  performanceAverage: {
    color: '#FF9500',
  },
  performancePoor: {
    color: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 17,
    color: colors.textSecondary,
  },
  noDataText: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  updatedText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

function BiologyScreen() {
  const { metrics, baselines, loading } = useDailySync(true);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) {
      return styles.performanceGood;
    }
    if (percentage >= 85) {
      return styles.performanceAverage;
    }
    return styles.performancePoor;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Biology',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading baselines...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Biology',
          headerShown: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Biology</Text>
          <Text style={styles.subtitle}>Age-adjusted health baselines</Text>
        </View>

        {baselines ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expected Values</Text>
              
              <View style={styles.card}>
                <View style={styles.metricRow}>
                  <IconSymbol
                    ios_icon_name="heart.fill"
                    android_material_icon_name="favorite"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Max Heart Rate</Text>
                  <Text style={styles.metricValue}>{baselines.hrMax}</Text>
                  <Text style={styles.metricUnit}>bpm</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricRow}>
                  <IconSymbol
                    ios_icon_name="waveform.path.ecg"
                    android_material_icon_name="show-chart"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Expected HRV</Text>
                  <Text style={styles.metricValue}>{baselines.expectedHRV}</Text>
                  <Text style={styles.metricUnit}>ms</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricRow}>
                  <IconSymbol
                    ios_icon_name="heart.text.square"
                    android_material_icon_name="favorite-border"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Expected Resting HR</Text>
                  <Text style={styles.metricValue}>{baselines.expectedRHR}</Text>
                  <Text style={styles.metricUnit}>bpm</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricRow}>
                  <IconSymbol
                    ios_icon_name="lungs.fill"
                    android_material_icon_name="air"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.metricLabel}>Expected VO2 Max</Text>
                  <Text style={styles.metricValue}>{baselines.expectedVO2max}</Text>
                  <Text style={styles.metricUnit}>mL/kg/min</Text>
                </View>

                <Text style={styles.updatedText}>
                  Updated: {formatDate(baselines.updatedAt)}
                </Text>
              </View>
            </View>

            {metrics && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Performance</Text>
                
                {metrics.hrv !== undefined && (
                  <View style={styles.card}>
                    <Text style={styles.metricLabel}>Heart Rate Variability</Text>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Your HRV:</Text>
                      <Text style={styles.metricValue}>{metrics.hrv} ms</Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Expected:</Text>
                      <Text style={styles.comparisonValue}>
                        {baselines.expectedHRV} ms
                      </Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Performance:</Text>
                      <Text
                        style={[
                          styles.comparisonValue,
                          getPerformanceColor(
                            getPerformancePercentage(metrics.hrv, baselines.expectedHRV, true)
                          ),
                        ]}
                      >
                        {getPerformancePercentage(metrics.hrv, baselines.expectedHRV, true)}%
                      </Text>
                    </View>
                  </View>
                )}

                {metrics.restingHR !== undefined && (
                  <View style={styles.card}>
                    <Text style={styles.metricLabel}>Resting Heart Rate</Text>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Your RHR:</Text>
                      <Text style={styles.metricValue}>{metrics.restingHR} bpm</Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Expected:</Text>
                      <Text style={styles.comparisonValue}>
                        {baselines.expectedRHR} bpm
                      </Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Performance:</Text>
                      <Text
                        style={[
                          styles.comparisonValue,
                          getPerformanceColor(
                            getPerformancePercentage(metrics.restingHR, baselines.expectedRHR, false)
                          ),
                        ]}
                      >
                        {getPerformancePercentage(metrics.restingHR, baselines.expectedRHR, false)}%
                      </Text>
                    </View>
                  </View>
                )}

                {metrics.vo2max !== undefined && (
                  <View style={styles.card}>
                    <Text style={styles.metricLabel}>VO2 Max</Text>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Your VO2 Max:</Text>
                      <Text style={styles.metricValue}>{metrics.vo2max} mL/kg/min</Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Expected:</Text>
                      <Text style={styles.comparisonValue}>
                        {baselines.expectedVO2max} mL/kg/min
                      </Text>
                    </View>
                    <View style={styles.comparisonRow}>
                      <Text style={styles.comparisonLabel}>Performance:</Text>
                      <Text
                        style={[
                          styles.comparisonValue,
                          getPerformanceColor(
                            getPerformancePercentage(metrics.vo2max, baselines.expectedVO2max, true)
                          ),
                        ]}
                      >
                        {getPerformancePercentage(metrics.vo2max, baselines.expectedVO2max, true)}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>
              No baselines calculated yet. Please set your date of birth in Profile to calculate age-adjusted baselines.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default BiologyScreen;
