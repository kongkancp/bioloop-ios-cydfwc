
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import {
  calculateBioAgeIndices,
  hasMinimumData,
  calculateRawBioAge,
} from '@/utils/bioAge';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { calculateAge } from '@/utils/age';
import { IconSymbol } from '@/components/IconSymbol';
import BioAgeHeroCard from '@/components/BioAgeHeroCard';
import React, { useMemo } from 'react';
import InsufficientDataBanner from '@/components/InsufficientDataBanner';
import EmptyDataView from '@/components/EmptyDataView';
import { Stack, useRouter } from 'expo-router';
import { useDailySync } from '@/hooks/useDailySync';

// Helper function to get age group norms
function getAgeGroupNorms(age: number) {
  if (age < 25) return { hrv: 70, restingHR: 60, vo2max: 48 };
  if (age < 35) return { hrv: 65, restingHR: 62, vo2max: 45 };
  if (age < 45) return { hrv: 60, restingHR: 65, vo2max: 42 };
  if (age < 55) return { hrv: 50, restingHR: 68, vo2max: 38 };
  if (age < 65) return { hrv: 45, restingHR: 70, vo2max: 35 };
  return { hrv: 40, restingHR: 72, vo2max: 32 };
}

// Calculate BioAge indices from metrics
function calculateBioAgeIndicesLocal(metrics: any, norms: any, height: number) {
  const normalize = (val: number, exp: number) => {
    const z = (val - exp) / exp;
    return z / (1 + Math.abs(z));
  };
  
  let autonomic = null;
  if (metrics.hrv && metrics.restingHR) {
    autonomic = (normalize(metrics.hrv, norms.hrv) * -0.6) + (normalize(metrics.restingHR, norms.restingHR) * 0.4);
  }
  
  let vo2 = metrics.vo2max ? normalize(metrics.vo2max, norms.vo2max) * -1 : null;
  const sleep = metrics.sleepDuration ? (7 - metrics.sleepDuration) * 0.15 : 0;
  const workout = ((metrics.workouts?.length || 0) - 3) * -0.3;
  
  let bmi = 0;
  if (metrics.bodyMass && height > 0) {
    bmi = (metrics.bodyMass / ((height / 100) ** 2) - 23) / 5;
  }
  
  return { autonomic, vo2, sleep, workout, bmi };
}

// Calculate age offset from indices
function calculateAgeOffset(indices: any): number {
  let offset = 0;
  let weight = 0;
  
  if (indices.autonomic != null) { 
    offset += indices.autonomic * 0.40; 
    weight += 0.40; 
  }
  if (indices.vo2 != null) { 
    offset += indices.vo2 * 0.25; 
    weight += 0.25; 
  }
  
  offset += (indices.sleep || 0) * 0.15 + (indices.workout || 0) * 0.10 + (indices.bmi || 0) * 0.10;
  weight += 0.35;
  
  return weight > 0 ? offset / weight : 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  contributorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contributorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  contributorBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  contributorFill: {
    height: '100%',
    borderRadius: 3,
  },
  contributorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Longevity Score Card Component
function LongevityScoreCard({ score }: { score: number }) {
  const scoreColor = useMemo(() => {
    if (score >= 80) return '#10B981';
    if (score >= 65) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  }, [score]);

  const scoreLabel = useMemo(() => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  }, [score]);

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreTitle}>Longevity Score</Text>
      <Text style={[styles.scoreValue, { color: scoreColor }]}>
        {Math.round(score)}
      </Text>
      <Text style={styles.scoreSubtitle}>{scoreLabel}</Text>
    </View>
  );
}

// Contributors Card Component
function ContributorsCard({ contributors }: { contributors: any[] }) {
  const getContributorColor = (name: string) => {
    switch (name) {
      case 'Heart Health': return '#EF4444';
      case 'Aerobic Fitness': return '#3B82F6';
      case 'Sleep Quality': return '#8B5CF6';
      case 'Exercise': return '#10B981';
      case 'Body Comp': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const getIconName = (name: string) => {
    switch (name) {
      case 'Heart Health': return 'favorite';
      case 'Aerobic Fitness': return 'air';
      case 'Sleep Quality': return 'bedtime';
      case 'Exercise': return 'directions-run';
      case 'Body Comp': return 'monitor-weight';
      default: return 'info';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Contributing Factors</Text>
      {contributors.map((contributor, index) => {
        const contributorColor = getContributorColor(contributor.name);
        const iconName = getIconName(contributor.name);
        const percentage = Math.abs(contributor.value) * 10;
        const displayValue = contributor.value > 0 ? '+' : '';
        const valueText = `${displayValue}${contributor.value.toFixed(1)}`;

        return (
          <View key={index} style={styles.contributorRow}>
            <View style={[styles.contributorIcon, { backgroundColor: contributorColor + '20' }]}>
              <IconSymbol
                ios_icon_name={contributor.icon}
                android_material_icon_name={iconName}
                size={20}
                color={contributorColor}
              />
            </View>
            <View style={styles.contributorInfo}>
              <Text style={styles.contributorName}>{contributor.name}</Text>
              <View style={styles.contributorBar}>
                <View
                  style={[
                    styles.contributorFill,
                    { 
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: contributorColor 
                    }
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.contributorValue, { color: contributorColor }]}>
              {valueText}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function BiologyScreen() {
  const router = useRouter();
  const { metrics, baselines, userProfile, loading, syncNow } = useDailySync();

  const bioAgeData = useMemo(() => {
    if (!metrics || !baselines) {
      return null;
    }
    
    const age = userProfile?.dateOfBirth ? calculateAge(userProfile.dateOfBirth) : 35;
    if (age < 18 || age > 100) return null;
    
    const norms = getAgeGroupNorms(age);
    const indices = calculateBioAgeIndicesLocal(metrics, norms, userProfile?.height || 170);
    
    // Build contributors array
    const contributorsData = [
      { name: "Heart Health", value: (indices.autonomic ?? 0) * -1.5, icon: "heart.fill", color: "red" },
      { name: "Aerobic Fitness", value: (indices.vo2 ?? 0) * -1.2, icon: "wind", color: "blue" },
      { name: "Sleep Quality", value: (indices.sleep ?? 0) * -0.8, icon: "moon.zzz.fill", color: "purple" },
      { name: "Exercise", value: (indices.workout ?? 0) * -0.5, icon: "figure.run", color: "green" },
      { name: "Body Comp", value: (indices.bmi ?? 0) * -0.5, icon: "scalemass.fill", color: "orange" }
    ];
    
    const offset = calculateAgeOffset(indices);
    const ageImpact = Math.max(-12, Math.min(12, offset * 8 * (1 - Math.exp(-Math.abs(offset) * 2))));
    const rawBioAge = age + ageImpact;
    
    return {
      chronologicalAge: age,
      bioAge: rawBioAge,
      bioAgeSmoothed: rawBioAge,
      longevityScore: Math.max(0, Math.min(100, 100 - (Math.abs(rawBioAge - age) * 5))),
      contributors: contributorsData,
      indices,
      offset,
      ageImpact
    };
  }, [metrics, baselines, userProfile]);

  const contributors = bioAgeData?.contributors || [];

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 65) return '#3B82F6';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen
          options={{
            title: 'Biology',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Biology',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {bioAgeData ? (
          <>
            <BioAgeHeroCard 
              bioAge={bioAgeData.bioAgeSmoothed}
              chronologicalAge={bioAgeData.chronologicalAge}
              ageGap={bioAgeData.chronologicalAge - bioAgeData.bioAgeSmoothed}
            />
            <LongevityScoreCard score={bioAgeData.longevityScore} />
            <ContributorsCard contributors={contributors} />
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => router.push('/longevity-detail')}
            >
              <Text style={styles.detailButtonText}>View Detailed Analysis</Text>
            </TouchableOpacity>
          </>
        ) : (
          <EmptyDataView
            icon="figure.walk"
            iosIcon="figure.walk"
            title="No BioAge Data"
            message="Complete profile and sync HealthKit to see biological age"
            actionTitle="Sync Now"
            action={() => syncNow()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
