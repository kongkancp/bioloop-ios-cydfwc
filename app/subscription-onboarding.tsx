
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';

interface FeatureRowProps {
  icon: string;
  androidIcon: string;
  title: string;
  description: string;
}

function FeatureRow({ icon, androidIcon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={androidIcon}
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

export default function SubscriptionOnboardingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const router = useRouter();

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
              androidIcon="show-chart"
              title="30-Day History"
              description="View complete trends and progress"
            />
            <FeatureRow
              icon="heart.text.square"
              androidIcon="favorite"
              title="BioAge Analysis"
              description="Track biological age trajectory"
            />
            <FeatureRow
              icon="chart.bar.fill"
              androidIcon="bar-chart"
              title="Performance Insights"
              description="Advanced metrics and recommendations"
            />
            <FeatureRow
              icon="arrow.down.doc"
              androidIcon="download"
              title="Export Data"
              description="Download health data anytime"
            />
            <FeatureRow
              icon="sparkles"
              androidIcon="star"
              title="Priority Support"
              description="Get help when you need it"
            />
          </View>

          {/* Placeholder for PricingPlans component (Part 2) */}
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              Pricing plans will be added in Part 2
            </Text>
          </View>

          {/* Placeholder for SubscriptionActions component (Part 3) */}
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              Subscription actions will be added in Part 3
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

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
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  features: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
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
    lineHeight: 18,
  },
  placeholderSection: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
