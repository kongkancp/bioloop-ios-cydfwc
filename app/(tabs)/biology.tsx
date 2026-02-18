
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo } from 'react';
import { useDailySync } from '@/hooks/useDailySync';
import { getPerformancePercentage, calculateAge } from '@/utils/baselines';
import {
  getAgeGapColor,
  getAgeGapEmoji,
  getAgeGapMessage,
} from '@/utils/bioAge';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import InsufficientDataBanner from '@/components/InsufficientDataBanner';

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
  bioAgeHero: {
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bioAgeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  bioAgeValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bioAgeValue: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  bioAgeUnit: {
    fontSize: 28,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  ageGapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ageGapEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  ageGapText: {
    fontSize: 20,
    fontWeight: '600',
  },
  ageGapMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  longevityCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  longevityGaugeContainer: {
    marginRight: 16,
  },
  longevityScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  longevityInfo: {
    flex: 1,
  },
  longevityTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  longevitySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
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
  chronologicalAgeText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
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

  // Calculate missing metrics
  const missingMetrics = useMemo(() => {
    const missing: string[] = [];
    
    if (!metrics?.hrv) {
      missing.push('HRV');
    }
    
    if (!metrics?.vo2max) {
      missing.push('VO2 Max');
    }
    
    return missing;
  }, [metrics]);

  // Calculate chronological age and age gap
  const chronologicalAge = baselines ? calculateAge(new Date(Date.now() - (365 * 24 * 60 * 60 * 1000 * 35))) : 35;
  const bioAge = metrics?.bioAgeSmoothed ?? metrics?.bioAge ?? chronologicalAge;
  const ageGap = bioAge - chronologicalAge;
  const longevityScore = metrics?.longevityScore ?? 85;

  // Prepare display values
  const bioAgeDisplay = bioAge.toFixed(1);
  const ageGapDisplay = Math.abs(ageGap).toFixed(1);
  const ageGapColor = getAgeGapColor(ageGap);
  const ageGapEmoji = getAgeGapEmoji(ageGap);
  const ageGapMessage = getAgeGapMessage(ageGap);
  
  // Determine age gap text
  let ageGapText = '';
  if (ageGap < 0) {
    ageGapText = `${ageGapDisplay} years younger`;
  } else if (ageGap > 0) {
    ageGapText = `${ageGapDisplay} years older`;
  } else {
    ageGapText = 'On target';
  }

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
          <Text style={styles.loadingText}>Loading biological data...</Text>
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
          <Text style={styles.subtitle}>Your biological age and health metrics</Text>
        </View>

        {/* Insufficient Data Banner */}
        {missingMetrics.length > 0 && (
          <InsufficientDataBanner missing={missingMetrics} />
        )}

        {/* BioAge Hero Card */}
        <LinearGradient
          colors={['rgba(147, 51, 234, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bioAgeHero}
        >
          <Text style={styles.bioAgeTitle}>Your Biological Age</Text>
          
          <View style={styles.bioAgeValueContainer}>
            <Text style={[styles.bioAgeValue, { color: ageGapColor }]}>
              {bioAgeDisplay}
            </Text>
            <Text style={styles.bioAgeUnit}>years</Text>
          </View>

          <View style={styles.ageGapContainer}>
            <Text style={styles.ageGapEmoji}>{ageGapEmoji}</Text>
            <Text style={[styles.ageGapText, { color: ageGapColor }]}>
              {ageGapText}
            </Text>
          </View>

          <Text style={styles.ageGapMessage}>{ageGapMessage}</Text>
          
          <Text style={styles.chronologicalAgeText}>
            Chronological age: {chronologicalAge} years
          </Text>
        </LinearGradient>

        {/* Longevity Score Card */}
        <View style={styles.longevityCard}>
          <View style={styles.longevityGaugeContainer}>
            <Svg width={72} height={72}>
              {/* Background circle */}
              <Circle
                cx={36}
                cy={36}
                r={30}
                stroke={colors.border}
                strokeWidth={12}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={36}
                cy={36}
                r={30}
                stroke="#9333EA"
                strokeWidth={12}
                fill="none"
                strokeDasharray={`${(longevityScore / 100) * 188.4} 188.4`}
                strokeLinecap="round"
                rotation="-90"
                origin="36, 36"
              />
            </Svg>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.longevityScore}>{Math.round(longevityScore)}</Text>
            </View>
          </View>

          <View style={styles.longevityInfo}>
            <Text style={styles.longevityTitle}>Longevity Score</Text>
            <Text style={styles.longevitySubtitle}>Age gap and trajectory</Text>
          </View>
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
