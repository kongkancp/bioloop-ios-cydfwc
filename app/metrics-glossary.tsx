
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, useRouter } from 'expo-router';

interface MetricInfo {
  name: string;
  icon: string;
  desc: string;
  range: string;
  ideal: string;
  formula: string;
}

interface GlossaryCategory {
  name: string;
  metrics: MetricInfo[];
}

const GLOSSARY_DATA: GlossaryCategory[] = [
  {
    name: 'Readiness & Recovery',
    metrics: [
      {
        name: 'Readiness Score',
        icon: 'speed',
        desc: 'Overall body preparedness for activity',
        range: '0-100',
        ideal: '80-100',
        formula: '50% Recovery + 30% Sleep + 20% Strain',
      },
      {
        name: 'Recovery Efficiency',
        icon: 'favorite',
        desc: 'How quickly body bounces back',
        range: '0-100%',
        ideal: '70-100%',
        formula: '70% HR Recovery + 30% HRV Rebound',
      },
    ],
  },
  {
    name: 'Performance',
    metrics: [
      {
        name: 'Performance Index',
        icon: 'bar-chart',
        desc: 'Training readiness combining multiple factors',
        range: '0-100',
        ideal: '65-85',
        formula: '40% Load + 30% Sustainability + 30% Recovery',
      },
      {
        name: 'Load Score',
        icon: 'local-fire-department',
        desc: 'Training intensity and volume',
        range: '0-100',
        ideal: 'Varies by phase',
        formula: 'HR reserve × duration',
      },
    ],
  },
  {
    name: 'Longevity',
    metrics: [
      {
        name: 'BioAge',
        icon: 'directions-walk',
        desc: 'Estimated biological age',
        range: '18-100 yrs',
        ideal: 'Below chronological',
        formula: '5 health components + norms',
      },
      {
        name: 'Longevity Score',
        icon: 'favorite-border',
        desc: 'Health trajectory',
        range: '0-100',
        ideal: '80-100',
        formula: 'Based on BioAge gap',
      },
    ],
  },
  {
    name: 'Sleep',
    metrics: [
      {
        name: 'Sleep Duration',
        icon: 'bedtime',
        desc: 'Total hours of sleep per night',
        range: '0-12 hrs',
        ideal: '7-9 hrs',
        formula: 'Total sleep time from HealthKit',
      },
      {
        name: 'Sleep Quality',
        icon: 'hotel',
        desc: 'Overall sleep effectiveness',
        range: '0-100',
        ideal: '70-100',
        formula: 'Duration + Consistency + Deep Sleep %',
      },
    ],
  },
  {
    name: 'Heart Rate Variability',
    metrics: [
      {
        name: 'HRV (SDNN)',
        icon: 'monitor-heart',
        desc: 'Variation in time between heartbeats',
        range: '20-200 ms',
        ideal: '50-100 ms',
        formula: 'Standard deviation of NN intervals',
      },
      {
        name: 'Resting Heart Rate',
        icon: 'favorite',
        desc: 'Heart rate at complete rest',
        range: '40-100 bpm',
        ideal: '50-70 bpm',
        formula: 'Average HR during sleep/rest',
      },
    ],
  },
  {
    name: 'Aerobic Fitness',
    metrics: [
      {
        name: 'VO2 Max',
        icon: 'air',
        desc: 'Maximum oxygen uptake capacity',
        range: '20-80 ml/kg/min',
        ideal: '40-60 ml/kg/min',
        formula: 'Estimated from workout data',
      },
    ],
  },
  {
    name: 'Training Load',
    metrics: [
      {
        name: 'ACWR',
        icon: 'trending-up',
        desc: 'Acute to Chronic Workload Ratio',
        range: '0.5-2.0',
        ideal: '0.8-1.3',
        formula: '7-day load / 28-day load',
      },
      {
        name: 'Sustainability',
        icon: 'eco',
        desc: 'Training load sustainability',
        range: '0-100',
        ideal: '70-100',
        formula: 'Based on ACWR and recovery',
      },
    ],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  metricDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chevronContainer: {
    marginLeft: 8,
  },
});

export default function MetricsGlossaryScreen() {
  const router = useRouter();

  const handleMetricPress = (metric: MetricInfo) => {
    console.log('User tapped metric:', metric.name);
    router.push({
      pathname: '/metric-detail',
      params: {
        name: metric.name,
        icon: metric.icon,
        desc: metric.desc,
        range: metric.range,
        ideal: metric.ideal,
        formula: metric.formula,
      },
    });
  };

  const renderSectionHeader = ({ section }: { section: GlossaryCategory }) => {
    const headerText = section.name;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{headerText}</Text>
      </View>
    );
  };

  const renderMetricItem = ({ item }: { item: MetricInfo }) => {
    const metricName = item.name;
    const metricDesc = item.desc;

    return (
      <TouchableOpacity
        style={styles.metricItem}
        onPress={() => handleMetricPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name={item.icon}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricName}>{metricName}</Text>
          <Text style={styles.metricDesc} numberOfLines={2}>
            {metricDesc}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const sections = GLOSSARY_DATA.map((category) => ({
    title: category.name,
    data: category.metrics,
    name: category.name,
    metrics: category.metrics,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Metrics Guide',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderMetricItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
