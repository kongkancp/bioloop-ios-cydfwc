
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import WelcomeContent from './welcome-content';
import FeaturesContent from './features-content';

const { width } = Dimensions.get('window');

export default function OnboardingFlow() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    if (page !== currentPage) {
      setCurrentPage(page);
      console.log('Onboarding page changed to:', page);
    }
  };

  const handleGetStarted = () => {
    console.log('User tapped Get Started button');
    router.push('/onboarding/privacy');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          <View style={styles.page}>
            <WelcomeContent />
          </View>
          <View style={styles.page}>
            <FeaturesContent />
          </View>
        </ScrollView>

        {/* Page indicator dots */}
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, currentPage === 0 && styles.activeDot]} />
          <View style={[styles.dot, currentPage === 1 && styles.activeDot]} />
        </View>

        {/* Get Started Button (only on last page) */}
        {currentPage === 1 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 140 : 160,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#0066FF',
    width: 24,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 60 : 80,
    left: 32,
    right: 32,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
