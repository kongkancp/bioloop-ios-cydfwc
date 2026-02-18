
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useAppState } from '@/contexts/AppStateContext';
import HealthKitManager from '@/services/HealthKitManager';

export default function HealthKitPermissionScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAppState();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    console.log('User tapped Request HealthKit Permission');
    setIsRequesting(true);

    try {
      const authorized = await HealthKitManager.requestAuthorization();
      console.log('HealthKit authorization result:', authorized);

      if (authorized) {
        console.log('HealthKit permissions granted, completing onboarding');
        await completeOnboarding();
        router.replace('/(tabs)/(home)/');
      } else {
        console.log('HealthKit permissions denied, but continuing to app');
        await completeOnboarding();
        router.replace('/(tabs)/(home)/');
      }
    } catch (error) {
      console.error('Error requesting HealthKit permissions:', error);
      await completeOnboarding();
      router.replace('/(tabs)/(home)/');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = async () => {
    console.log('User tapped Skip HealthKit Permission');
    await completeOnboarding();
    router.replace('/(tabs)/(home)/');
  };

  const handleBack = () => {
    console.log('User tapped Back on HealthKit Permission screen');
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                ios_icon_name="chevron.left"
                android_material_icon_name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Permissions</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="heart.text.square.fill"
                android_material_icon_name="favorite"
                size={64}
                color="#FF2D55"
              />
            </View>

            <Text style={styles.title}>Connect to Health Data</Text>
            <Text style={styles.subtitle}>
              BioLoop needs access to your health data to calculate metrics
            </Text>

            <View style={styles.permissionsList}>
              <PermissionItem
                icon="favorite"
                iosIcon="heart.fill"
                title="Heart Rate & HRV"
                description="Track cardiovascular health and recovery"
              />

              <PermissionItem
                icon="bedtime"
                iosIcon="bed.double.fill"
                title="Sleep Analysis"
                description="Monitor sleep duration and quality"
              />

              <PermissionItem
                icon="fitness-center"
                iosIcon="figure.run"
                title="Workouts"
                description="Analyze training load and recovery"
              />

              <PermissionItem
                icon="monitor-weight"
                iosIcon="scalemass.fill"
                title="Body Measurements"
                description="Calculate BMI and body composition"
              />
            </View>

            <View style={styles.privacyNote}>
              <IconSymbol
                ios_icon_name="lock.shield.fill"
                android_material_icon_name="security"
                size={20}
                color="#0066FF"
              />
              <Text style={styles.privacyText}>
                Your data never leaves your device. All processing happens locally.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Grant Access</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
            disabled={isRequesting}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

function PermissionItem({
  icon,
  iosIcon,
  title,
  description,
}: {
  icon: string;
  iosIcon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.permissionItem}>
      <View style={styles.permissionIconContainer}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={icon}
          size={24}
          color="#0066FF"
        />
      </View>
      <View style={styles.permissionContent}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionsList: {
    gap: 16,
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    gap: 16,
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    padding: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
    gap: 12,
  },
  button: {
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 52,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
