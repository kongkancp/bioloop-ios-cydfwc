
import DataManager from '@/services/DataManager';
import { IconSymbol } from '@/components/IconSymbol';
import { SubscriptionProduct } from '@/types/subscription';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  subscribedCard: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 6,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  manageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  freeCard: {
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
  },
  freeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  freeDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceSave: {
    fontSize: 11,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreBtn: {
    padding: 12,
    alignItems: 'center',
  },
  restoreBtnText: {
    fontSize: 14,
    color: '#007AFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
  },
  modalButtonConfirm: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: colors.text,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
  },
});

export default function ProfileScreen() {
  const { status, loading, error, refetch } = useSubscription();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log('ProfileScreen (iOS): Subscription status:', status, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top']}>
        <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="warning"
          size={48}
          color="#FF3B30"
        />
        <Text style={styles.errorText}>Failed to load subscription</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSubscribed = status?.isSubscribed ?? false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account and settings</Text>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Subscription</Text>
          {isSubscribed ? (
            <SubscribedView
              productId={status?.productId}
              expirationDate={status?.expirationDate}
              onManage={handleManageSubscription}
            />
          ) : (
            <FreeUserView
              onUpgrade={handleUpgradeToPremium}
              onRestore={handleRestorePurchases}
            />
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Settings</Text>
          <TouchableOpacity style={styles.listItem} onPress={handleEditProfile}>
            <View style={styles.listItemLeft}>
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="person"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Edit Profile</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleHealthKitPermissions}>
            <View style={styles.listItemLeft}>
              <IconSymbol
                ios_icon_name="heart.text.square"
                android_material_icon_name="favorite"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>HealthKit Permissions</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleMetricsGuide}>
            <View style={styles.listItemLeft}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Metrics Guide</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Legal</Text>
          <TouchableOpacity style={styles.listItem} onPress={handlePrivacyLink}>
            <View style={styles.listItemLeft}>
              <IconSymbol
                ios_icon_name="lock.shield"
                android_material_icon_name="lock"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Privacy Policy</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleTermsLink}>
            <View style={styles.listItemLeft}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Terms of Service</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAllData}>
          <Text style={styles.deleteButtonText}>Delete All Data</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteAllData}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete All Data?</Text>
            <Text style={styles.modalMessage}>
              This will permanently delete all your health data, metrics, and settings. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDeleteAllData}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDeleteAllData}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  function handleEditProfile() {
    console.log('User tapped Edit Profile (iOS)');
    router.push('/edit-profile');
  }

  function handleUpgradeToPremium() {
    console.log('User tapped Upgrade to Premium (iOS)');
    router.push('/subscription-onboarding');
  }

  function handleManageSubscription() {
    console.log('User tapped Manage Subscription (iOS)');
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  }

  function handleRestorePurchases() {
    console.log('User tapped Restore Purchases (iOS)');
    // TODO: Implement restore purchases logic
    Alert.alert('Restore Purchases', 'This feature will be implemented soon.');
  }

  function handleHealthKitPermissions() {
    console.log('User tapped HealthKit Permissions (iOS)');
    router.push('/onboarding/healthkit-permission');
  }

  function handleMetricsGuide() {
    console.log('User tapped Metrics Guide (iOS)');
    router.push('/metrics-glossary');
  }

  function handlePrivacyLink() {
    console.log('User tapped Privacy Policy (iOS)');
    Linking.openURL('https://bioloop.app/privacy');
  }

  function handleTermsLink() {
    console.log('User tapped Terms of Service (iOS)');
    Linking.openURL('https://bioloop.app/terms');
  }

  function handleDeleteAllData() {
    console.log('User tapped Delete All Data (iOS)');
    setShowDeleteModal(true);
  }

  async function confirmDeleteAllData() {
    console.log('User confirmed Delete All Data (iOS)');
    setShowDeleteModal(false);
    try {
      await DataManager.clearAllData();
      Alert.alert('Success', 'All data has been deleted.');
    } catch (err) {
      console.error('Failed to delete data:', err);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  }

  function cancelDeleteAllData() {
    console.log('User cancelled Delete All Data (iOS)');
    setShowDeleteModal(false);
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getPlanName(productId: string | null | undefined): string {
    if (!productId) return 'Premium';
    if (productId.includes('monthly')) return 'Monthly';
    if (productId.includes('annual')) return 'Annual';
    if (productId.includes('lifetime')) return 'Lifetime';
    return 'Premium';
  }

  function getPlanPrice(productId: string | null | undefined): string {
    if (!productId) return '';
    if (productId.includes('monthly')) return '$1.49/mo';
    if (productId.includes('annual')) return '$9.99/yr';
    if (productId.includes('lifetime')) return '$89.99';
    return '';
  }

  function isLifetime(productId: string | null | undefined): boolean {
    if (!productId) return false;
    return productId.includes('lifetime');
  }
}

function SubscribedView({
  productId,
  expirationDate,
  onManage,
}: {
  productId?: string | null;
  expirationDate?: Date | null;
  onManage: () => void;
}) {
  const planName = getPlanName(productId);
  const planPrice = getPlanPrice(productId);
  const isLifetimePlan = isLifetime(productId);
  const formattedDate = formatDate(expirationDate);

  return (
    <View style={styles.subscribedCard}>
      <View style={styles.premiumBadge}>
        <IconSymbol
          ios_icon_name="crown.fill"
          android_material_icon_name="star"
          size={18}
          color="#FFD700"
        />
        <Text style={styles.badgeText}>Premium Active</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {planName}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {planPrice}
          </Text>
        </View>
        {!isLifetimePlan && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {formattedDate}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.manageButton} onPress={onManage}>
        <Text style={styles.manageText}>Manage Subscription</Text>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="arrow-forward"
          size={14}
          color="#007AFF"
        />
      </TouchableOpacity>
    </View>
  );

  function getPlanName(productId: string | null | undefined): string {
    if (!productId) return 'Premium';
    if (productId.includes('monthly')) return 'Monthly';
    if (productId.includes('annual')) return 'Annual';
    if (productId.includes('lifetime')) return 'Lifetime';
    return 'Premium';
  }

  function getPlanPrice(productId: string | null | undefined): string {
    if (!productId) return '';
    if (productId.includes('monthly')) return '$1.49/mo';
    if (productId.includes('annual')) return '$9.99/yr';
    if (productId.includes('lifetime')) return '$89.99';
    return '';
  }

  function isLifetime(productId: string | null | undefined): boolean {
    if (!productId) return false;
    return productId.includes('lifetime');
  }

  function formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

function FreeUserView({
  onUpgrade,
  onRestore,
}: {
  onUpgrade: () => void;
  onRestore: () => void;
}) {
  return (
    <View style={styles.freeCard}>
      <IconSymbol
        ios_icon_name="star.fill"
        android_material_icon_name="star"
        size={32}
        color="#FFD700"
      />
      <Text style={styles.freeTitle}>Upgrade to Premium</Text>
      <Text style={styles.freeDesc}>
        Unlimited history, advanced insights, data export
      </Text>

      <View style={styles.priceRow}>
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Monthly</Text>
          <Text style={styles.priceAmount}>$1.49</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Annual</Text>
          <Text style={styles.priceAmount}>$9.99</Text>
          <Text style={styles.priceSave}>Save 44%</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
        <Text style={styles.upgradeBtnText}>View Plans</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreBtn} onPress={onRestore}>
        <Text style={styles.restoreBtnText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}
