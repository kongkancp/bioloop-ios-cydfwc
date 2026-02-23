
import DataManager from '@/services/DataManager';
import { IconSymbol } from '@/components/IconSymbol';
import { SubscriptionProduct } from '@/types/subscription';
import { useSubscription } from '@/hooks/useSubscription';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';

// Safe helper functions for SubscribedView
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

function formatDate(date: Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

function isLifetime(productId: string | null | undefined): boolean {
  return productId?.includes('lifetime') ?? false;
}

function openAppStore() {
  const url = Platform.select({
    ios: 'https://apps.apple.com/account/subscriptions',
    android: 'https://play.google.com/store/account/subscriptions',
    default: 'https://apps.apple.com/account/subscriptions',
  });
  Linking.openURL(url);
}

export default function ProfileScreen() {
  const { status, loading, error, refetch } = useSubscription();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
        <IconSymbol
          ios_icon_name="exclamationmark.triangle"
          android_material_icon_name="warning"
          size={48}
          color="#FF3B30"
        />
        <Text style={styles.errorText}>Failed to load subscription</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSubscribed = status?.isSubscribed ?? false;

  function handleEditProfile() {
    console.log('User tapped Edit Profile button');
    router.push('/edit-profile');
  }

  function handleUpgradeToPremium() {
    console.log('User tapped Upgrade to Premium button');
    router.push('/subscription-onboarding');
  }

  function handleManageSubscription() {
    console.log('User tapped Manage Subscription button');
    openAppStore();
  }

  async function handleRestorePurchases() {
    console.log('User tapped Restore Purchases button');
    try {
      await refetch();
      Alert.alert('Success', 'Purchases restored successfully');
    } catch (err) {
      console.error('Failed to restore purchases:', err);
      Alert.alert('Error', 'Failed to restore purchases');
    }
  }

  function handleHealthKitPermissions() {
    console.log('User tapped HealthKit Permissions button');
    router.push('/onboarding/healthkit-permission');
  }

  function handleMetricsGuide() {
    console.log('User tapped Metrics Guide button');
    router.push('/metrics-glossary');
  }

  function handlePrivacyLink() {
    console.log('User tapped Privacy Policy link');
    Linking.openURL('https://bioloop.app/privacy');
  }

  function handleTermsLink() {
    console.log('User tapped Terms of Service link');
    Linking.openURL('https://bioloop.app/terms');
  }

  function handleDeleteAllData() {
    console.log('User tapped Delete All Data button');
    setShowDeleteModal(true);
  }

  async function confirmDeleteAllData() {
    console.log('User confirmed Delete All Data');
    setShowDeleteModal(false);
    try {
      await DataManager.clearAllData();
      Alert.alert('Success', 'All data has been deleted');
    } catch (err) {
      console.error('Failed to delete data:', err);
      Alert.alert('Error', 'Failed to delete data');
    }
  }

  function cancelDeleteAllData() {
    console.log('User cancelled Delete All Data');
    setShowDeleteModal(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
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
          <TouchableOpacity style={styles.settingRow} onPress={handleEditProfile}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="person"
              size={24}
              color={colors.text}
            />
            <Text style={styles.settingText}>Edit Profile</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleHealthKitPermissions}
          >
            <IconSymbol
              ios_icon_name="heart.text.square"
              android_material_icon_name="favorite"
              size={24}
              color={colors.text}
            />
            <Text style={styles.settingText}>HealthKit Permissions</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleMetricsGuide}>
            <IconSymbol
              ios_icon_name="book"
              android_material_icon_name="description"
              size={24}
              color={colors.text}
            />
            <Text style={styles.settingText}>Metrics Guide</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About</Text>
          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacyLink}>
            <IconSymbol
              ios_icon_name="lock.shield"
              android_material_icon_name="lock"
              size={24}
              color={colors.text}
            />
            <Text style={styles.settingText}>Privacy Policy</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleTermsLink}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={24}
              color={colors.text}
            />
            <Text style={styles.settingText}>Terms of Service</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={handleDeleteAllData}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={24}
              color="#FF3B30"
            />
            <Text style={styles.dangerText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>BioLoop v1.0.0</Text>
        </View>
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
              This will permanently delete all your health data, metrics, and
              settings. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={cancelDeleteAllData}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDelete}
                onPress={confirmDeleteAllData}
              >
                <Text style={styles.modalButtonDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
  const lifetime = isLifetime(productId);
  const nextBilling = formatDate(expirationDate);

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

        {!lifetime && expirationDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {nextBilling}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.manageButton} onPress={onManage}>
        <Text style={styles.manageText}>Manage</Text>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="arrow-forward"
          size={14}
          color="#007AFF"
        />
      </TouchableOpacity>
    </View>
  );
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
      <Text style={styles.freeTitle}>Unlock Premium</Text>
      <Text style={styles.freeDesc}>
        Get advanced analytics, biological age tracking, and personalized insights
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
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerText: {
    flex: 1,
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonDelete: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  modalButtonDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
