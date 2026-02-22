
import { Stack } from 'expo-router';
import { useDailySync } from '@/hooks/useDailySync';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { calculateBioAgeWithProfile } from '@/utils/bioAge';
import { calculateAge } from '@/utils/age';
import React, { useMemo } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DOB_KEY = 'bioloop_user_dob';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  heroCard: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreUnit: {
    fontSize: 28,
    color: colors.secondaryText,
    marginLeft: 4,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  comparisonContainer: {
    marginTop: 16,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  ageColumn: {
    alignItems: 'center',
  },
  ageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ageLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  ageSubLabel: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  arrowContainer: {
    marginHorizontal: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  messageText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factorsCard: {
    marginBottom: 24,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  factorIcon: {
    marginRight: 12,
  },
  factorContent: {
    flex: 1,
  },
  factorName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  factorValue: {
    fontSize: 13,
    color: colors.secondaryText,
  },
});

interface LongevityHeroCardProps {
  score: number;
}

function LongevityHeroCard({ score }: LongevityHeroCardProps) {
  const levelText = useMemo(() => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  }, [score]);

  const scoreColor = useMemo(() => {
    if (score >= 80) return colors.success;
    if (score >= 65) return colors.primary;
    if (score >= 50) return colors.warning;
    return colors.error;
  }, [score]);

  const scoreValueText = Math.round(score).toString();
  const unitText = '/100';

  return (
    <View style={[styles.card, styles.heroCard]}>
      <Text style={styles.sectionTitle}>Longevity Score</Text>
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {scoreValueText}
        </Text>
        <Text style={styles.scoreUnit}>{unitText}</Text>
      </View>
      <Text style={[styles.levelText, { color: scoreColor }]}>
        {levelText}
      </Text>
    </View>
  );
}

interface AgeComparisonCardProps {
  bioAge: number;
  chronAge: number;
}

function AgeComparisonCard({ bioAge, chronAge }: AgeComparisonCardProps) {
  const gap = chronAge - bioAge;

  const gapColor = useMemo(() => {
    return gap > 0 ? colors.success : colors.error;
  }, [gap]);

  const arrowIcon = useMemo(() => {
    return gap > 0 ? 'arrow-back' : 'arrow-forward';
  }, [gap]);

  const messageIcon = useMemo(() => {
    return gap > 0 ? 'check-circle' : 'warning';
  }, [gap]);

  const messageText = useMemo(() => {
    if (gap > 5) {
      const gapText = gap.toFixed(1);
      return `Excellent! Body is ${gapText} years younger`;
    }
    if (gap > 2) {
      const gapText = gap.toFixed(1);
      return `Great! ${gapText} years younger`;
    }
    if (gap > 0) {
      return 'Good! Slightly younger';
    }
    if (gap > -2) {
      return 'Ages match';
    }
    const absGapText = Math.abs(gap).toFixed(1);
    return `Body aging ${absGapText} years faster`;
  }, [gap]);

  const messageBackgroundColor = useMemo(() => {
    return gap > 0 ? `${colors.success}26` : `${colors.warning}26`;
  }, [gap]);

  const messageBorderColor = useMemo(() => {
    return gap > 0 ? colors.success : colors.warning;
  }, [gap]);

  const chronAgeText = chronAge.toString();
  const bioAgeText = bioAge.toFixed(1);
  const chronLabelText = 'Chronological';
  const chronSubLabelText = 'Actual age';
  const bioLabelText = 'Biological';
  const bioSubLabelText = "Body's age";

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Age Comparison</Text>
      <View style={styles.comparisonContainer}>
        <View style={styles.ageRow}>
          <View style={styles.ageColumn}>
            <Text style={[styles.ageValue, { color: colors.secondaryText }]}>
              {chronAgeText}
            </Text>
            <Text style={styles.ageLabel}>{chronLabelText}</Text>
            <Text style={styles.ageSubLabel}>{chronSubLabelText}</Text>
          </View>

          <View style={styles.arrowContainer}>
            <IconSymbol
              ios_icon_name="arrow.left"
              android_material_icon_name={arrowIcon}
              size={32}
              color={gapColor}
            />
          </View>

          <View style={styles.ageColumn}>
            <Text style={[styles.ageValue, { color: gapColor }]}>
              {bioAgeText}
            </Text>
            <Text style={styles.ageLabel}>{bioLabelText}</Text>
            <Text style={styles.ageSubLabel}>{bioSubLabelText}</Text>
          </View>
        </View>

        <View
          style={[
            styles.messageContainer,
            {
              backgroundColor: messageBackgroundColor,
              borderWidth: 1,
              borderColor: messageBorderColor,
            },
          ]}
        >
          <IconSymbol
            ios_icon_name={gap > 0 ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
            android_material_icon_name={messageIcon}
            size={24}
            color={gap > 0 ? colors.success : colors.warning}
          />
          <Text style={[styles.messageText, { color: colors.text }]}>
            {messageText}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface LongevityFactorsCardProps {
  metrics: any;
  chronAge: number;
}

function LongevityFactorsCard({ metrics, chronAge }: LongevityFactorsCardProps) {
  const hrvValue = metrics?.hrv ? `${Math.round(metrics.hrv)} ms` : 'No data';
  const vo2maxValue = metrics?.vo2max ? `${metrics.vo2max.toFixed(1)} ml/kg/min` : 'No data';
  const restingHRValue = metrics?.restingHR ? `${Math.round(metrics.restingHR)} bpm` : 'No data';

  return (
    <View style={[styles.card, styles.factorsCard]}>
      <Text style={styles.sectionTitle}>Longevity Factors</Text>

      <View style={styles.factorRow}>
        <View style={styles.factorIcon}>
          <IconSymbol
            ios_icon_name="waveform.path.ecg"
            android_material_icon_name="favorite"
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.factorContent}>
          <Text style={styles.factorName}>Heart Rate Variability</Text>
          <Text style={styles.factorValue}>{hrvValue}</Text>
        </View>
      </View>

      <View style={styles.factorRow}>
        <View style={styles.factorIcon}>
          <IconSymbol
            ios_icon_name="wind"
            android_material_icon_name="air"
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.factorContent}>
          <Text style={styles.factorName}>VO2 Max</Text>
          <Text style={styles.factorValue}>{vo2maxValue}</Text>
        </View>
      </View>

      <View style={[styles.factorRow, { borderBottomWidth: 0 }]}>
        <View style={styles.factorIcon}>
          <IconSymbol
            ios_icon_name="heart.fill"
            android_material_icon_name="favorite"
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.factorContent}>
          <Text style={styles.factorName}>Resting Heart Rate</Text>
          <Text style={styles.factorValue}>{restingHRValue}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LongevityDetailView() {
  const { metrics, loading } = useDailySync();
  const [chronAge, setChronAge] = React.useState<number | null>(null);

  React.useEffect(() => {
    async function loadAge() {
      try {
        const dobString = await AsyncStorage.getItem(USER_DOB_KEY);
        if (dobString) {
          const dob = new Date(dobString);
          const age = calculateAge(dob);
          setChronAge(age);
        }
      } catch (error) {
        console.error('Error loading date of birth:', error);
      }
    }
    loadAge();
  }, []);

  const bioAgeData = useMemo(() => {
    if (!metrics || !chronAge) return null;
    return calculateBioAgeWithProfile(metrics, chronAge);
  }, [metrics, chronAge]);

  const longevityScore = bioAgeData?.longevityScore ?? 50;
  const bioAge = bioAgeData?.bioAgeSmoothed ?? (chronAge ?? 30);
  const displayChronAge = chronAge ?? 30;

  if (loading || chronAge === null) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'Longevity Analysis',
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Longevity Analysis',
          headerShown: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <LongevityHeroCard score={longevityScore} />
        <AgeComparisonCard bioAge={bioAge} chronAge={displayChronAge} />
        <LongevityFactorsCard metrics={metrics} chronAge={displayChronAge} />
      </ScrollView>
    </SafeAreaView>
  );
}
