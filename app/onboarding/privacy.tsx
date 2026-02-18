
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Hero Icon */}
            <View style={styles.heroIconContainer}>
              <IconSymbol
                ios_icon_name="hand.raised.fill"
                android_material_icon_name="back-hand"
                size={80}
                color="#0066FF"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>Your Privacy Matters</Text>

            {/* Privacy Points */}
            <View style={styles.privacyPointsContainer}>
              <PrivacyPoint
                icon="phone-iphone"
                iosIcon="iphone"
                text="All data stays on your device"
              />
              <PrivacyPoint
                icon="cloud-off"
                iosIcon="xmark.shield"
                text="No cloud sync or uploads"
              />
              <PrivacyPoint
                icon="lock"
                iosIcon="lock.fill"
                text="AES-256 encryption"
              />
              <PrivacyPoint
                icon="visibility-off"
                iosIcon="eye.slash.fill"
                text="No tracking or ads"
              />
            </View>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Swipe Instruction */}
            <Text style={styles.swipeText}>Swipe to set up profile →</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

interface PrivacyPointProps {
  icon: string;
  iosIcon: string;
  text: string;
}

function PrivacyPoint({ icon, iosIcon, text }: PrivacyPointProps) {
  return (
    <View style={styles.privacyPointRow}>
      <View style={styles.iconWrapper}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={icon}
          size={24}
          color="#34C759"
        />
      </View>
      <Text style={styles.privacyPointText}>{text}</Text>
      <View style={styles.spacerRight} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroIconContainer: {
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  privacyPointsContainer: {
    width: '100%',
    gap: 20,
  },
  privacyPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyPointText: {
    fontSize: 17,
    color: colors.text,
    flex: 1,
  },
  spacerRight: {
    width: 0,
  },
  spacer: {
    flex: 1,
  },
  swipeText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
});
