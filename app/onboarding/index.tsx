
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import WelcomeContent from './welcome-content';
import FeaturesContent from './features-content';

const { width } = Dimensions.get('window');

export default function OnboardingFlow() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    if (page !== currentPage) {
      setCurrentPage(page);
      console.log('Onboarding page changed to:', page);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.container}
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: width,
    flex: 1,
  },
  pageIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 60 : 80,
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
});
