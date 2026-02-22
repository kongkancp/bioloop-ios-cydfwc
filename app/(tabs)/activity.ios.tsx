
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { 
  getRecoveryEfficiencyInterpretation, 
  getRecoveryEfficiencyColor,
  getRecoveryEfficiencyMessage 
} from '@/utils/recoveryEfficiency';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useDailySync } from '@/hooks/useDailySync';
import { getACWRInterpretation, getACWRColor } from '@/utils/acwr';
import { getLoadInterpretation, getLoadColor } from '@/utils/loadScore';
import { getPerformanceLevel, getPerformanceMessage } from '@/utils/performanceIndex';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
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
    color: colors.secondaryText,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    opacity: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 15,
    color: colors.secondaryText,
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gaugeValue: {
    position: 'absolute',
    top: 70,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  gaugeLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 8,
  },
  acwrZone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  zoneLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  zoneValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.secondaryText,
  },
});

function getACWRPosition(acwr: number): number {
  const min = 0.5;
  const max = 2.0;
  const clamped = Math.max(min, Math.min(max, acwr));
  return ((clamped - min) / (max - min)) * 180;
}

export default function ActivityScreen() {
  const { metrics, loading } = useDailySync();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Activity',
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading activity data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const performanceIndex = metrics?.performanceIndex ?? 0;
  const loadScore = metrics?.loadScore ?? 0;
  const acwr = metrics?.acwr ?? 1.0;
  const acwrScore = metrics?.acwrScore ?? 0;
  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 0;

  const performanceLevel = getPerformanceLevel(performanceIndex);
  const performanceMessage = getPerformanceMessage(performanceIndex);
  const loadInterpretation = getLoadInterpretation(loadScore);
  const loadColor = getLoadColor(loadScore);
  const acwrInterpretation = getACWRInterpretation(acwr);
  const acwrColor = getACWRColor(acwr);
  const recoveryInterpretation = getRecoveryEfficiencyInterpretation(recoveryEfficiency);
  const recoveryColor = getRecoveryEfficiencyColor(recoveryEfficiency);
  const recoveryMessage = getRecoveryEfficiencyMessage(recoveryEfficiency);

  const acwrAngle = getACWRPosition(acwr);
  const radius = 60;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const acwrProgress = (acwrAngle / 180) * circumference;

  const performanceIndexRounded = Math.round(performanceIndex);
  const loadScoreRounded = Math.round(loadScore);
  const acwrFormatted = acwr.toFixed(2);
  const acwrScoreRounded = Math.round(acwrScore);
  const recoveryEfficiencyRounded = Math.round(recoveryEfficiency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Activity',
          headerShown: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your training metrics</Text>
        </View>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => {
            console.log('Navigating to Performance Index detail');
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Performance Index</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.chevron}
            />
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Current Score</Text>
            <Text style={styles.metricValue}>{performanceIndexRounded}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.statusText, { color: colors.primary }]}>
              {performanceLevel}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => {
            console.log('Navigating to Strain detail');
            router.push('/strain-detail');
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Training Strain</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.chevron}
            />
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Load Score</Text>
            <Text style={[styles.metricValue, { color: loadColor }]}>
              {loadScoreRounded}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${loadColor}20` }]}>
            <Text style={[styles.statusText, { color: loadColor }]}>
              {loadInterpretation}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => {
            console.log('Navigating to Recovery detail');
            router.push('/recovery-detail');
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recovery</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.secondaryText}
              style={styles.chevron}
            />
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Recovery Efficiency</Text>
            <Text style={[styles.metricValue, { color: recoveryColor }]}>
              {recoveryEfficiencyRounded}%
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${recoveryColor}20` }]}>
            <Text style={[styles.statusText, { color: recoveryColor }]}>
              {recoveryInterpretation}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Acute:Chronic Workload Ratio</Text>
          </View>
          <View style={styles.gaugeContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius + strokeWidth + 10}>
              <Defs>
                <LinearGradient id="acwrGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#FF3B30" />
                  <Stop offset="33%" stopColor="#FF9500" />
                  <Stop offset="50%" stopColor="#34C759" />
                  <Stop offset="67%" stopColor="#FF9500" />
                  <Stop offset="100%" stopColor="#FF3B30" />
                </LinearGradient>
              </Defs>
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={0}
                transform={`rotate(180 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
              />
              <Circle
                cx={radius + strokeWidth / 2}
                cy={radius + strokeWidth / 2}
                r={radius}
                stroke="url(#acwrGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference - acwrProgress}
                strokeLinecap="round"
                transform={`rotate(180 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
              />
            </Svg>
            <Text style={styles.gaugeValue}>{acwrFormatted}</Text>
          </View>
          <Text style={styles.gaugeLabel}>Optimal range: 0.8 - 1.3</Text>
          <View style={styles.acwrZone}>
            <Text style={styles.zoneLabel}>Injury Risk</Text>
            <Text style={[styles.zoneValue, { color: acwrColor }]}>
              {acwrInterpretation}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
