
import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="features" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="healthkit-permission" />
    </Stack>
  );
}
