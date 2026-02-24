
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useSubscription } from '@/hooks/useSubscription';
import { colors } from '@/styles/commonStyles';

interface RestoreButtonProps {
  variant?: 'primary' | 'secondary';
  onRestoreComplete?: () => void;
}

function getPlanName(productId?: string | null): string {
  if (!productId) return 'Premium';
  if (productId.includes('monthly')) return 'Monthly Premium';
  if (productId.includes('annual')) return 'Annual Premium';
  if (productId.includes('lifetime')) return 'Lifetime';
  return 'Premium';
}

export default function RestoreButton({
  variant = 'secondary',
  onRestoreComplete,
}: RestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoRestoreModal, setShowNoRestoreModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [restoredPlan, setRestoredPlan] = useState<string>('');
  const { refetch, status } = useSubscription();
  const router = useRouter();

  async function handleRestore() {
    if (isRestoring) return; // Prevent double tap

    console.log('User tapped Restore Purchases button');
    setIsRestoring(true);

    try {
      // Trigger refetch to check for purchases
      await refetch();

      // Check if subscription was restored
      const isSubscribed = status?.isSubscribed ?? false;
      const productId = status?.currentSubscription;

      if (isSubscribed && productId) {
        // Success - subscription found
        const planName = getPlanName(productId);
        setRestoredPlan(planName);
        setShowSuccessModal(true);
        console.log('✓ Restore successful:', planName);
      } else {
        // No purchases found
        setShowNoRestoreModal(true);
        console.log('No purchases to restore');
      }
    } catch (error) {
      // Error occurred
      console.error('Restore error:', error);
      setShowErrorModal(true);
    } finally {
      setIsRestoring(false);
    }
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    if (onRestoreComplete) {
      onRestoreComplete();
    } else {
      router.back();
    }
  }

  function handleNoRestoreClose() {
    setShowNoRestoreModal(false);
  }

  function handleErrorClose() {
    setShowErrorModal(false);
  }

  const isPrimary = variant === 'primary';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.restoreButton,
          isPrimary && styles.restoreButtonPrimary,
          isRestoring && styles.restoreButtonDisabled,
        ]}
        onPress={handleRestore}
        disabled={isRestoring}
      >
        {isRestoring ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? '#FFFFFF' : '#007AFF'}
          />
        ) : (
          <Text
            style={[
              styles.restoreText,
              isPrimary && styles.restoreTextPrimary,
            ]}
          >
            Restore Purchases
          </Text>
        )}
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
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
              Your {restoredPlan} subscription has been restored
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* No Purchases Modal */}
      <Modal
        visible={showNoRestoreModal}
        transparent
        animationType="fade"
        onRequestClose={handleNoRestoreClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={64}
              color="#007AFF"
            />
            <Text style={styles.modalTitle}>No Purchases Found</Text>
            <Text style={styles.modalMessage}>
              We couldn&apos;t find any purchases to restore.{'\n\n'}If you
              recently purchased, please wait a moment and try again.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleNoRestoreClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={handleErrorClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={64}
              color="#FF3B30"
            />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>
              Failed to restore purchases. Please check your connection and try
              again.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleErrorClose}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  restoreButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  restoreButtonPrimary: {
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingVertical: 14,
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
  restoreText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  restoreTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
  },
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
    lineHeight: 22,
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
