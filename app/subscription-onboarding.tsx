
import { SubscriptionProduct } from '@/types/subscription';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import SubscriptionManager from '@/services/SubscriptionManager';
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
import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FeatureRowProps {
  icon: string;
  title: string;
  description: string;
}

interface PricingPlansProps {
  selected: 'monthly' | 'annual';
  onSelect: (plan: 'monthly' | 'annual') => void;
}

interface SubscriptionActionsProps {
  plan: 'monthly' | 'annual';
  onSubscribe: () => void;
  onRestore: () => void;
  isLoading: boolean;
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={icon}
          size={24}
          color="#007AFF"
        />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function PricingPlans({ selected, onSelect }: PricingPlansProps) {
  return (
    <View style={styles.plans}>
      <Text style={styles.sectionTitle}>Choose Your Plan</Text>

      {/* Monthly Plan */}
      <TouchableOpacity
        style={[styles.planCard, selected === 'monthly' && styles.planSelected]}
        onPress={() => onSelect('monthly')}
      >
        {selected === 'monthly' && (
          <View style={styles.selectedBadge}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color="#34C759"
            />
          </View>
        )}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Monthly</Text>
          <Text style={styles.planPrice}>$1.49</Text>
        </View>
        <Text style={styles.planPeriod}>per month</Text>
        <Text style={styles.planDescription}>Full access to premium features</Text>
      </TouchableOpacity>

      {/* Annual Plan - BEST VALUE */}
      <TouchableOpacity
        style={[
          styles.planCard,
          styles.planAnnual,
          selected === 'annual' && styles.planSelected,
        ]}
        onPress={() => onSelect('annual')}
      >
        <View style={styles.bestValueBadge}>
          <Text style={styles.bestValueText}>BEST VALUE</Text>
        </View>

        {selected === 'annual' && (
          <View style={styles.selectedBadge}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={20}
              color="#34C759"
            />
          </View>
        )}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Annual</Text>
          <Text style={styles.planPrice}>$9.99</Text>
        </View>
        <Text style={styles.planPeriod}>per year</Text>
        <Text style={styles.planSavings}>Save 44% • Just $0.83/month</Text>
        <Text style={styles.planDescription}>Save 44% compared to monthly</Text>
      </TouchableOpacity>
    </View>
  );
}

function SubscriptionActions({
  plan,
  onSubscribe,
  onRestore,
  isLoading,
}: SubscriptionActionsProps) {
  const handleTermsPress = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacyPress = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const planPrice = plan === 'monthly' ? '$1.49/month' : '$9.99/year';

  return (
    <>
      {/* Free Trial Notice */}
      <View style={styles.trialNotice}>
        <IconSymbol
          ios_icon_name="gift.fill"
          android_material_icon_name="card-giftcard"
          size={24}
          color="#007AFF"
        />
        <Text style={styles.trialText}>Start 7-day free trial</Text>
      </View>

      {/* Subscribe Button */}
      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={onSubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        )}
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={onRestore}
        disabled={isLoading}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        Free for 7 days, then {planPrice}. Cancel anytime. Auto-renews unless
        cancelled 24h before period ends.
      </Text>

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
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    console.log('User selected plan:', plan);
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    console.log('User tapped Start Free Trial button');
    setIsLoading(true);
    try {
      const productId =
        selectedPlan === 'monthly'
          ? 'bioloop.premium.monthly'
          : 'bioloop.premium.annual';
      await SubscriptionManager.purchaseProduct(productId);
      console.log('Subscription successful');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    console.log('User tapped Restore Purchases button');
    setIsLoading(true);
    try {
      await SubscriptionManager.restorePurchases();
      console.log('Restore successful');
      setShowRestoreModal(true);
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleCloseRestoreModal = () => {
    setShowRestoreModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Premium',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Premium Features</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all features and insights
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow
            icon="history"
            title="Unlimited History"
            description="Access all your historical data and trends"
          />
          <FeatureRow
            icon="insights"
            title="Advanced Insights"
            description="Deep analysis of your health metrics"
          />
          <FeatureRow
            icon="download"
            title="Data Export"
            description="Export your data anytime in CSV format"
          />
          <FeatureRow
            icon="notifications"
            title="Smart Notifications"
            description="Get personalized health reminders"
          />
        </View>

        {/* Pricing Plans */}
        <PricingPlans selected={selectedPlan} onSelect={handlePlanSelect} />

        {/* Actions */}
        <SubscriptionActions
          plan={selectedPlan}
          onSubscribe={handleSubscribe}
          onRestore={handleRestore}
          isLoading={isLoading}
        />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={64}
              color="#34C759"
            />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              Your 7-day free trial has started. Enjoy premium features!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Restore Modal */}
      <Modal
        visible={showRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseRestoreModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check-circle"
              size={64}
              color="#34C759"
            />
            <Text style={styles.modalTitle}>Restored!</Text>
            <Text style={styles.modalMessage}>
              Your purchases have been restored successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseRestoreModal}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Features
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
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
    color: '#000000',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Plans
  plans: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  planCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planAnnual: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  planSelected: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  planPeriod: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  planSavings: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Actions
  trialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: 16,
  },
  trialText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 15,
    color: '#007AFF',
  },
  terms: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    fontSize: 12,
    color: '#007AFF',
  },
  linkSeparator: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
