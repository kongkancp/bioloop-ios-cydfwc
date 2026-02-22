
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import InfoCard from '@/components/InfoCard';
import { useDailySync } from '@/hooks/useDailySync';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  infoCardContainer: {
    marginBottom: 24,
  },
});

export default function PerformanceInfoScreen() {
  const { metrics } = useDailySync();

  const performanceIndex = metrics?.performanceIndex ?? 78;
  const loadScore = metrics?.loadScore ?? 65;
  const recoveryEfficiency = metrics?.recoveryEfficiency ?? 82;

  const piValue = Math.round(performanceIndex).toString();
  const loadValue = Math.round(loadScore).toString();
  const recoveryValue = `${Math.round(recoveryEfficiency)}%`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Performance Metrics',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollContent}>
        <View style={styles.infoCardContainer}>
          <InfoCard
            title="Performance Index"
            icon="assessment"
            description="Combines Load (40%), Sustainability (30%), and Recovery (30%) to give you a comprehensive view of your training readiness."
            idealRange="65-85"
            yourValue={piValue}
            importance="high"
          />
        </View>

        <View style={styles.infoCardContainer}>
          <InfoCard
            title="Training Load"
            icon="fitness-center"
            description="Measures the intensity and volume of your recent workouts. Higher load indicates more training stress on your body."
            idealRange="50-75"
            yourValue={loadValue}
            importance="high"
          />
        </View>

        <View style={styles.infoCardContainer}>
          <InfoCard
            title="Recovery Efficiency"
            icon="favorite"
            description="How quickly your body bounces back from exercise. Based on HRV, resting heart rate, and sleep quality."
            idealRange="70-100%"
            yourValue={recoveryValue}
            importance="critical"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
