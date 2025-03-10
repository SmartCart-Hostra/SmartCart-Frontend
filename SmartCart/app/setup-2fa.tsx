import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ For storing set-cookie

const API_URL = Constants.expoConfig?.extra?.API_URL; // Ensure this is set in `app.json`

export default function Setup2FAScreen() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const {type} = useLocalSearchParams();

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code.");
      return;
    }
  
    setLoading(true);
  
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const verifyEndpoint = type === "signup" ? "/verify-2fa" : "/login-verify";
  
      if (!email) {
        Alert.alert("Error", "Email not found. Please login again.");
        setLoading(false);
        return;
      }
  
      const response = await fetch(`${API_URL}${verifyEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token: verificationCode }),
      });
  
      if (response.status === 200) {
        const data = await response.json();
        console.log("Received token:", data.token); // ✅ Debugging
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token); // ✅ Store JWT Token
          console.log("Token stored successfully!"); // ✅ Debugging
        } else {
          console.warn("No token received from server."); // ✅ Debugging
        }
  
        if (type === "signup") {
          Alert.alert("Success", "Email verified! You can now log in.");
          router.push("/"); // ✅ Redirect new users to login
        } else {
          Alert.alert("Success", "2FA Verified! You are now logged in.");
          router.push("/dashboard"); // ✅ Redirect logged-in users to dashboard
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Invalid verification code.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("2FA Verification error:", error);
    }
  
    setLoading(false);
  };
  
  

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Setup Two-Factor Authentication</Text>
          <Text style={styles.description}>
            Enter the 6-digit code sent to your registered device or email.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit Code"
            keyboardType="number-pad"
            maxLength={6}
            value={verificationCode}
            onChangeText={setVerificationCode}
          />

          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Enable 2FA"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 40,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: "center" 
  },
  description: { 
    fontSize: 16, 
    color: "#666", 
    marginBottom: 20,
    textAlign: "center" 
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 5, 
    padding: 10, 
    fontSize: 18, 
    textAlign: "center",
    width: "80%", 
  },
  verifyButton: { 
    backgroundColor: "#007BFF", 
    padding: 10, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 20,
    width: "80%" 
  },
  cancelButton: { 
    backgroundColor: "#ccc", 
    padding: 10, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10,
    width: "80%" 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});
