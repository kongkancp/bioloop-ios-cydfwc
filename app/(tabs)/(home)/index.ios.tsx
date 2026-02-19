
import { useDailySync } from '@/hooks/useDailySync';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import EmptyDataView from '@/components/EmptyDataView';
import HealthKitManager from '@/services/HealthKitManager';
import Svg, { Circle } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
import BioLoopDebugger from '@/utils/debugHelper';

export default function HomeScreen() {
  const { metrics, loading, syncing, syncNow } = useDailySync();
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    BioLoopDebugger.log('HomeScreen', 'User tapped Sync button');
    await syncNow(true);
  };

  const handleRefresh = async () => {
    BioLoopDebugger.log('HomeScreen', 'User pulled to refresh');
    setRefreshing(true);
    await syncNow(true);
    setRefreshing(false);
  };

  const handleRequestPermission = async () => {
    BioLoopDebugger.log('HomeScreen', 'User tapped Request Permission button');
    try {
      const granted = await HealthKitManager.requestAuthorization();
      if (granted) {
        BioLoopDebugger.success('HomeScreen', 'HealthKit permission granted');
        await syncNow(true);
      } else {
        BioLoopDebugger.warn('HomeScreen', 'HealthKit permission denied');
      }
    } catch (error) {
      BioLoopDebugger.error('HomeScreen', 'Failed to request HealthKit permission', error);
    }
  };

  const handleDebugInfo = () => {
    BioLoopDebugger.log('HomeScreen', 'User tapped Debug Info button');
    BioLoopDebugger.printStatus();
  };

  const calculateReadinessScore = (): number => {
    if (!metrics) return 0;
    
    let score = 50;
    
    if (metrics.performanceIndex !== undefined) {
      score += (metrics.performanceIndex - 50) * 0.5;
    }
    
    if (metrics.recoveryEfficiency !== undefined) {
      score += (metrics.recoveryEfficiency - 50) * 0.3;
    }
    
    if (metrics.acwr !== undefined) {
      const acwrScore = metrics.acwr >= 0.8 && metrics.acwr <= 1.3 ? 20 : 0;
      score += acwrScore * 0.2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const getReadinessColor = (score: number): string => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.error;
  };

  const getReadinessLevel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    if (score >= 25) return 'Fair';
    return 'Poor';
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDateString = (): string => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const readinessScore = calculateReadinessScore();
  const readinessColor = getReadinessColor(readinessScore);
  const readinessLevel = getReadinessLevel(readinessScore);
  const greetingText = getGreeting();
  const dateString = getCurrentDateString();

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Home',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={handleDebugInfo}>
                <IconSymbol 
                  ios_icon_name="info.circle" 
                  android_material_icon_name="info" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSync} disabled={syncing}>
                <IconSymbol 
                  ios_icon_name="arrow.clockwise" 
                  android_material_icon_name="refresh" 
                  size={24} 
                  color={syncing ? colors.textSecondary : colors.text} 
                />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your health data...</Text>
          </View>
        ) : !metrics ? (
          <EmptyDataView
            icon="heart"
            iosIcon="heart.fill"
            title="No Health Data"
            message="Grant HealthKit permissions to see your daily readiness score and health metrics."
            actionTitle="Grant Permission"
            onAction={handleRequestPermission}
          />
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.greeting}>{greetingText}</Text>
              <Text style={styles.date}>{dateString}</Text>
            </View>

            <View style={styles.readinessCard}>
              <Text style={styles.cardTitle}>Daily Readiness</Text>
              
              <View style={styles.scoreContainer}>
                <Svg width={180} height={180}>
                  <Circle
                    cx={90}
                    cy={90}
                    r={70}
                    stroke={colors.border}
                    strokeWidth={12}
                    fill="none"
                  />
                  <Circle
                    cx={90}
                    cy={90}
                    r={70}
                    stroke={readinessColor}
                    strokeWidth={12}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 90 90)`}
                  />
                </Svg>
                
                <View style={styles.scoreTextContainer}>
                  <Text style={[styles.scoreValue, { color: readinessColor }]}>
                    {Math.round(readinessScore)}
                  </Text>
                  <Text style={styles.scoreLabel}>{readinessLevel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              {metrics.performanceIndex !== undefined && (
                <View style={styles.metricCard}>
                  <IconSymbol 
                    ios_icon_name="chart.line.uptrend.xyaxis" 
                    android_material_icon_name="trending-up" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={styles.metricValue}>
                    {metrics.performanceIndex.toFixed(1)}
                  </Text>
                  <Text style={styles.metricLabel}>Performance</Text>
                </View>
              )}

              {metrics.recoveryEfficiency !== undefined && (
                <View style={styles.metricCard}>
                  <IconSymbol 
                    ios_icon_name="arrow.clockwise" 
                    android_material_icon_name="refresh" 
                    size={24} 
                    color={colors.success} 
                  />
                  <Text style={styles.metricValue}>
                    {metrics.recoveryEfficiency.toFixed(0)}%
                  </Text>
                  <Text style={styles.metricLabel}>Recovery</Text>
                </View>
              )}

              {metrics.restingHR !== undefined && (
                <View style={styles.metricCard}>
                  <IconSymbol 
                    ios_icon_name="heart.fill" 
                    android_material_icon_name="favorite" 
                    size={24} 
                    color={colors.error} 
                  />
                  <Text style={styles.metricValue}>
                    {Math.round(metrics.restingHR)}
                  </Text>
                  <Text style={styles.metricLabel}>Resting HR</Text>
                </View>
              )}

              {metrics.hrv !== undefined && (
                <View style={styles.metricCard}>
                  <IconSymbol 
                    ios_icon_name="waveform.path.ecg" 
                    android_material_icon_name="show-chart" 
                    size={24} 
                    color={colors.warning} 
                  />
                  <Text style={styles.metricValue}>
                    {Math.round(metrics.hrv)}
                  </Text>
                  <Text style={styles.metricLabel}>HRV</Text>
                </View>
              )}
            </View>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  readinessCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  scoreContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
