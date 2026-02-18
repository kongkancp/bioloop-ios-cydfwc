
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeContent() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.spacer} />
        
        <View style={styles.iconWrapper}>
          <LinearGradient
            colors={['#0066FF', '#00D4FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCircle}
          >
            <IconSymbol
              ios_icon_name="waveform.path.ecg"
              android_material_icon_name="favorite"
              size={50}
              color="#FFFFFF"
            />
          </LinearGradient>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to BioLoop</Text>
          <Text style={styles.subtitle}>Your Health Analytics Platform</Text>
        </View>

        <View style={styles.spacer} />

        <Text style={styles.swipeText}>Swipe to learn more →</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  spacer: {
    flex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  swipeText: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingBottom: 40,
  },
});
