
import { SubscriptionProduct } from '@/types/subscription';
import React, { useState } from 'react';
import DataManager from '@/services/DataManager';
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
import { Stack, useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subscriptionDesc: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  premiumDesc: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    paddingVertical: 14,
    borderRadius: 12,
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
});

export default function ProfileScreen() {
  const { isPremium, isLoading, products } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  const handleEditProfile = () => {
    console.log('User tapped Edit Profile');
    router.push('/edit-profile');
  };

  const handleUpgradeToPremium = () => {
    console.log('User tapped Upgrade to Premium');
    router.push('/subscription');
  };

  const handleHealthKitPermissions = () => {
    console.log('User tapped HealthKit Permissions');
    Linking.openURL('app-settings:');
  };

  const handleMetricsGuide = () => {
    console.log('User tapped Metrics Guide');
    router.push('/metrics-glossary');
  };

  const handlePrivacyLink = () => {
    console.log('User tapped Privacy Policy');
    Linking.openURL('https://example.com/privacy');
  };

  const handleTermsLink = () => {
    console.log('User tapped Terms of Service');
    Linking.openURL('https://example.com/terms');
  };

  const handleDeleteAllData = () => {
    console.log('User tapped Delete All Data');
    setShowDeleteModal(true);
  };

  const confirmDeleteAllData = async () => {
    console.log('User confirmed Delete All Data');
    setShowDeleteModal(false);
    try {
      await DataManager.deleteAllData();
      Alert.alert(
        'Success',
        'All data has been deleted. Please restart the app.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    }
  };

  const cancelDeleteAllData = () => {
    console.log('User cancelled Delete All Data');
    setShowDeleteModal(false);
  };

  const loadingIndicator = isLoading;
  const userIsPremium = isPremium;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.section}>
          {loadingIndicator ? (
            <View style={styles.card}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : userIsPremium ? (
            <View style={styles.card}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
              <Text style={styles.premiumTitle}>Premium Member</Text>
              <Text style={styles.premiumDesc}>
                You have access to all premium features
              </Text>
            </View>
          ) : (
            <View style={styles.subscriptionCard}>
              <Text style={styles.subscriptionTitle}>Upgrade to Premium</Text>
              <Text style={styles.subscriptionDesc}>
                Unlock advanced analytics, unlimited history, and more
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToPremium}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account-circle"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Edit Profile</Text>
              <Text style={styles.menuItemSubtitle}>
                Update your personal information
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Data</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHealthKitPermissions}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="heart.text.square.fill"
              android_material_icon_name="favorite"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>HealthKit Permissions</Text>
              <Text style={styles.menuItemSubtitle}>
                Manage data access
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleMetricsGuide}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="book.fill"
              android_material_icon_name="menu-book"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Metrics Guide</Text>
              <Text style={styles.menuItemSubtitle}>
                Learn about all health metrics
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyLink}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="lock.shield.fill"
              android_material_icon_name="privacy-tip"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Privacy Policy</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTermsLink}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="doc.text.fill"
              android_material_icon_name="description"
              size={24}
              color={colors.primary}
            />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Terms of Service</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAllData}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextCancel,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDeleteAllData}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonTextConfirm,
                  ]}
                >
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
