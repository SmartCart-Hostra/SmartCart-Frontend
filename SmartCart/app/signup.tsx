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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        await AsyncStorage.setItem("username", fullName); // ✅ Store Full Name as Username
        await AsyncStorage.setItem("userEmail", email); // ✅ Store Email

        Alert.alert("Success", data.message);
        router.push({ pathname: "/setup-2fa", params: { type: "signup" } }); // ✅ Navigate to 2FA Verification
      } else {
        Alert.alert("Signup Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Signup error:", error);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Sign Up</Text>

          <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.switchText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%",maxWidth: 400, padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#28A745", padding: 15, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  switchText: { marginTop: 15, color: "blue" },
});
