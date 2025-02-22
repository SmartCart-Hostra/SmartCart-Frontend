import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // ✅ Show loading while checking token

  // ✅ Auto-check stored token on app launch
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedToken = await AsyncStorage.getItem("authToken");

        if (storedEmail) setEmail(storedEmail); // ✅ Pre-fill email if stored

        if (storedToken) {
          console.log("Checking stored token...");

          // Send request to backend to validate token
          const response = await fetch(`${API_URL}/protected`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cookie": storedToken,
            },
            credentials: "include",
          });

          if (response.status === 200) {
            const data = await response.json();
            console.log("Token is valid, redirecting to dashboard:", data.message);
            router.push("/dashboard"); // ✅ Navigate to dashboard if valid
            return;
          } else {
            console.log("Invalid token, staying on login page.");
            await AsyncStorage.removeItem("authToken"); // ✅ Clear invalid token
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
      setLoading(false); // ✅ Hide loading after check is done
    };

    checkAuthStatus();
  }, []);

  // ✅ Handle manual login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        await AsyncStorage.setItem("userEmail", email); // ✅ Store email for 2FA
        Alert.alert("Success", data.message);
        router.push("/setup-2fa"); // ✅ Redirect to setup-2fa
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  switchText: { marginTop: 15, color: "blue" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
