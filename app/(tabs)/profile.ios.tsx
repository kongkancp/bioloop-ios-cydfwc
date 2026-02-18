
import { colors } from '@/styles/commonStyles';
import { useSubscription } from '@/hooks/useSubscription';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState } from 'react';
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
import DataManager from '@/services/DataManager';
import { SubscriptionProduct } from '@/types/subscription';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionFooter: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowIcon: {
    marginLeft: 8,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  crownIcon: {
    marginLeft: 12,
  },
  upgradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkText: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.primary,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  deleteText: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.error,
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
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonCancel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonDelete: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonDeleteText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  editRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editRowText: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.text,
  },
});

export default function ProfileScreen() {
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditProfile = () => {
    console.log('ProfileScreen: User tapped Edit Profile');
    router.push('/edit-profile');
  };

  const handleUpgradeToPremium = () => {
    console.log('ProfileScreen: User tapped Upgrade to Premium');
    router.push('/subscription');
  };

  const handleHealthKitPermissions = () => {
    console.log('ProfileScreen: User tapped HealthKit Permissions');
    Linking.openURL('x-apple-health://');
  };

  const handlePrivacyLink = () => {
    console.log('ProfileScreen: User tapped Privacy link');
    Linking.openURL('https://bioloop.app/privacy');
  };

  const handleTermsLink = () => {
    console.log('ProfileScreen: User tapped Terms link');
    Linking.openURL('https://bioloop.app/terms');
  };

  const handleDeleteAllData = () => {
    console.log('ProfileScreen: User tapped Delete All Data');
    setShowDeleteModal(true);
  };

  const confirmDeleteAllData = async () => {
    console.log('ProfileScreen: User confirmed Delete All Data');
    setIsDeleting(true);

    try {
      // Delete all local data
      await DataManager.deleteAllData();
      
      setShowDeleteModal(false);
      setIsDeleting(false);

      // Show success message
      setTimeout(() => {
        Alert.alert(
          'Data Deleted',
          'All your data has been permanently deleted from BioLoop.',
          [{ text: 'OK' }]
        );
      }, 300);

      console.log('ProfileScreen: Data deletion successful');
    } catch (error) {
      console.error('ProfileScreen: Data deletion failed', error);
      setIsDeleting(false);
      setShowDeleteModal(false);

      setTimeout(() => {
        Alert.alert(
          'Deletion Failed',
          'There was an error deleting your data. Please try again.',
          [{ text: 'OK' }]
        );
      }, 300);
    }
  };

  const cancelDeleteAllData = () => {
    console.log('ProfileScreen: User cancelled Delete All Data');
    setShowDeleteModal(false);
  };

  const subscriptionActive = isSubscribed;
  const subscriptionStatusText = 'Active';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Profile</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.editRow} onPress={handleEditProfile}>
            <View style={styles.editRowContent}>
              <IconSymbol
                ios_icon_name="person.circle.fill"
                android_material_icon_name="account-circle"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.editRowText}>Edit Profile</Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Subscription</Text>
        <View style={styles.card}>
          {subscriptionActive ? (
            <View style={styles.premiumRow}>
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>Premium</Text>
                <Text style={styles.premiumSubtitle}>{subscriptionStatusText}</Text>
              </View>
              <View style={styles.crownIcon}>
                <IconSymbol 
                  ios_icon_name="crown.fill" 
                  android_material_icon_name="star" 
                  size={24} 
                  color="#FFD700" 
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeRow} onPress={handleUpgradeToPremium}>
              <View style={styles.upgradeContent}>
                <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeSubtitle}>Unlock all features</Text>
              </View>
              <View style={styles.chevronIcon}>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron-right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionHeader}>Health Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={handleHealthKitPermissions}>
            <Text style={styles.rowTitle}>HealthKit Permissions</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={handlePrivacyLink}>
            <Text style={styles.linkText}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.linkRow, styles.rowLast]} onPress={handleTermsLink}>
            <Text style={styles.linkText}>Terms</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <TouchableOpacity 
            style={[styles.deleteRow, styles.rowLast]} 
            onPress={handleDeleteAllData}
            disabled={isDeleting}
          >
            <Text style={styles.deleteText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionFooter}>Permanent deletion.</Text>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={cancelDeleteAllData}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete All Data?</Text>
            <Text style={styles.modalText}>
              This will permanently delete all your health data, metrics, and history from BioLoop. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonDelete} 
                onPress={confirmDeleteAllData}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.modalButtonDeleteText}>Deleting...</Text>
                  </>
                ) : (
                  <Text style={styles.modalButtonDeleteText}>Delete All Data</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonCancel} 
                onPress={cancelDeleteAllData}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
