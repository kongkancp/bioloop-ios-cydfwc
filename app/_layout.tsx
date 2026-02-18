
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert, ActivityIndicator, View } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AppStateProvider, useAppState } from "@/contexts/AppStateContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const router = useRouter();
  const segments = useSegments();
  const { isOnboardingComplete, isLoading } = useAppState();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  useEffect(() => {
    if (isLoading || !loaded) {
      return;
    }

    const inOnboarding = segments[0] === 'onboarding';

    console.log('Navigation check - isOnboardingComplete:', isOnboardingComplete, 'inOnboarding:', inOnboarding);

    if (!isOnboardingComplete && !inOnboarding) {
      console.log('Redirecting to onboarding');
      router.replace('/onboarding/welcome');
    } else if (isOnboardingComplete && inOnboarding) {
      console.log('Redirecting to main app');
      router.replace('/(tabs)/(home)/');
    }
  }, [isOnboardingComplete, isLoading, loaded, segments]);

  if (!loaded || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(0, 122, 255)",
      background: "rgb(242, 242, 247)",
      card: "rgb(255, 255, 255)",
      text: "rgb(0, 0, 0)",
      border: "rgb(216, 216, 220)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(10, 132, 255)",
      background: "rgb(1, 1, 1)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <WidgetProvider>
          <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding/welcome" />
              <Stack.Screen name="onboarding/features" />
              <Stack.Screen name="onboarding/privacy" />
              <Stack.Screen name="onboarding/profile-setup" />
              <Stack.Screen name="onboarding/healthkit-permission" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="subscription" />
            </Stack>
            <SystemBars style={"auto"} />
          </GestureHandlerRootView>
        </WidgetProvider>
      </ThemeProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppStateProvider>
      <RootLayoutNav />
    </AppStateProvider>
  );
}
