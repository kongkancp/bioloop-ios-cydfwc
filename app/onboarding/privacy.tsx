
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function PrivacyScreen() {
  const router = useRouter();

  const handleNext = () => {
    console.log('User tapped Next on Privacy screen');
    router.push('/onboarding/profile-setup');
  };

  const handleBack = () => {
    console.log('User tapped Back on Privacy screen');
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
            <Text style={styles.headerTitle}>Privacy</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="lock.shield.fill"
                android_material_icon_name="security"
                size={64}
                color="#0066FF"
              />
            </View>

            <Text style={styles.title}>Your Data Stays Private</Text>
            <Text style={styles.subtitle}>
              BioLoop is designed with privacy at its core
            </Text>

            <View style={styles.privacyList}>
              <PrivacyItem
                icon="phone-iphone"
                iosIcon="iphone"
                title="Local Storage Only"
                description="All your health data is stored locally on your device with AES-256 encryption. Nothing is sent to the cloud."
              />

              <PrivacyItem
                icon="cloud-off"
                iosIcon="icloud.slash"
                title="No Cloud Sync"
                description="Your data never leaves your device. No servers, no backups, complete privacy."
              />

              <PrivacyItem
                icon="lock"
                iosIcon="lock.fill"
                title="Encrypted Storage"
                description="All data is encrypted using industry-standard AES-256 encryption for maximum security."
              />

              <PrivacyItem
                icon="visibility-off"
                iosIcon="eye.slash.fill"
                title="No Tracking"
                description="We don't track your usage, collect analytics, or share data with third parties."
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

function PrivacyItem({
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
    <View style={styles.privacyItem}>
      <View style={styles.privacyIconContainer}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={icon}
          size={24}
          color="#0066FF"
        />
      </View>
      <View style={styles.privacyContent}>
        <Text style={styles.privacyTitle}>{title}</Text>
        <Text style={styles.privacyDescription}>{description}</Text>
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
  privacyList: {
    gap: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    gap: 16,
  },
  privacyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  button: {
    backgroundColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
