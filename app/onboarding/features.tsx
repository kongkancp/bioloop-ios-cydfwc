
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function FeaturesScreen() {
  const router = useRouter();

  const handleNext = () => {
    console.log('User tapped Next on Features screen');
    router.push('/onboarding/privacy');
  };

  const handleBack = () => {
    console.log('User tapped Back on Features screen');
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
            <Text style={styles.headerTitle}>Features</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>What BioLoop Offers</Text>
            <Text style={styles.subtitle}>
              Comprehensive health analytics powered by your data
            </Text>

            <View style={styles.featuresList}>
              <FeatureCard
                icon="favorite"
                iosIcon="heart.fill"
                title="Performance Index"
                description="Track your daily readiness and performance with a comprehensive score based on HRV, resting heart rate, and recovery metrics."
              />

              <FeatureCard
                icon="show-chart"
                iosIcon="chart.line.uptrend.xyaxis"
                title="Training Load"
                description="Monitor your workout intensity and prevent overtraining with ACWR (Acute:Chronic Workload Ratio) analysis."
              />

              <FeatureCard
                icon="psychology"
                iosIcon="brain.head.profile"
                title="Biological Age"
                description="Calculate your biological age based on cardiovascular fitness, sleep quality, and body composition."
              />

              <FeatureCard
                icon="fitness-center"
                iosIcon="figure.run"
                title="Recovery Efficiency"
                description="Measure how quickly your heart rate recovers after exercise to assess cardiovascular fitness."
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
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

function FeatureCard({
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
    <View style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <IconSymbol
          ios_icon_name={iosIcon}
          android_material_icon_name={icon}
          size={32}
          color="#0066FF"
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
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
