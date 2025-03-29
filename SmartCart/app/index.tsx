import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ Auto-check stored token on app launch
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const storedToken = await AsyncStorage.getItem("authToken");

        console.log("Stored Email:", storedEmail);  // ✅ Debugging
        console.log("Stored Token:", storedToken);  // ✅ Debugging

        if (storedEmail) setEmail(storedEmail); // ✅ Pre-fill email if stored

        if (storedToken) {
          console.log("Checking stored token...");

          // ✅ Send request with correct JWT Authorization header
          const response = await fetch(`${API_URL}/protected`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${storedToken}`,  // ✅ Fixed token header
            },
          });

          console.log("Response Status:", response.status);  // ✅ Debugging

          if (response.status === 200) {
            const data = await response.json();
            console.log("Token is valid, redirecting to dashboard:", data.message);
            router.push("/dashboard"); // ✅ Navigate to dashboard if valid
            return;
          } else {
            console.log("Invalid token, staying on login page.");
            await AsyncStorage.removeItem("authToken"); // ✅ Clear invalid token
          }
        } else {
          console.log("No stored token found.");
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
      console.log("Login response:", data); // Add debug logging

      if (response.status === 200) { // Only check status for 2FA flow
        console.log("Login successful, storing data..."); // Add debug logging
        await AsyncStorage.setItem("userEmail", email);
        console.log("Data stored, navigating to 2FA..."); // Add debug logging
        Alert.alert("Success", "Please check your email for 2FA code.");
        router.push("/setup-2fa");
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>

            {/* ✅ SmartCart Logo at the Top Left */}
            <Image source={require("../assets/images/smartcart-logo.png")} style={styles.logo} />

            {/* ✅ SmartCart Name with Vegetables */}
            <View style={styles.headerContainer}>
              <Image source={require("../assets/images/broccoli.png")} style={styles.vegetable} />
              <Text style={styles.smartcartText}>Log In</Text>
              <Image source={require("../assets/images/carrot.png")} style={styles.vegetable} />
            </View>

            <Text style={styles.subheader}>Log in to access your personalized meal plans.</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* ✅ "Remember Me" Toggle (UI Only, No AsyncStorage Effect) */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Remember Me</Text>
              <Switch value={rememberMe} onValueChange={setRememberMe} />
            </View>

            <TouchableOpacity style={[styles.button, loading && styles.disabledButton]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ✅ Updated Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  container: { flex: 1, padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },

  /* ✅ Enlarged & Properly Positioned SmartCart Logo */
  logo: { width: 170, height: 55, resizeMode: "contain", position: "absolute", top: 20, left: 10 },

  /* ✅ SmartCart Name with Vegetables */
  headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  smartcartText: { fontSize: 28, fontWeight: "bold", color: "#2D6A4F", marginHorizontal: 10 },
  vegetable: { width: 30, height: 30, resizeMode: "contain" },

  subheader: { fontSize: 14, textAlign: "center", marginBottom: 20 },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    width: "80%",
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  /* ✅ "Remember Me" Toggle (UI Only) */
  toggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "80%", marginBottom: 10 },
  toggleText: { fontSize: 14, color: "#333" },

  button: { backgroundColor: "#2D6A4F", padding: 12, borderRadius: 25, width: "80%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#A5A5A5" },

  linkText: { color: "#2D6A4F", fontSize: 14, marginTop: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
export default LoginScreen;

