
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
import { BioCard } from '@/components/BioCard';
import { BioAgeData } from '@/utils/bioAge';
import { Colors } from '@/constants/Colors';
import Svg, { Circle } from 'react-native-svg';

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
    paddingBottom: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreContent: {
    marginLeft: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scoreLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  ageColumn: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  ageValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ageLabel: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  arrowContainer: {
    marginHorizontal: 20,
  },
  gapBadge: {
    backgroundColor: Colors.bgSurface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  gapText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    borderBottomColor: Colors.borderSubtle,
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
    color: Colors.textPrimary,
  },
  factorScore: {
    fontSize: 15,
    fontWeight: '600',
  },
  factorDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  factorImpact: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  factorRecommendation: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
});

interface RingGaugeProps {
  size: number;
  lineWidth: number;
  value: number;
  color: string;
}

function RingGauge({ size, lineWidth, value, color }: RingGaugeProps) {
  const radius = (size - lineWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={Colors.borderSubtle}
        strokeWidth={lineWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={lineWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

interface LongevityScoreCardProps {
  score: number;
}

function LongevityScoreCard({ score }: LongevityScoreCardProps) {
  const scoreColor = getLongevityScoreColor(score);
  const scoreLabel = getLongevityScoreLevel(score);
  const scoreValueText = Math.round(score).toString();
  const labelText = 'Longevity Score';
  const descriptionText = 'Based on biological age vs chronological age';

  return (
    <BioCard accentColor={Colors.accentPurple}>
      <Text style={styles.label}>{labelText}</Text>
      <View style={styles.scoreContainer}>
        <RingGauge size={72} lineWidth={8} value={score} color={scoreColor} />
        <View style={styles.scoreContent}>
          <Text style={styles.scoreValue}>{scoreValueText}</Text>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            {scoreLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{descriptionText}</Text>
    </BioCard>
  );
}

interface AgeComparisonCardProps {
  chronAge: number;
  bioAge: number;
  gap: number;
}

function AgeComparisonCard({ chronAge, bioAge, gap }: AgeComparisonCardProps) {
  const gapColor = gap > 0 ? Colors.accentGreen : Colors.accentRed;
  const arrowIconAndroid = gap > 0 ? 'arrow-back' : 'arrow-forward';
  const arrowIconIOS = gap > 0 ? 'arrow.left' : 'arrow.right';
  
  const chronAgeText = chronAge.toString();
  const bioAgeText = bioAge.toFixed(1);
  const chronLabelText = 'Chronological';
  const bioLabelText = 'Biological';
  const cardTitleText = 'Age Comparison';
  
  const gapAbsValue = Math.abs(gap).toFixed(1);
  const gapEmoji = gap > 0 ? '🌟' : '⚠️';
  const gapMessage = gap > 0 
    ? `${gapEmoji} ${gapAbsValue} years younger`
    : `${gapEmoji} ${gapAbsValue} years older`;

  return (
    <BioCard>
      <Text style={styles.cardTitle}>{cardTitleText}</Text>
      <View style={styles.ageRow}>
        <View style={styles.ageColumn}>
          <Text style={styles.ageValue}>{chronAgeText}</Text>
          <Text style={styles.ageLabel}>{chronLabelText}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <IconSymbol
            ios_icon_name={arrowIconIOS}
            android_material_icon_name={arrowIconAndroid}
            size={24}
            color={gapColor}
          />
        </View>

        <View style={styles.ageColumn}>
          <Text style={[styles.ageValue, { color: gapColor }]}>
            {bioAgeText}
          </Text>
          <Text style={styles.ageLabel}>{bioLabelText}</Text>
        </View>
      </View>

      <View style={styles.gapBadge}>
        <Text style={styles.gapText}>{gapMessage}</Text>
      </View>
    </BioCard>
  );
}

interface HealthSpanCardProps {
  estimatedHealthSpan: number;
  potentialGain: number;
}

function HealthSpanCard({ estimatedHealthSpan, potentialGain }: HealthSpanCardProps) {
  const healthSpanText = `${estimatedHealthSpan} years`;
  const potentialGainText = `+${potentialGain.toFixed(1)} years`;
  const cardTitleText = 'Health Span Estimate';
  const healthSpanLabelText = 'Estimated Health Span';
  const potentialGainLabelText = 'Potential Gain';

  return (
    <BioCard>
      <Text style={styles.cardTitle}>{cardTitleText}</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{healthSpanLabelText}</Text>
        <Text style={styles.summaryValue}>{healthSpanText}</Text>
      </View>
      
      <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
        <Text style={styles.summaryLabel}>{potentialGainLabelText}</Text>
        <Text style={[styles.summaryValue, { color: Colors.accentGreen }]}>
          {potentialGainText}
        </Text>
      </View>
    </BioCard>
  );
}

interface LongevityFactorsCardProps {
  factors: LongevityAnalysis['factors'];
}

function LongevityFactorsCard({ factors }: LongevityFactorsCardProps) {
  const cardTitleText = 'Longevity Factors';
  const emptyText = 'No factor data available';

  if (factors.length === 0) {
    return (
      <BioCard>
        <Text style={styles.cardTitle}>{cardTitleText}</Text>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </BioCard>
    );
  }

  return (
    <BioCard>
      <Text style={styles.cardTitle}>{cardTitleText}</Text>
      
      {factors.map((factor, index) => {
        const isLast = index === factors.length - 1;
        const scoreText = Math.round(factor.score).toString();
        const impactText = factor.yearImpact >= 0 
          ? `+${factor.yearImpact.toFixed(1)} years`
          : `${factor.yearImpact.toFixed(1)} years`;
        const impactColor = factor.yearImpact >= 0 ? Colors.accentGreen : Colors.accentRed;

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
    </BioCard>
  );
}

export default function LongevityDetailView() {
  const { metrics, loading } = useDailySync();
  const [chronAge, setChronAge] = useState<number | null>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [bioAgeData, setBioAgeData] = useState<BioAgeData | null>(null);

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
    const emptyStateText = 'Insufficient data for longevity analysis';
    
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'Longevity Analysis',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <IconSymbol
            ios_icon_name="heart.text.square.fill"
            android_material_icon_name="favorite"
            size={64}
            color={Colors.textMuted}
          />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            {emptyStateText}
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
        <LongevityScoreCard score={longevityAnalysis.longevityScore} />
        <AgeComparisonCard 
          chronAge={chronAge} 
          bioAge={bioAge} 
          gap={longevityAnalysis.ageGap}
        />
        <HealthSpanCard 
          estimatedHealthSpan={longevityAnalysis.estimatedHealthSpan}
          potentialGain={longevityAnalysis.potentialGain}
        />
        <LongevityFactorsCard factors={longevityAnalysis.factors} />
      </ScrollView>
    </SafeAreaView>
  );
}
