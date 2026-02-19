
import { useDailySync } from '@/hooks/useDailySync';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import InsufficientDataBanner from '@/components/InsufficientDataBanner';
import { colors } from '@/styles/commonStyles';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';
import {
  getAgeGapColor,
  getAgeGapEmoji,
  getAgeGapMessage,
  calculateBioAgeIndices,
  hasMinimumData,
  calculateRawBioAge,
} from '@/utils/bioAge';
import { getPerformancePercentage } from '@/utils/baselines';
import { calculateAge } from '@/utils/age';
import { IconSymbol } from '@/components/IconSymbol';

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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bioAgeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bioAgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bioAgeLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  bioAgeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  bioAgeUnit: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ageGapContainer: {
    alignItems: 'flex-end',
  },
  ageGapEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  ageGapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bioAgeMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  componentsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  componentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  componentBar: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  componentBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  componentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default function BiologyScreen() {
  const { metrics, baselines, loading, userProfile } = useDailySync();

  // Calculate BioAge components
  const bioAgeData = useMemo(() => {
    if (!metrics || !baselines || !userProfile?.dateOfBirth) {
      return null;
    }

    const age = calculateAge(userProfile.dateOfBirth);
    const indices = calculateBioAgeIndices(metrics, baselines, userProfile.height);

    if (!hasMinimumData(indices)) {
      return null;
    }

    const bioAge = calculateRawBioAge(age, indices);
    const ageGap = age - bioAge;

    return {
      chronologicalAge: age,
      bioAge,
      ageGap,
      indices,
    };
  }, [metrics, baselines, userProfile]);

  // Determine missing metrics for banner
  const missingMetrics = useMemo(() => {
    if (!bioAgeData) {
      const missing: string[] = [];
      if (!metrics?.hrv || !metrics?.restingHR) missing.push('HRV');
      if (!metrics?.vo2max) missing.push('VO2 Max');
      if (!metrics?.sleepDuration) missing.push('Sleep');
      if (!metrics?.workouts || metrics.workouts.length === 0) missing.push('Workouts');
      if (!userProfile?.height || !metrics?.bodyMass) missing.push('BMI');
      return missing;
    }
    return [];
  }, [bioAgeData, metrics, userProfile]);

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 80) return '#84cc16';
    if (percentage >= 60) return '#eab308';
    return '#ef4444';
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const todayFormatted = formatDate(new Date());

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

  if (!metrics || !baselines) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Biology',
            headerShown: false,
          }}
        />
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="heart.text.square"
            android_material_icon_name="favorite"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>
            No health data available yet.{'\n'}Sync your HealthKit data to see your biological age.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const autonomicPercentage = bioAgeData?.indices.autonomic ?? 0;
  const vo2Percentage = bioAgeData?.indices.vo2 ?? 0;
  const sleepPercentage = bioAgeData?.indices.sleep ?? 0;
  const workoutPercentage = bioAgeData?.indices.workout ?? 0;
  const bmiPercentage = bioAgeData?.indices.bmi ?? 0;

  const ageGapColor = bioAgeData ? getAgeGapColor(bioAgeData.ageGap) : colors.textSecondary;
  const ageGapEmoji = bioAgeData ? getAgeGapEmoji(bioAgeData.ageGap) : '📊';
  const ageGapMessage = bioAgeData ? getAgeGapMessage(bioAgeData.ageGap) : '';
  const bioAgeDisplay = bioAgeData ? bioAgeData.bioAge.toFixed(1) : '--';
  const ageGapDisplay = bioAgeData
    ? `${bioAgeData.ageGap >= 0 ? '+' : ''}${bioAgeData.ageGap.toFixed(1)} years`
    : '--';

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
          <Text style={styles.title}>Biological Age</Text>
          <Text style={styles.subtitle}>{todayFormatted}</Text>
        </View>

        {missingMetrics.length > 0 && (
          <InsufficientDataBanner missing={missingMetrics} />
        )}

        {bioAgeData && (
          <LinearGradient
            colors={[ageGapColor, ageGapColor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bioAgeCard}
          >
            <View style={styles.bioAgeHeader}>
              <View>
                <Text style={styles.bioAgeLabel}>Your Biological Age</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.bioAgeValue}>{bioAgeDisplay}</Text>
                  <Text style={styles.bioAgeUnit}> years</Text>
                </View>
              </View>
              <View style={styles.ageGapContainer}>
                <Text style={styles.ageGapEmoji}>{ageGapEmoji}</Text>
                <Text style={styles.ageGapText}>{ageGapDisplay}</Text>
              </View>
            </View>
            <Text style={styles.bioAgeMessage}>{ageGapMessage}</Text>
          </LinearGradient>
        )}

        <View style={styles.componentsCard}>
          <Text style={styles.componentsTitle}>BioAge Components</Text>

          <View style={styles.componentRow}>
            <View style={styles.componentIcon}>
              <IconSymbol
                ios_icon_name="heart.fill"
                android_material_icon_name="favorite"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>Autonomic (HRV + HR)</Text>
              <View style={styles.componentBar}>
                <View
                  style={[
                    styles.componentBarFill,
                    {
                      width: `${Math.min(autonomicPercentage, 100)}%`,
                      backgroundColor: getPerformanceColor(autonomicPercentage),
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.componentValue}>{Math.round(autonomicPercentage)}%</Text>
          </View>

          <View style={styles.componentRow}>
            <View style={styles.componentIcon}>
              <IconSymbol
                ios_icon_name="figure.run"
                android_material_icon_name="directions-run"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>VO2 Max</Text>
              <View style={styles.componentBar}>
                <View
                  style={[
                    styles.componentBarFill,
                    {
                      width: `${Math.min(vo2Percentage, 100)}%`,
                      backgroundColor: getPerformanceColor(vo2Percentage),
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.componentValue}>{Math.round(vo2Percentage)}%</Text>
          </View>

          <View style={styles.componentRow}>
            <View style={styles.componentIcon}>
              <IconSymbol
                ios_icon_name="moon.fill"
                android_material_icon_name="bedtime"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>Sleep Quality</Text>
              <View style={styles.componentBar}>
                <View
                  style={[
                    styles.componentBarFill,
                    {
                      width: `${Math.min(sleepPercentage, 100)}%`,
                      backgroundColor: getPerformanceColor(sleepPercentage),
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.componentValue}>{Math.round(sleepPercentage)}%</Text>
          </View>

          <View style={styles.componentRow}>
            <View style={styles.componentIcon}>
              <IconSymbol
                ios_icon_name="figure.strengthtraining.traditional"
                android_material_icon_name="fitness-center"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>Workout Frequency</Text>
              <View style={styles.componentBar}>
                <View
                  style={[
                    styles.componentBarFill,
                    {
                      width: `${Math.min(workoutPercentage, 100)}%`,
                      backgroundColor: getPerformanceColor(workoutPercentage),
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.componentValue}>{Math.round(workoutPercentage)}%</Text>
          </View>

          <View style={styles.componentRow}>
            <View style={styles.componentIcon}>
              <IconSymbol
                ios_icon_name="scalemass.fill"
                android_material_icon_name="monitor-weight"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.componentInfo}>
              <Text style={styles.componentName}>Body Composition (BMI)</Text>
              <View style={styles.componentBar}>
                <View
                  style={[
                    styles.componentBarFill,
                    {
                      width: `${Math.min(bmiPercentage, 100)}%`,
                      backgroundColor: getPerformanceColor(bmiPercentage),
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.componentValue}>{Math.round(bmiPercentage)}%</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Biological Age</Text>
          <Text style={styles.infoText}>
            Your biological age reflects how well your body is functioning compared to your
            chronological age. It's calculated from five key health components: autonomic function
            (HRV + resting heart rate), cardiovascular fitness (VO2 max), sleep quality, workout
            frequency, and body composition. A lower biological age indicates better overall health
            and longevity potential.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
