
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  bioAgeCard: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bioAgeLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  bioAgeValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bioAgeSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  insightText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  factorCard: {
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
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  factorName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  factorScore: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  factorBar: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});

export default function BiologyScreen() {
  const bioAge = 28;
  const chronologicalAge = 32;
  const ageDifference = chronologicalAge - bioAge;
  const ageDifferenceText = `${ageDifference} years younger`;

  const insights = [
    {
      title: 'Cardiovascular Health',
      text: 'Your resting heart rate and HRV indicate excellent cardiovascular fitness. Continue your current exercise routine.',
      icon: 'heart.fill',
      androidIcon: 'favorite',
    },
    {
      title: 'Recovery Capacity',
      text: 'Your sleep quality and HRV recovery patterns suggest strong adaptation to training stress.',
      icon: 'moon.stars.fill',
      androidIcon: 'bedtime',
    },
  ];

  const factors = [
    { name: 'Cardiovascular', score: 92, percentage: 92 },
    { name: 'Recovery', score: 88, percentage: 88 },
    { name: 'Sleep Quality', score: 85, percentage: 85 },
    { name: 'Fitness Level', score: 90, percentage: 90 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Biology</Text>
        </View>

        <View style={styles.bioAgeCard}>
          <Text style={styles.bioAgeLabel}>Biological Age</Text>
          <Text style={styles.bioAgeValue}>{bioAge}</Text>
          <Text style={styles.bioAgeSubtext}>{ageDifferenceText}</Text>
        </View>

        <Text style={styles.sectionTitle}>Health Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightIcon}>
                <IconSymbol ios_icon_name={insight.icon} android_material_icon_name={insight.androidIcon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Contributing Factors</Text>
        {factors.map((factor, index) => (
          <View key={index} style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>{factor.name}</Text>
              <Text style={styles.factorScore}>{factor.score}</Text>
            </View>
            <View style={styles.factorBar}>
              <View style={[styles.factorBarFill, { width: `${factor.percentage}%` }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
