
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionProduct } from '@/types/subscription';
import DataManager from '@/services/DataManager';
import MockHealthDataGenerator from '@/services/MockHealthDataGenerator';
import SyncManager from '@/services/SyncManager';

export default function ProfileScreen() {
  const router = useRouter();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingMockData, setIsGeneratingMockData] = useState(false);

  const handleEditProfile = () => {
    console.log('ProfileScreen: Navigating to edit profile');
    router.push('/edit-profile');
  };

  const handleUpgradeToPremium = () => {
    console.log('ProfileScreen: Navigating to subscription');
    router.push('/subscription');
  };

  const handleHealthKitPermissions = async () => {
    console.log('ProfileScreen: Opening HealthKit permissions');
    Alert.alert(
      'HealthKit Permissions',
      'To modify HealthKit permissions, go to:\nSettings > Health > Data Access & Devices > BioLoop',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyLink = () => {
    console.log('ProfileScreen: Opening privacy policy');
    Linking.openURL('https://example.com/privacy');
  };

  const handleTermsLink = () => {
    console.log('ProfileScreen: Opening terms of service');
    Linking.openURL('https://example.com/terms');
  };

  const handleDeleteAllData = () => {
    console.log('ProfileScreen: Delete all data requested');
    setShowDeleteModal(true);
  };

  const confirmDeleteAllData = async () => {
    console.log('ProfileScreen: Confirming delete all data');
    setIsDeleting(true);
    
    try {
      await DataManager.deleteAllData();
      console.log('ProfileScreen: All data deleted successfully');
      setShowDeleteModal(false);
      Alert.alert('Success', 'All data has been deleted', [{ text: 'OK' }]);
    } catch (error) {
      console.error('ProfileScreen: Error deleting data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteAllData = () => {
    console.log('ProfileScreen: Delete cancelled');
    setShowDeleteModal(false);
  };

  const handleEnableMockData = async () => {
    console.log('ProfileScreen: Enabling mock data');
    setIsGeneratingMockData(true);

    try {
      await MockHealthDataGenerator.setupMockEnvironment();
      
      // Trigger a sync to calculate all metrics
      await SyncManager.performSync();
      
      Alert.alert(
        'Mock Data Enabled',
        '30 days of realistic health data has been generated. All features are now available!\n\nYou can now:\n• View Performance Index\n• See Activity metrics\n• Check BioAge\n• Explore all features',
        [{ text: 'OK' }]
      );
      
      console.log('ProfileScreen: Mock data setup complete');
    } catch (error) {
      console.error('ProfileScreen: Error setting up mock data:', error);
      Alert.alert('Error', 'Failed to generate mock data. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsGeneratingMockData(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Subscription Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            {subscriptionLoading ? (
              <View style={styles.listItem}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.listItemText}>Loading subscription status...</Text>
              </View>
            ) : isPremium ? (
              <View style={styles.listItem}>
                <IconSymbol
                  ios_icon_name="checkmark.seal.fill"
                  android_material_icon_name="verified"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.listItemText}>Premium Active</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.listItem} onPress={handleUpgradeToPremium}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.listItemText}>Upgrade to Premium</Text>
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Profile Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
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
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handleHealthKitPermissions}>
              <IconSymbol
                ios_icon_name="heart.text.square"
                android_material_icon_name="favorite"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>HealthKit Permissions</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.listItem} 
              onPress={handleEnableMockData}
              disabled={isGeneratingMockData}
            >
              <IconSymbol
                ios_icon_name="wand.and.stars"
                android_material_icon_name="auto-fix-high"
                size={24}
                color={colors.primary}
              />
              {isGeneratingMockData ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 12 }} />
                  <Text style={[styles.listItemText, { color: colors.primary }]}>Generating...</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.listItemText, { color: colors.primary }]}>Enable Mock Data</Text>
                  <IconSymbol
                    ios_icon_name="chevron.right"
                    android_material_icon_name="chevron-right"
                    size={20}
                    color={colors.primary}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            Enable mock data to simulate 30 days of health data and see all features in action
          </Text>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handlePrivacyLink}>
              <IconSymbol
                ios_icon_name="hand.raised"
                android_material_icon_name="privacy-tip"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Privacy Policy</Text>
              <IconSymbol
                ios_icon_name="arrow.up.right"
                android_material_icon_name="open-in-new"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={handleTermsLink}>
              <IconSymbol
                ios_icon_name="doc.text"
                android_material_icon_name="description"
                size={24}
                color={colors.text}
              />
              <Text style={styles.listItemText}>Terms of Service</Text>
              <IconSymbol
                ios_icon_name="arrow.up.right"
                android_material_icon_name="open-in-new"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.listItem} onPress={handleDeleteAllData}>
              <IconSymbol
                ios_icon_name="trash"
                android_material_icon_name="delete"
                size={24}
                color={colors.error}
              />
              <Text style={[styles.listItemText, { color: colors.error }]}>Delete All Data</Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionFooter}>
            This will permanently delete all your health data and cannot be undone
          </Text>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>BioLoop v1.0.0</Text>
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
              This will permanently delete all your health data, metrics, and profile information. This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelDeleteAllData}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteAllData}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextDelete}>Delete</Text>
                )}
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
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionFooter: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  listItemText: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 52,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 13,
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
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
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonDelete: {
    backgroundColor: colors.error,
  },
  modalButtonTextCancel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonTextDelete: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
