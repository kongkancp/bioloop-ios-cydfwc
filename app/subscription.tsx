
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSubscription } from '@/hooks/useSubscription';
import {
  SUBSCRIPTION_PRODUCTS,
  PREMIUM_FEATURES,
  SubscriptionProduct,
} from '@/types/subscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isSubscribed, currentSubscription, purchase, restorePurchases, isLoading } = useSubscription();
  const [selectedProduct, setSelectedProduct] = useState<SubscriptionProduct>(
    SubscriptionProduct.YEARLY
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handlePurchase = async () => {
    console.log('SubscriptionScreen: User tapped Subscribe button', selectedProduct);
    const success = await purchase(selectedProduct);
    if (success) {
      setShowSuccessModal(true);
    }
  };

  const handleRestore = async () => {
    console.log('SubscriptionScreen: User tapped Restore Purchases');
    const success = await restorePurchases();
    setRestoreSuccess(success);
    setShowRestoreModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleCloseRestore = () => {
    setShowRestoreModal(false);
  };

  const loadingIndicator = isLoading;
  const subscriptionActive = isSubscribed;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'BioLoop Premium',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>Unlock Premium Features</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all your health data and advanced analytics
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <IconSymbol
                  ios_icon_name={feature.iosIcon}
                  android_material_icon_name={feature.icon}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color="#34C759"
              />
            </View>
          ))}
        </View>

        {!subscriptionActive && (
          <>
            <View style={styles.plansSection}>
              <Text style={styles.sectionTitle}>Choose Your Plan</Text>
              {SUBSCRIPTION_PRODUCTS.map((product) => {
                const isSelected = selectedProduct === product.id;
                const isFeatured = product.featured;
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                      isFeatured && styles.planCardFeatured,
                    ]}
                    onPress={() => setSelectedProduct(product.id)}
                    disabled={loadingIndicator}
                  >
                    {isFeatured && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>BEST VALUE</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{product.displayName}</Text>
                        <Text style={styles.planDescription}>{product.description}</Text>
                      </View>
                      <View style={styles.planPricing}>
                        <Text style={styles.planPrice}>{product.price}</Text>
                        {product.pricePerMonth && (
                          <Text style={styles.planPricePerMonth}>{product.pricePerMonth}</Text>
                        )}
                      </View>
                    </View>
                    {product.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{product.savings}</Text>
                      </View>
                    )}
                    <View style={styles.radioButton}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, loadingIndicator && styles.subscribeButtonDisabled]}
              onPress={handlePurchase}
              disabled={loadingIndicator}
            >
              {loadingIndicator ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={loadingIndicator}>
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        )}

        {subscriptionActive && (
          <View style={styles.activeSubscriptionCard}>
            <View style={styles.activeSubscriptionHeader}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={32}
                color="#34C759"
              />
              <Text style={styles.activeSubscriptionTitle}>Premium Active</Text>
            </View>
            <Text style={styles.activeSubscriptionText}>
              You have access to all premium features
            </Text>
            {currentSubscription && (
              <Text style={styles.activeSubscriptionPlan}>
                Current Plan: {currentSubscription === SubscriptionProduct.MONTHLY ? 'Monthly' : 'Annual'}
              </Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscriptions auto-renew unless cancelled. Cancel anytime in Settings.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showSuccessModal} transparent animationType="fade" onRequestClose={handleCloseSuccess}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={64}
                color="#34C759"
              />
            </View>
            <Text style={styles.modalTitle}>Welcome to Premium!</Text>
            <Text style={styles.modalText}>
              You now have unlimited access to all premium features. Enjoy your enhanced BioLoop experience!
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseSuccess}>
              <Text style={styles.modalButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRestoreModal} transparent animationType="fade" onRequestClose={handleCloseRestore}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <IconSymbol
                ios_icon_name={restoreSuccess ? 'checkmark.circle.fill' : 'info.circle.fill'}
                android_material_icon_name={restoreSuccess ? 'check-circle' : 'info'}
                size={64}
                color={restoreSuccess ? '#34C759' : colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>
              {restoreSuccess ? 'Purchases Restored' : 'No Purchases Found'}
            </Text>
            <Text style={styles.modalText}>
              {restoreSuccess
                ? 'Your previous purchases have been restored successfully.'
                : 'No previous purchases were found for this account.'}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseRestore}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  planCardFeatured: {
    borderColor: colors.primary,
  },
  featuredBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  planPricePerMonth: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  radioButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  activeSubscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  activeSubscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeSubscriptionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  activeSubscriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  activeSubscriptionPlan: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
