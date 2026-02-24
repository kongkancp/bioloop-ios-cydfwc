
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { SubscriptionProduct } from '@/types/subscription';
import { Stack, useRouter } from 'expo-router';
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
import { useSubscription } from '@/hooks/useSubscription';
import DataManager from '@/services/DataManager';
import RestoreButton from '@/components/RestoreButton';
import HealthKitManager from '@/services/HealthKitManager';
import MockDataGenerator from '@/services/MockDataGenerator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  rowChevron: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
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
  subscribedCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  manageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  freeCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  freeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  freeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
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
  devSection: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  devHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 12,
  },
  devDescription: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  mockModeButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  mockModeButtonDisabled: {
    backgroundColor: '#6C757D',
  },
  mockModeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateDataButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mockModeStatus: {
    fontSize: 14,
    color: '#856404',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});

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
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isLifetime(productId: string | null | undefined): boolean {
  return productId?.includes('lifetime') ?? false;
}

function openAppStore(): void {
  Linking.openURL('https://apps.apple.com/account/subscriptions');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { status, loading, error, refetch } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mockModeEnabled, setMockModeEnabled] = useState(false);
  const [isTogglingMock, setIsTogglingMock] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  useEffect(() => {
    checkMockMode();
  }, []);

  async function checkMockMode() {
    const enabled = await HealthKitManager.isMockModeEnabled();
    setMockModeEnabled(enabled);
  }

  function handleEditProfile() {
    console.log('User tapped Edit Profile');
    router.push('/edit-profile');
  }

  function handleUpgradeToPremium() {
    console.log('User tapped Upgrade to Premium');
    router.push('/subscription-onboarding');
  }

  function handleManageSubscription() {
    console.log('User tapped Manage Subscription');
    openAppStore();
  }

  function handleHealthKitPermissions() {
    console.log('User tapped HealthKit Permissions');
    Alert.alert(
      'HealthKit Permissions',
      'To modify HealthKit permissions, please go to Settings > Health > Data Access & Devices > BioLoop',
      [{ text: 'OK' }]
    );
  }

  function handleMetricsGuide() {
    console.log('User tapped Metrics Guide');
    router.push('/metrics-glossary');
  }

  function handlePrivacyLink() {
    console.log('User tapped Privacy Policy');
    Linking.openURL('https://bioloop.app/privacy');
  }

  function handleTermsLink() {
    console.log('User tapped Terms of Service');
    Linking.openURL('https://bioloop.app/terms');
  }

  function handleDeleteAllData() {
    console.log('User tapped Delete All Data');
    setShowDeleteModal(true);
  }

  async function confirmDeleteAllData() {
    console.log('User confirmed Delete All Data');
    setShowDeleteModal(false);
    
    try {
      await DataManager.clearAllData();
      Alert.alert(
        'Success',
        'All data has been deleted. The app will now restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/onboarding');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to delete data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  }

  function cancelDeleteAllData() {
    console.log('User cancelled Delete All Data');
    setShowDeleteModal(false);
  }

  async function handleToggleMockMode() {
    if (isTogglingMock) return;
    
    console.log('User toggling mock mode');
    setIsTogglingMock(true);
    
    try {
      if (mockModeEnabled) {
        await HealthKitManager.disableMockMode();
        setMockModeEnabled(false);
        Alert.alert(
          'Mock Mode Disabled',
          'Real HealthKit data will be used (if permissions are granted).',
          [{ text: 'OK' }]
        );
      } else {
        await HealthKitManager.enableMockMode();
        setMockModeEnabled(true);
        Alert.alert(
          'Mock Mode Enabled',
          'Simulated health data will be used. Perfect for App Store review!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to toggle mock mode:', error);
      Alert.alert('Error', 'Failed to toggle mock mode. Please try again.');
    } finally {
      setIsTogglingMock(false);
    }
  }

  async function handleGenerateMockData() {
    if (isGeneratingData) return;
    
    console.log('User generating mock data');
    setIsGeneratingData(true);
    
    try {
      await MockDataGenerator.generateAllData();
      Alert.alert(
        'Success',
        '30 days of realistic health data has been generated! Pull to refresh on the Home screen to see it.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to generate mock data:', error);
      Alert.alert('Error', 'Failed to generate mock data. Please try again.');
    } finally {
      setIsGeneratingData(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
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
      </View>
    );
  }

  const isSubscribed = status?.isSubscribed ?? false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerLargeTitle: true,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Developer Tools Section */}
        <View style={styles.devSection}>
          <Text style={styles.devHeader}>🧪 App Review Mode</Text>
          <Text style={styles.devDescription}>
            Enable mock mode to simulate HealthKit permissions being granted. Perfect for App Store review!
          </Text>
          
          <TouchableOpacity
            style={[
              styles.mockModeButton,
              mockModeEnabled && styles.mockModeButtonDisabled,
            ]}
            onPress={handleToggleMockMode}
            disabled={isTogglingMock}
          >
            {isTogglingMock ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.mockModeButtonText}>
                {mockModeEnabled ? '✓ Mock Mode Enabled' : 'Enable Mock Mode'}
              </Text>
            )}
          </TouchableOpacity>

          {mockModeEnabled && (
            <>
              <TouchableOpacity
                style={styles.generateDataButton}
                onPress={handleGenerateMockData}
                disabled={isGeneratingData}
              >
                {isGeneratingData ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.mockModeButtonText}>Generate 30 Days of Data</Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.mockModeStatus}>
                Mock permissions are active. The app will show simulated health data.
              </Text>
            </>
          )}
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
            <FreeUserView onUpgrade={handleUpgradeToPremium} />
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          
          <TouchableOpacity style={styles.row} onPress={handleEditProfile}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="person.circle"
                android_material_icon_name="person"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Edit Profile</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.lastRow]} onPress={handleHealthKitPermissions}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="heart.text.square"
                android_material_icon_name="favorite"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>HealthKit Permissions</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Help</Text>
          
          <TouchableOpacity style={styles.row} onPress={handleMetricsGuide}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="book"
                android_material_icon_name="menu-open"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Metrics Glossary</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={handlePrivacyLink}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="lock.shield"
                android_material_icon_name="lock"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Privacy Policy</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, styles.lastRow]} onPress={handleTermsLink}>
            <View style={styles.rowLeft}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
                style={styles.rowIcon}
              />
              <Text style={styles.rowText}>Terms of Service</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="arrow-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.rowChevron}
            />
          </TouchableOpacity>
        </View>

        {/* Delete Data Button */}
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
                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDeleteAllData}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Delete
                </Text>
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
  const lifetime = isLifetime(productId);
  const planName = getPlanName(productId);
  const planPrice = getPlanPrice(productId);
  const expirationText = formatDate(expirationDate);

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
        {!lifetime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {expirationText}
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

function FreeUserView({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View style={styles.freeCard}>
      <Text style={styles.freeTitle}>Free Plan</Text>
      <Text style={styles.freeDescription}>
        Upgrade to Premium to unlock advanced analytics, longevity insights, and unlimited history.
      </Text>
      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
      </TouchableOpacity>
    </View>
  );
}
