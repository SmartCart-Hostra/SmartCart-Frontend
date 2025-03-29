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
          <>
            {/* Authenticated: main app flow */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* Optionally, include extra authenticated screens */}
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="recipeDetail/[recipe_id]" options={{ title: "Recipe Detail" }} />
          </>
        ) : (
          <>
            {/* Not authenticated: login/signup flow */}
            <Stack.Screen name="index" options={{ title: 'Login' }} />
            <Stack.Screen name="signup" options={{ title: 'Signup' }} />
            <Stack.Screen name="setup-2fa" options={{ title: 'Setup 2FA' }} />
          </>
        )}
      </Stack>

      <StatusBar style="auto" />
    </>
  );
}
