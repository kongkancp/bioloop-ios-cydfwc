
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
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailySync } from '@/hooks/useDailySync';
import { getLoadInterpretation, getLoadColor } from '@/utils/loadScore';
import { getACWRInterpretation, getACWRColor } from '@/utils/acwr';
import { 
  getRecoveryEfficiencyInterpretation, 
  getRecoveryEfficiencyColor,
  getRecoveryEfficiencyMessage 
} from '@/utils/recoveryEfficiency';
import { getPerformanceLevel, getPerformanceMessage } from '@/utils/performanceIndex';

export default function ActivityScreen() {
  const { metrics, baselines, loading } = useDailySync();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');

  const performanceIndex = metrics?.performanceIndex || 0;
  const performanceLevel = getPerformanceLevel(performanceIndex);
  const performanceMessage = getPerformanceMessage(performanceIndex);
  const performanceLevelText = performanceLevel.level;
  const performanceLevelColor = performanceLevel.color;

  const loadScore = metrics?.loadScore || 0;
  const loadInterpretation = getLoadInterpretation(loadScore);
  const loadColorValue = getLoadColor(loadScore);

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

  const performanceIndexDisplay = Math.round(performanceIndex).toString();
  const loadScoreDisplay = Math.round(loadScore).toString();
  const acwrDisplay = hasACWR ? acwr!.toFixed(2) : '--';
  const acwrScoreDisplay = hasACWR ? Math.round(acwrScore!).toString() : '--';
  const recoveryDisplay = hasRecoveryEfficiency ? Math.round(recoveryEfficiency!).toString() : '--';

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference - (performanceIndex / 100) * circumference;

  const acwrPosition = hasACWR ? getACWRPosition(acwr!) : 0;

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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Performance Lab</Text>
            <Text style={styles.headerSubtitle}>Training metrics and analysis</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>Performance Index</Text>
                
                <View style={styles.gaugeContainer}>
                  <Svg width={240} height={240}>
                    <Defs>
                      <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#007AFF" />
                        <Stop offset="100%" stopColor="#34C759" />
                      </LinearGradient>
                    </Defs>
                    <Circle
                      cx={120}
                      cy={120}
                      r={110}
                      stroke={colors.cardBackground}
                      strokeWidth={20}
                      fill="none"
                    />
                    <Circle
                      cx={120}
                      cy={120}
                      r={110}
                      stroke="url(#gradient)"
                      strokeWidth={20}
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      rotation="-90"
                      origin="120, 120"
                    />
                  </Svg>
                  
                  <View style={styles.gaugeCenter}>
                    <Text style={styles.gaugeValue}>{performanceIndexDisplay}</Text>
                    <Text style={styles.gaugeMax}>/ 100</Text>
                  </View>
                </View>

                <Text style={[styles.performanceLevel, { color: performanceLevelColor }]}>
                  {performanceLevelText}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.componentHeader}>
                  <Text style={styles.componentName}>Load Score</Text>
                  <Text style={[styles.componentScore, { color: loadColorValue }]}>
                    {loadScoreDisplay}
                  </Text>
                  <Text style={styles.componentMax}> / 100</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground} />
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${loadScore}%`,
                        backgroundColor: loadColorValue 
                      }
                    ]} 
                  />
                </View>

                <Text style={styles.componentDescription}>
                  Measures training stress using heart rate intensity and duration
                </Text>
              </View>

              {hasACWR && (
                <View style={styles.card}>
                  <View style={styles.componentHeader}>
                    <Text style={styles.componentName}>ACWR Score</Text>
                    <Text style={[styles.componentScore, { color: acwrColorValue }]}>
                      {acwrScoreDisplay}
                    </Text>
                    <Text style={styles.componentMax}> / 100</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground} />
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${acwrScore}%`,
                          backgroundColor: acwrColorValue 
                        }
                      ]} 
                    />
                  </View>

                  <Text style={styles.componentDescription}>
                    Training load balance - compares 7-day to 28-day average
                  </Text>
                </View>
              )}

              {hasRecoveryEfficiency && (
                <View style={styles.card}>
                  <View style={styles.componentHeader}>
                    <Text style={styles.componentName}>Recovery Efficiency</Text>
                    <Text style={[styles.componentScore, { color: recoveryColorValue }]}>
                      {recoveryDisplay}
                    </Text>
                    <Text style={styles.componentMax}> / 100</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground} />
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${recoveryEfficiency}%`,
                          backgroundColor: recoveryColorValue 
                        }
                      ]} 
                    />
                  </View>

                  <Text style={styles.componentDescription}>
                    Cardiovascular recovery combining HRR (70%) and HRV rebound (30%)
                  </Text>
                </View>
              )}

              {hasACWR && (
                <View style={styles.card}>
                  <Text style={styles.acwrTitle}>Injury Risk</Text>
                  
                  <View style={styles.acwrValueContainer}>
                    <Text style={[styles.acwrValue, { color: acwrColorValue }]}>
                      {acwrDisplay}
                    </Text>
                    <Text style={styles.acwrRatioLabel}>ratio</Text>
                  </View>

                  <Text style={[styles.acwrRiskLevel, { color: acwrColorValue }]}>
                    {acwrInterpretation!.risk}
                  </Text>

                  <View style={styles.acwrGaugeContainer}>
                    <View style={styles.acwrGaugeBackground} />
                    <View style={styles.acwrGaugeOptimal} />
                    <View 
                      style={[
                        styles.acwrGaugeIndicator, 
                        { 
                          left: `${acwrPosition}%`,
                          backgroundColor: acwrColorValue 
                        }
                      ]} 
                    />
                  </View>

                  <View style={styles.acwrLabels}>
                    <Text style={styles.acwrLabelText}>0.0</Text>
                    <Text style={styles.acwrLabelText}>1.0</Text>
                    <Text style={styles.acwrLabelText}>2.0</Text>
                  </View>
                </View>
              )}

              {!hasACWR && (
                <View style={styles.card}>
                  <View style={styles.insufficientDataContainer}>
                    <IconSymbol
                      ios_icon_name="calendar"
                      android_material_icon_name="calendar-today"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.insufficientDataTitle}>Building Your Profile</Text>
                    <Text style={styles.insufficientDataText}>
                      ACWR and Injury Risk require 21+ days of training data. Keep syncing your workouts to unlock these metrics.
                    </Text>
                  </View>
                </View>
              )}

              {!hasRecoveryEfficiency && (
                <View style={styles.card}>
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
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function getACWRPosition(acwr: number): number {
  const normalized = Math.min(Math.max(acwr, 0), 2) / 2.0;
  return normalized * 100;
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  heroCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  gaugeContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
  },
  gaugeMax: {
    fontSize: 20,
    color: colors.textSecondary,
    marginTop: -8,
  },
  performanceLevel: {
    fontSize: 20,
    fontWeight: '600',
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
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  componentScore: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  componentMax: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    marginBottom: 12,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    width: '100%',
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  progressBarFill: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
  },
  componentDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  acwrTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  acwrValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  acwrValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  acwrRatioLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  acwrRiskLevel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  acwrGaugeContainer: {
    height: 8,
    position: 'relative',
    marginBottom: 8,
  },
  acwrGaugeBackground: {
    position: 'absolute',
    width: '100%',
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  acwrGaugeOptimal: {
    position: 'absolute',
    width: '25%',
    height: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.3)',
    borderRadius: 4,
    left: '40%',
  },
  acwrGaugeIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
  },
  acwrLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acwrLabelText: {
    fontSize: 12,
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
});
