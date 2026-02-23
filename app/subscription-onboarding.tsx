
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  plans: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  planSelected: {
    borderColor: Colors.accentBlue,
    borderWidth: 2,
  },
  planAnnual: {
    backgroundColor: Colors.bgCard,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.bgPrimary,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  planSavings: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accentGreen,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name="check"
          size={24}
          color={Colors.accentBlue}
        />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <IconSymbol
        ios_icon_name="checkmark"
        android_material_icon_name="check"
        size={20}
        color={Colors.accentGreen}
      />
    </View>
  );
}

interface PricingPlansProps {
  selected: 'monthly' | 'annual';
  onSelect: (plan: 'monthly' | 'annual') => void;
}

function PricingPlans({ selected, onSelect }: PricingPlansProps) {
  const isMonthlySelected = selected === 'monthly';
  const isAnnualSelected = selected === 'annual';

  return (
    <View style={styles.plans}>
      <Text style={styles.sectionTitle}>Choose Your Plan</Text>

      {/* Monthly Plan */}
      <TouchableOpacity
        style={[styles.planCard, isMonthlySelected && styles.planSelected]}
        onPress={() => onSelect('monthly')}
        activeOpacity={0.7}
      >
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Monthly</Text>
          <Text style={styles.planPrice}>$1.49</Text>
        </View>
        <Text style={styles.planPeriod}>per month</Text>
        <Text style={styles.planDescription}>Full access to premium features</Text>
        {isMonthlySelected && (
          <View style={styles.selectedBadge}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={Colors.accentGreen}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Annual Plan - BEST VALUE */}
      <TouchableOpacity
        style={[
          styles.planCard,
          styles.planAnnual,
          isAnnualSelected && styles.planSelected,
        ]}
        onPress={() => onSelect('annual')}
        activeOpacity={0.7}
      >
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>BEST VALUE</Text>
        </View>

        <View style={styles.planHeader}>
          <Text style={styles.planName}>Annual</Text>
          <Text style={styles.planPrice}>$9.99</Text>
        </View>
        <Text style={styles.planPeriod}>per year</Text>
        <Text style={styles.planSavings}>Save 44% • Just $0.83/month</Text>
        <Text style={styles.planDescription}>Save 44% compared to monthly</Text>
        {isAnnualSelected && (
          <View style={styles.selectedBadge}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color={Colors.accentGreen}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function SubscriptionOnboardingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const router = useRouter();

  console.log('SubscriptionOnboardingScreen: Rendered with selected plan:', selectedPlan);

  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    console.log('User selected plan:', plan);
    setSelectedPlan(plan);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Premium',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Unlock Full Potential</Text>
            <Text style={styles.subtitle}>
              Get unlimited access to all premium features
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.features}>
            <FeatureRow
              icon="chart.line.uptrend.xyaxis"
              title="30-Day History"
              description="View complete trends and progress"
            />
            <FeatureRow
              icon="heart.text.square"
              title="BioAge Analysis"
              description="Track biological age trajectory"
            />
            <FeatureRow
              icon="chart.bar.fill"
              title="Performance Insights"
              description="Advanced metrics and recommendations"
            />
            <FeatureRow
              icon="arrow.down.doc"
              title="Export Data"
              description="Download health data anytime"
            />
            <FeatureRow
              icon="sparkles"
              title="Priority Support"
              description="Get help when you need it"
            />
          </View>

          {/* Pricing Plans */}
          <PricingPlans selected={selectedPlan} onSelect={handlePlanSelect} />

          {/* TODO: Add SubscriptionActions component in next part */}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
