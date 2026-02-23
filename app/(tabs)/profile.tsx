
import { SubscriptionProduct } from '@/types/subscription';
import { Stack, useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { IconSymbol } from '@/components/IconSymbol';
import DataManager from '@/services/DataManager';
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
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { status, loading } = useSubscription();

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
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  }

  async function handleRestorePurchases() {
    console.log('User tapped Restore Purchases button');
    // TODO: Implement restore purchases logic
    Alert.alert('Restore Purchases', 'No purchases found to restore.');
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
    Linking.openURL('https://example.com/privacy');
  }

  function handleTermsLink() {
    console.log('User tapped Terms of Service link');
    Linking.openURL('https://example.com/terms');
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
      Alert.alert('Success', 'All data has been deleted.');
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data.');
    }
  }

  function cancelDeleteAllData() {
    console.log('User cancelled Delete All Data');
    setShowDeleteModal(false);
  }

  function formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function getPlanName(productId: string | undefined): string {
    if (!productId) return 'Premium';
    if (productId.includes('monthly')) return 'Monthly';
    if (productId.includes('annual')) return 'Annual';
    if (productId.includes('lifetime')) return 'Lifetime';
    return 'Premium';
  }

  function getPlanPrice(productId: string | undefined): string {
    if (!productId) return '';
    if (productId.includes('monthly')) return '$1.49/mo';
    if (productId.includes('annual')) return '$9.99/yr';
    if (productId.includes('lifetime')) return '$89.99';
    return '';
  }

  function isLifetime(productId: string | undefined): boolean {
    return productId?.includes('lifetime') || false;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerStyle: { backgroundColor: colors.bgPrimary },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.scrollView}>
        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Subscription</Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.accentBlue} />
          ) : status.isSubscribed ? (
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
                    {getPlanName(status.productId)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {getPlanPrice(status.productId)}
                  </Text>
                </View>
                {!isLifetime(status.productId) && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Billing</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {formatDate(status.expirationDate)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManageSubscription}
              >
                <Text style={styles.manageText}>Manage Subscription</Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="arrow-forward"
                  size={14}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.freeCard}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color="#FFD700"
                style={{ marginBottom: 12 }}
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

              <TouchableOpacity
                style={styles.upgradeBtn}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.upgradeBtnText}>View Plans</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={handleRestorePurchases}
              >
                <Text style={styles.restoreBtnText}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Profile</Text>
          <TouchableOpacity style={styles.listItem} onPress={handleEditProfile}>
            <IconSymbol
              ios_icon_name="person.circle"
              android_material_icon_name="person"
              size={24}
              color={colors.text}
            />
            <Text style={styles.listItemText}>Edit Profile</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Settings</Text>
          <TouchableOpacity
            style={styles.listItem}
            onPress={handleHealthKitPermissions}
          >
            <IconSymbol
              ios_icon_name="heart.text.square"
              android_material_icon_name="favorite"
              size={24}
              color={colors.text}
            />
            <Text style={styles.listItemText}>HealthKit Permissions</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={handleMetricsGuide}>
            <IconSymbol
              ios_icon_name="book"
              android_material_icon_name="menu-open"
              size={24}
              color={colors.text}
            />
            <Text style={styles.listItemText}>Metrics Guide</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Legal</Text>
          <TouchableOpacity style={styles.listItem} onPress={handlePrivacyLink}>
            <IconSymbol
              ios_icon_name="lock.shield"
              android_material_icon_name="lock"
              size={24}
              color={colors.text}
            />
            <Text style={styles.listItemText}>Privacy Policy</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={handleTermsLink}>
            <IconSymbol
              ios_icon_name="doc.text"
              android_material_icon_name="description"
              size={24}
              color={colors.text}
            />
            <Text style={styles.listItemText}>Terms of Service</Text>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Danger Zone</Text>
          <TouchableOpacity
            style={[styles.listItem, styles.dangerItem]}
            onPress={handleDeleteAllData}
          >
            <IconSymbol
              ios_icon_name="trash"
              android_material_icon_name="delete"
              size={24}
              color="#FF3B30"
            />
            <Text style={[styles.listItemText, styles.dangerText]}>
              Delete All Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
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
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDeleteAllData}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteAllData}
              >
                <Text style={styles.modalButtonTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  // Profile Section
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  // Subscribed
  subscribedCard: {
    padding: 16,
    backgroundColor: '#F5F5F7',
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
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'right',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  manageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  // Free User
  freeCard: {
    padding: 20,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    alignItems: 'center',
  },
  freeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  freeDesc: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  priceLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
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
  // List Items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 20,
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
    backgroundColor: '#F5F5F7',
  },
  modalButtonDelete: {
    backgroundColor: '#FF3B30',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
