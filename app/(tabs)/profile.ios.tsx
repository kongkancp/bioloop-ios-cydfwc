
import { colors } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { Stack, useRouter } from 'expo-router';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionProduct } from '@/types/subscription';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  premiumBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  subscriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  subscriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  button: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
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
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
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
});

export default function ProfileScreen() {
  const router = useRouter();
  const { isSubscribed, currentSubscription } = useSubscription();
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const handleEditProfile = () => {
    console.log('ProfileScreen: User tapped Edit Profile');
  };

  const handleHealthKitPermissions = () => {
    console.log('ProfileScreen: User tapped HealthKit Permissions');
    setShowPermissionsModal(true);
  };

  const handleExportData = () => {
    console.log('ProfileScreen: User tapped Export Data');
  };

  const handleUpgradeToPremium = () => {
    console.log('ProfileScreen: User tapped Upgrade to Premium');
    router.push('/subscription');
  };

  const closeModal = () => {
    setShowPermissionsModal(false);
  };

  const userName = 'John Doe';
  const userEmail = 'john.doe@example.com';
  const userInitials = 'JD';
  const dateOfBirth = 'January 15, 1992';
  const height = '180 cm';
  const weight = '75 kg';

  const subscriptionActive = isSubscribed;
  const subscriptionPlanName = currentSubscription === SubscriptionProduct.MONTHLY ? 'Monthly' : 'Annual';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
          {subscriptionActive && (
            <View style={styles.premiumBadge}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={14} color="#FFFFFF" />
              <Text style={styles.premiumBadgeText}>Premium Member</Text>
            </View>
          )}
        </View>

        {!subscriptionActive && (
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <IconSymbol ios_icon_name="star.fill" android_material_icon_name="star" size={24} color={colors.primary} />
              <Text style={styles.subscriptionTitle}>Upgrade to Premium</Text>
            </View>
            <Text style={styles.subscriptionText}>
              Unlock unlimited history, advanced analytics, and export your data. Start your premium experience today!
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPremium}>
              <Text style={styles.upgradeButtonText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        )}

        {subscriptionActive && (
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <IconSymbol ios_icon_name="checkmark.circle.fill" android_material_icon_name="check-circle" size={24} color="#34C759" />
              <Text style={styles.subscriptionTitle}>Premium Active</Text>
            </View>
            <Text style={styles.subscriptionText}>
              You have full access to all premium features. Current plan: {subscriptionPlanName}
            </Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPremium}>
              <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol ios_icon_name="calendar" android_material_icon_name="calendar-today" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{dateOfBirth}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol ios_icon_name="ruler" android_material_icon_name="straighten" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{height}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={styles.infoIcon}>
              <IconSymbol ios_icon_name="scalemass" android_material_icon_name="monitor-weight" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{weight}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonIcon}>
              <IconSymbol ios_icon_name="pencil" android_material_icon_name="edit" size={18} color={colors.primary} />
            </View>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </View>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleHealthKitPermissions}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonIcon}>
              <IconSymbol ios_icon_name="heart.text.square" android_material_icon_name="favorite" size={18} color={colors.primary} />
            </View>
            <Text style={styles.buttonText}>HealthKit Permissions</Text>
          </View>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <View style={styles.buttonContent}>
            <View style={styles.buttonIcon}>
              <IconSymbol ios_icon_name="square.and.arrow.up" android_material_icon_name="upload" size={18} color={colors.primary} />
            </View>
            <Text style={styles.buttonText}>Export Data</Text>
          </View>
          <IconSymbol ios_icon_name="chevron.right" android_material_icon_name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPermissionsModal} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>HealthKit Permissions</Text>
            <Text style={styles.modalText}>
              BioLoop analyzes your heart rate, HRV, sleep, and workout data to calculate your Performance Index and biological age. Your data never leaves your device.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
