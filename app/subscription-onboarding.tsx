
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { Colors } from '@/constants/Colors';
import SubscriptionManager from '@/services/SubscriptionManager';
import { SubscriptionProduct } from '@/types/subscription';

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
  trialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgSurface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  trialText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accentBlue,
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.accentBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.bgPrimary,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accentBlue,
  },
  terms: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontSize: 12,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  linkSeparator: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: Colors.accentBlue,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.bgPrimary,
    textAlign: 'center',
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

interface SubscriptionActionsProps {
  plan: 'monthly' | 'annual';
  onSubscribe: () => void;
  onRestore: () => void;
  isLoading: boolean;
}

function SubscriptionActions({ plan, onSubscribe, onRestore, isLoading }: SubscriptionActionsProps) {
  const priceText = plan === 'monthly' ? '$1.49/month' : '$9.99/year';

  const handleTermsPress = () => {
    console.log('User tapped Terms link');
    Linking.openURL('https://bioloop.app/terms');
  };

  const handlePrivacyPress = () => {
    console.log('User tapped Privacy link');
    Linking.openURL('https://bioloop.app/privacy');
  };

  return (
    <>
      {/* Free Trial Notice */}
      <View style={styles.trialNotice}>
        <IconSymbol
          ios_icon_name="gift.fill"
          android_material_icon_name="card-giftcard"
          size={24}
          color={Colors.accentBlue}
        />
        <Text style={styles.trialText}>Start 7-day free trial</Text>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={onSubscribe}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.bgPrimary} />
        ) : (
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        )}
      </TouchableOpacity>

      {/* Restore Button */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={onRestore}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        Free for 7 days, then {priceText}. Cancel anytime. Auto-renews unless cancelled 24h before period ends.
      </Text>

      {/* Links */}
      <View style={styles.links}>
        <TouchableOpacity onPress={handleTermsPress}>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.linkSeparator}>•</Text>
        <TouchableOpacity onPress={handlePrivacyPress}>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

export default function SubscriptionOnboardingScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();

  console.log('SubscriptionOnboardingScreen: Rendered with selected plan:', selectedPlan);

  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    console.log('User selected plan:', plan);
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    console.log('User tapped Start Free Trial button for plan:', selectedPlan);
    setIsLoading(true);

    const productId = selectedPlan === 'monthly'
      ? SubscriptionProduct.MONTHLY
      : SubscriptionProduct.YEARLY;

    try {
      console.log('Initiating purchase for product:', productId);
      const success = await SubscriptionManager.purchase(productId);

      if (success) {
        console.log('✓ Purchase successful');
        setModalMessage('7-day trial started! Enjoy premium features.');
        setShowSuccessModal(true);
      } else {
        console.log('❌ Purchase failed');
        setModalMessage('Purchase failed. Please try again.');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setModalMessage(`Error: ${errorMessage}`);
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    console.log('User tapped Restore Purchases button');
    setIsLoading(true);

    try {
      console.log('Restoring purchases...');
      const success = await SubscriptionManager.restorePurchases();

      if (success) {
        console.log('✓ Restore successful');
        setModalMessage('Purchases restored successfully!');
        setShowRestoreModal(true);
      } else {
        console.log('❌ No purchases found');
        setModalMessage('No purchases found to restore.');
        setShowRestoreModal(true);
      }
    } catch (error) {
      console.error('❌ Restore error:', error);
      setModalMessage('Failed to restore purchases. Please try again.');
      setShowRestoreModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    console.log('Closing success modal');
    setShowSuccessModal(false);
    // Navigate back to profile after successful purchase
    router.back();
  };

  const handleCloseRestoreModal = () => {
    console.log('Closing restore modal');
    setShowRestoreModal(false);
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

          {/* Subscription Actions */}
          <SubscriptionActions
            plan={selectedPlan}
            onSubscribe={handleSubscribe}
            onRestore={handleRestore}
            isLoading={isLoading}
          />
        </ScrollView>
      </SafeAreaView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseSuccessModal}
        >
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={48}
              color={Colors.accentGreen}
            />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Restore Modal */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseRestoreModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseRestoreModal}
        >
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={48}
              color={Colors.accentBlue}
            />
            <Text style={styles.modalTitle}>Restore Purchases</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseRestoreModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
