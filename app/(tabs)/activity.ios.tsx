
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailySync } from '@/hooks/useDailySync';
import { getLoadInterpretation, getLoadColor } from '@/utils/loadScore';
import { getACWRInterpretation, getACWRColor } from '@/utils/acwr';
import { 
  getRecoveryEfficiencyInterpretation, 
  getRecoveryEfficiencyColor,
  getRecoveryEfficiencyMessage 
} from '@/utils/recoveryEfficiency';

export default function ActivityScreen() {
  const { metrics, baselines, loading } = useDailySync();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  const loadScore = metrics?.loadScore || 0;
  const loadInterpretation = getLoadInterpretation(loadScore);
  const loadColorValue = getLoadColor(loadScore);
  const workoutCount = metrics?.workouts?.length || 0;

  const acwr = metrics?.acwr;
  const acwrScore = metrics?.acwrScore;
  const hasACWR = acwr !== undefined && acwrScore !== undefined;
  
  const acwrInterpretation = hasACWR ? getACWRInterpretation(acwr!, acwrScore!) : null;
  const acwrColorValue = hasACWR ? getACWRColor(acwrScore!) : colors.textSecondary;

  const recoveryEfficiency = metrics?.recoveryEfficiency;
  const hasRecoveryEfficiency = recoveryEfficiency !== undefined;
  const recoveryInterpretation = hasRecoveryEfficiency ? getRecoveryEfficiencyInterpretation(recoveryEfficiency!) : '';
  const recoveryColorValue = hasRecoveryEfficiency ? getRecoveryEfficiencyColor(recoveryEfficiency!) : colors.textSecondary;
  const recoveryMessage = hasRecoveryEfficiency ? getRecoveryEfficiencyMessage(recoveryEfficiency!) : '';

  const loadScoreDisplay = loadScore.toFixed(0);
  const acwrDisplay = hasACWR ? acwr!.toFixed(2) : '--';
  const acwrScoreDisplay = hasACWR ? acwrScore!.toFixed(0) : '--';
  const recoveryDisplay = hasRecoveryEfficiency ? recoveryEfficiency!.toFixed(0) : '--';
  const hasWorkouts = workoutCount > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Activity',
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Activity</Text>
            <Text style={styles.headerSubtitle}>Training load and recovery</Text>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'day' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('day')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.periodButtonTextActive]}>
                Day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* Recovery Efficiency Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <IconSymbol
                    ios_icon_name="heart.fill"
                    android_material_icon_name="favorite"
                    size={24}
                    color={recoveryColorValue}
                  />
                  <Text style={styles.cardTitle}>Recovery Efficiency</Text>
                </View>

                {hasRecoveryEfficiency ? (
                  <>
                    <View style={styles.recoveryContainer}>
                      <View style={styles.recoveryCircle}>
                        <Text style={[styles.recoveryValue, { color: recoveryColorValue }]}>
                          {recoveryDisplay}
                        </Text>
                        <Text style={styles.recoveryMax}>/100</Text>
                      </View>

                      <View style={styles.recoveryInfo}>
                        <View style={[styles.recoveryBadge, { backgroundColor: recoveryColorValue + '20' }]}>
                          <Text style={[styles.recoveryBadgeText, { color: recoveryColorValue }]}>
                            {recoveryInterpretation}
                          </Text>
                        </View>
                        <Text style={styles.recoveryDescription}>
                          {recoveryMessage}
                        </Text>
                      </View>
                    </View>

                    {/* Recovery Explanation */}
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>
                        Recovery Efficiency combines Heart Rate Recovery (70%) and HRV Rebound (30%) to measure cardiovascular recovery.
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.insufficientDataContainer}>
                    <IconSymbol
                      ios_icon_name="heart"
                      android_material_icon_name="favorite-border"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.insufficientDataTitle}>Building Recovery Profile</Text>
                    <Text style={styles.insufficientDataText}>
                      Recovery Efficiency requires workout data with post-exercise heart rate and HRV history. Keep syncing to unlock this metric.
                    </Text>
                  </View>
                )}
              </View>

              {/* ACWR Card */}
              {hasACWR && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <IconSymbol
                      ios_icon_name="chart.line.uptrend.xyaxis"
                      android_material_icon_name="trending-up"
                      size={24}
                      color={acwrColorValue}
                    />
                    <Text style={styles.cardTitle}>Training Balance</Text>
                  </View>

                  <View style={styles.acwrContainer}>
                    <View style={styles.acwrMainMetric}>
                      <Text style={styles.acwrLabel}>ACWR Ratio</Text>
                      <Text style={[styles.acwrValue, { color: acwrColorValue }]}>
                        {acwrDisplay}
                      </Text>
                      <Text style={styles.acwrOptimal}>Optimal: 0.8-1.3</Text>
                    </View>

                    <View style={styles.acwrScoreContainer}>
                      <View style={[styles.acwrScoreBadge, { backgroundColor: acwrColorValue + '20' }]}>
                        <Text style={[styles.acwrScoreBadgeText, { color: acwrColorValue }]}>
                          {acwrInterpretation!.risk}
                        </Text>
                      </View>
                      <Text style={styles.acwrMessage}>{acwrInterpretation!.message}</Text>
                      <View style={styles.acwrScoreRow}>
                        <Text style={styles.acwrScoreLabel}>Score:</Text>
                        <Text style={[styles.acwrScoreValue, { color: acwrColorValue }]}>
                          {acwrScoreDisplay}
                        </Text>
                        <Text style={styles.acwrScoreMax}>/100</Text>
                      </View>
                    </View>
                  </View>

                  {/* ACWR Explanation */}
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationText}>
                      ACWR compares your 7-day training load to your 28-day average. Values between 0.8-1.3 indicate optimal training progression.
                    </Text>
                  </View>
                </View>
              )}

              {/* Insufficient Data Message */}
              {!hasACWR && (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <IconSymbol
                      ios_icon_name="chart.line.uptrend.xyaxis"
                      android_material_icon_name="trending-up"
                      size={24}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.cardTitle}>Training Balance</Text>
                  </View>
                  <View style={styles.insufficientDataContainer}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.insufficientDataTitle}>Building Your Profile</Text>
                    <Text style={styles.insufficientDataText}>
                      ACWR requires 21+ days of training data. Keep syncing your workouts to unlock this metric.
                    </Text>
                  </View>
                </View>
              )}

              {/* Load Score Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <IconSymbol
                    ios_icon_name="bolt.fill"
                    android_material_icon_name="flash-on"
                    size={24}
                    color={loadColorValue}
                  />
                  <Text style={styles.cardTitle}>Load Score</Text>
                </View>

                <View style={styles.loadScoreContainer}>
                  <View style={styles.loadScoreCircle}>
                    <Text style={[styles.loadScoreValue, { color: loadColorValue }]}>
                      {loadScoreDisplay}
                    </Text>
                    <Text style={styles.loadScoreMax}>/100</Text>
                  </View>

                  <View style={styles.loadScoreInfo}>
                    <View style={[styles.loadScoreBadge, { backgroundColor: loadColorValue + '20' }]}>
                      <Text style={[styles.loadScoreBadgeText, { color: loadColorValue }]}>
                        {loadInterpretation}
                      </Text>
                    </View>
                    <Text style={styles.loadScoreDescription}>
                      {hasWorkouts
                        ? `Based on ${workoutCount} workout${workoutCount > 1 ? 's' : ''} today`
                        : 'No workouts recorded today'}
                    </Text>
                  </View>
                </View>

                {/* Load Score Explanation */}
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>
                    Load Score measures training stress using heart rate intensity and duration.
                  </Text>
                </View>
              </View>

              {/* Workouts List */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <IconSymbol
                    ios_icon_name="figure.run"
                    android_material_icon_name="directions-run"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>Today&apos;s Workouts</Text>
                </View>

                {hasWorkouts ? (
                  <View style={styles.workoutsList}>
                    {metrics?.workouts.map((workout, index) => {
                      const durationDisplay = `${workout.duration} min`;
                      const avgHRDisplay = `${workout.averageHR} bpm`;
                      const peakHRDisplay = `${workout.peakHR} bpm`;
                      const hasRecoveryData = workout.hrAfter60s !== undefined;
                      const hrAfter60sDisplay = hasRecoveryData ? `${workout.hrAfter60s} bpm` : 'N/A';

                      return (
                        <View key={index} style={styles.workoutItem}>
                          <View style={styles.workoutHeader}>
                            <Text style={styles.workoutType}>{workout.type}</Text>
                            <Text style={styles.workoutDuration}>{durationDisplay}</Text>
                          </View>
                          <View style={styles.workoutStats}>
                            <View style={styles.workoutStat}>
                              <Text style={styles.workoutStatLabel}>Avg HR</Text>
                              <Text style={styles.workoutStatValue}>{avgHRDisplay}</Text>
                            </View>
                            <View style={styles.workoutStat}>
                              <Text style={styles.workoutStatLabel}>Peak HR</Text>
                              <Text style={styles.workoutStatValue}>{peakHRDisplay}</Text>
                            </View>
                            <View style={styles.workoutStat}>
                              <Text style={styles.workoutStatLabel}>HR @ 60s</Text>
                              <Text style={styles.workoutStatValue}>{hrAfter60sDisplay}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <IconSymbol
                      ios_icon_name="figure.walk"
                      android_material_icon_name="directions-walk"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.emptyStateText}>No workouts today</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Your workouts will appear here after syncing with HealthKit
                    </Text>
                  </View>
                )}
              </View>

              {/* Recovery Efficiency Guide */}
              {hasRecoveryEfficiency && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Recovery Efficiency Guide</Text>
                  <View style={styles.legendList}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                      <Text style={styles.legendText}>80-100: Excellent recovery</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FFCC00' }]} />
                      <Text style={styles.legendText}>60-79: Good recovery</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
                      <Text style={styles.legendText}>40-59: Moderate recovery</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                      <Text style={styles.legendText}>0-39: Poor recovery</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ACWR Guide */}
              {hasACWR && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>ACWR Guide</Text>
                  <View style={styles.legendList}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                      <Text style={styles.legendText}>0.8-1.3: Optimal training balance</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FFCC00' }]} />
                      <Text style={styles.legendText}>&lt;0.8 or &gt;1.3: Caution zone</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                      <Text style={styles.legendText}>&gt;1.5: High injury risk</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Load Score Legend */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Load Score Guide</Text>
                <View style={styles.legendList}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.legendText}>0-30: Light day</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFCC00' }]} />
                    <Text style={styles.legendText}>31-60: Moderate training</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
                    <Text style={styles.legendText}>61-85: Hard session</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                    <Text style={styles.legendText}>86-100: Maximum effort</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  recoveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  recoveryCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.primary + '20',
  },
  recoveryValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  recoveryMax: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: -8,
  },
  recoveryInfo: {
    flex: 1,
    gap: 8,
  },
  recoveryBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recoveryBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  recoveryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  acwrContainer: {
    gap: 16,
    marginBottom: 16,
  },
  acwrMainMetric: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  acwrLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  acwrValue: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  acwrOptimal: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  acwrScoreContainer: {
    gap: 8,
  },
  acwrScoreBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  acwrScoreBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  acwrMessage: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  acwrScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  acwrScoreLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  acwrScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  acwrScoreMax: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  insufficientDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  insufficientDataTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  insufficientDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  loadScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  loadScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.primary + '20',
  },
  loadScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  loadScoreMax: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: -8,
  },
  loadScoreInfo: {
    flex: 1,
    gap: 8,
  },
  loadScoreBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  loadScoreBadgeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadScoreDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  explanationBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  workoutsList: {
    gap: 12,
  },
  workoutItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutType: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  workoutDuration: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutStat: {
    flex: 1,
  },
  workoutStatLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  workoutStatValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  legendList: {
    marginTop: 12,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 15,
    color: colors.text,
  },
});
