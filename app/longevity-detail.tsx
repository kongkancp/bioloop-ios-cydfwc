
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { calculateAge } from '@/utils/age';
import React, { useMemo, useEffect, useState } from 'react';
import { colors } from '@/styles/commonStyles';
import { useDailySync } from '@/hooks/useDailySync';
import {
  calculateLongevityData,
  getLongevityScoreColor,
  getLongevityScoreLevel,
  LongevityAnalysis,
} from '@/utils/longevity';
import { BioAgeData } from '@/utils/bioAge';

const USER_DOB_KEY = 'bioloop_user_dob';
const USER_HEIGHT_KEY = 'bioloop_user_height';
const BIOAGE_STORAGE_PREFIX = 'bioloop_bioage_';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  factorIcon: {
    marginRight: 16,
  },
  factorContent: {
    flex: 1,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  factorScore: {
    fontSize: 15,
    fontWeight: '600',
  },
  factorDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  factorImpact: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  factorRecommendation: {
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.secondaryText,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 20,
  },
});

interface LongevityHeroCardProps {
  score: number;
}

function LongevityHeroCard({ score }: LongevityHeroCardProps) {
  const levelText = getLongevityScoreLevel(score);
  const scoreColor = getLongevityScoreColor(score);
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
  ageGap: number;
}

function AgeComparisonCard({ bioAge, chronAge, ageGap }: AgeComparisonCardProps) {
  const gapColor = useMemo(() => {
    return ageGap > 0 ? colors.success : colors.error;
  }, [ageGap]);

  const arrowIcon = useMemo(() => {
    return ageGap > 0 ? 'arrow-back' : 'arrow-forward';
  }, [ageGap]);

  const messageIcon = useMemo(() => {
    return ageGap > 0 ? 'check-circle' : 'warning';
  }, [ageGap]);

  const messageText = useMemo(() => {
    if (ageGap > 5) {
      const gapText = ageGap.toFixed(1);
      return `Excellent! Body is ${gapText} years younger`;
    }
    if (ageGap > 2) {
      const gapText = ageGap.toFixed(1);
      return `Great! ${gapText} years younger`;
    }
    if (ageGap > 0) {
      return 'Good! Slightly younger';
    }
    if (ageGap > -2) {
      return 'Ages match closely';
    }
    const absGapText = Math.abs(ageGap).toFixed(1);
    return `Body aging ${absGapText} years faster`;
  }, [ageGap]);

  const messageBackgroundColor = useMemo(() => {
    return ageGap > 0 ? `${colors.success}26` : `${colors.warning}26`;
  }, [ageGap]);

  const messageBorderColor = useMemo(() => {
    return ageGap > 0 ? colors.success : colors.warning;
  }, [ageGap]);

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
            ios_icon_name={ageGap > 0 ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
            android_material_icon_name={messageIcon}
            size={24}
            color={ageGap > 0 ? colors.success : colors.warning}
          />
          <Text style={[styles.messageText, { color: colors.text }]}>
            {messageText}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface SummaryCardProps {
  analysis: LongevityAnalysis;
}

function SummaryCard({ analysis }: SummaryCardProps) {
  const healthSpanText = `${analysis.estimatedHealthSpan} years`;
  const potentialGainText = `+${analysis.potentialGain.toFixed(1)} years`;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Health Span Estimate</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Estimated Health Span</Text>
        <Text style={styles.summaryValue}>{healthSpanText}</Text>
      </View>
      
      <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.summaryLabel}>Potential Gain</Text>
        <Text style={[styles.summaryValue, { color: colors.success }]}>
          {potentialGainText}
        </Text>
      </View>
    </View>
  );
}

interface LongevityFactorsCardProps {
  analysis: LongevityAnalysis;
}

function LongevityFactorsCard({ analysis }: LongevityFactorsCardProps) {
  if (analysis.factors.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Longevity Factors</Text>
        <Text style={styles.emptyText}>No factor data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Longevity Factors</Text>
      
      {analysis.factors.map((factor, index) => {
        const isLast = index === analysis.factors.length - 1;
        const scoreText = Math.round(factor.score).toString();
        const impactText = factor.yearImpact >= 0 
          ? `+${factor.yearImpact.toFixed(1)} years`
          : `${factor.yearImpact.toFixed(1)} years`;
        const impactColor = factor.yearImpact >= 0 ? colors.success : colors.error;

        return (
          <View 
            key={index} 
            style={[styles.factorRow, isLast && { borderBottomWidth: 0 }]}
          >
            <View style={styles.factorIcon}>
              <IconSymbol
                ios_icon_name={factor.icon}
                android_material_icon_name={factor.androidIcon}
                size={28}
                color={factor.color}
              />
            </View>
            
            <View style={styles.factorContent}>
              <View style={styles.factorHeader}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={[styles.factorScore, { color: factor.color }]}>
                  {scoreText}
                </Text>
              </View>
              
              <Text style={styles.factorDescription}>
                {factor.description}
              </Text>
              
              <Text style={[styles.factorImpact, { color: impactColor }]}>
                {impactText}
              </Text>
              
              <Text style={styles.factorRecommendation}>
                {factor.recommendation}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function LongevityDetailView() {
  const { metrics, loading } = useDailySync();
  const [chronAge, setChronAge] = useState<number | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [bioAgeData, setBioAgeData] = useState<BioAgeData | null>(null);

  // Load user profile data
  useEffect(() => {
    async function loadProfileData() {
      try {
        const dobString = await AsyncStorage.getItem(USER_DOB_KEY);
        const heightString = await AsyncStorage.getItem(USER_HEIGHT_KEY);
        
        if (dobString) {
          const dob = new Date(dobString);
          const age = calculateAge(dob);
          setChronAge(age);
          console.log('Loaded chronological age:', age);
        }
        
        if (heightString) {
          const h = parseFloat(heightString);
          setHeight(h);
          console.log('Loaded height:', h);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }
    loadProfileData();
  }, []);

  // Load BioAge data
  useEffect(() => {
    async function loadBioAgeData() {
      if (!metrics) return;
      
      try {
        const dateKey = metrics.date.toISOString().split('T')[0];
        const bioAgeString = await AsyncStorage.getItem(`${BIOAGE_STORAGE_PREFIX}${dateKey}`);
        
        if (bioAgeString) {
          const data = JSON.parse(bioAgeString);
          setBioAgeData(data);
          console.log('Loaded BioAge data:', data);
        }
      } catch (error) {
        console.error('Error loading BioAge data:', error);
      }
    }
    loadBioAgeData();
  }, [metrics]);

  // Calculate longevity analysis
  const longevityAnalysis = useMemo(() => {
    if (!chronAge) {
      console.log('Cannot calculate longevity: no chronological age');
      return null;
    }
    
    console.log('Calculating longevity analysis with:', {
      chronAge,
      height,
      hasBioAge: !!bioAgeData,
      hasMetrics: !!metrics,
    });
    
    return calculateLongevityData(bioAgeData, metrics, chronAge, height);
  }, [bioAgeData, metrics, chronAge, height]);

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

  if (!longevityAnalysis) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'Longevity Analysis',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            Insufficient data for longevity analysis
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const bioAge = bioAgeData?.bioAgeSmoothed ?? chronAge;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Longevity Analysis',
          headerShown: true,
        }}
      />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
      >
        <LongevityHeroCard score={longevityAnalysis.longevityScore} />
        <AgeComparisonCard 
          bioAge={bioAge} 
          chronAge={chronAge} 
          ageGap={longevityAnalysis.ageGap}
        />
        <SummaryCard analysis={longevityAnalysis} />
        <LongevityFactorsCard analysis={longevityAnalysis} />
      </ScrollView>
    </SafeAreaView>
  );
}
