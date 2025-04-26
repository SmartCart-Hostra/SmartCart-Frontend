import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function Setup2FAScreen() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { type } = useLocalSearchParams();

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
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
        }
        if (type === "signup") {
          Alert.alert("Success", "Email verified! You can now log in.");
          router.push("/");
        } else {
          Alert.alert("Success", "2FA Verified! You are now logged in.");
          router.push("/dashboard");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Invalid verification code.");
      }
    } catch (error) {
      console.error("2FA Verification error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>

            {/* SmartCart Logo at the Top */}
            <Image source={require("../assets/images/smartcart-logo.png")} style={styles.logo} />

            {/* Setup 2FA Heading with Icons */}
            <View style={styles.headerContainer}>
              <Image source={require("../assets/images/broccoli.png")} style={styles.vegetable} />
              <Text style={styles.smartcartText}>Verify Your Account</Text>
              <Image source={require("../assets/images/carrot.png")} style={styles.vegetable} />
            </View>

            <Text style={styles.subheader}>Enter the 6-digit code sent to your email or device.</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit Code"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              maxLength={6}
              value={verificationCode}
              onChangeText={setVerificationCode}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Enable 2FA</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Cancel and go back</Text>
            </TouchableOpacity>
            
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  container: { flex: 1, padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },

  logo: { width: 250, height: 55, resizeMode: "contain", position: "absolute", top: 10, left: -60 },

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
    textAlign: "center",
  },

  button: { backgroundColor: "#2D6A4F", padding: 12, borderRadius: 25, width: "80%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  linkText: { color: "#2D6A4F", fontSize: 14, marginTop: 15 },
});
