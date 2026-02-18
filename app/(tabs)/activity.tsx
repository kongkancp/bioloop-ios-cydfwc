
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  header: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  workoutCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  workoutTime: {
    fontSize: 13,
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 12,
  },
});

export default function ActivityScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const workouts = [
    {
      type: 'Running',
      time: '2 hours ago',
      duration: '45 min',
      avgHR: '145 bpm',
      peakHR: '172 bpm',
      icon: 'directions-run',
    },
  ];

  const periodText = selectedPeriod === 'week' ? 'Week' : selectedPeriod === 'month' ? 'Month' : 'Year';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Heart Rate Trends</Text>
          <View style={styles.chartPlaceholder}>
            <IconSymbol ios_icon_name="chart.line.uptrend.xyaxis" android_material_icon_name="show-chart" size={48} color={colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>Chart visualization</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>HRV Analysis</Text>
          <View style={styles.chartPlaceholder}>
            <IconSymbol ios_icon_name="waveform.path.ecg" android_material_icon_name="show-chart" size={48} color={colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>HRV trends over time</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {workouts.length > 0 ? (
          <>
            {workouts.map((workout, index) => (
              <View key={index} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutIcon}>
                    <IconSymbol ios_icon_name="figure.run" android_material_icon_name={workout.icon} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutType}>{workout.type}</Text>
                    <Text style={styles.workoutTime}>{workout.time}</Text>
                  </View>
                </View>
                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>Duration</Text>
                    <Text style={styles.workoutStatValue}>{workout.duration}</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>Avg HR</Text>
                    <Text style={styles.workoutStatValue}>{workout.avgHR}</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>Peak HR</Text>
                    <Text style={styles.workoutStatValue}>{workout.peakHR}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol ios_icon_name="figure.walk" android_material_icon_name="directions-walk" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No workouts recorded today</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
