// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent auto-hide of splash
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      setAuthChecked(true);
    };

    if (loaded) {
      checkAuth();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !authChecked) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // 👇 Authenticated: show tabs
          <Stack.Screen name="(tabs)" />
        ) : (
          // 👇 Not logged in: show login/signup/etc
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="setup-2fa" />
          </>
        )}
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
