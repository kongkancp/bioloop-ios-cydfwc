
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleNext = () => {
    console.log('User tapped Next on Welcome screen');
    router.push('/onboarding/features');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['#0066FF', '#00A3FF']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <IconSymbol
                ios_icon_name="waveform.path.ecg"
                android_material_icon_name="favorite"
                size={80}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.title}>Welcome to BioLoop</Text>
            <Text style={styles.subtitle}>
              Your personal health analytics platform
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="heart.fill"
                  android_material_icon_name="favorite"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.featureText}>Track your vital metrics</Text>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="chart.line.uptrend.xyaxis"
                  android_material_icon_name="show-chart"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.featureText}>Analyze performance trends</Text>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="brain.head.profile"
                  android_material_icon_name="psychology"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.featureText}>Calculate biological age</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <IconSymbol
                ios_icon_name="arrow.right"
                android_material_icon_name="arrow-forward"
                size={20}
                color="#0066FF"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066FF',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 48,
  },
  featureList: {
    width: '100%',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0066FF',
  },
});
