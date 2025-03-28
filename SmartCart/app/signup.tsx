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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const SignupScreen = () => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        await AsyncStorage.setItem("username", fullName);
        await AsyncStorage.setItem("userEmail", email);

        Alert.alert("✅ Success", data.message);
        router.push("/setup-2fa");
      } else {
        Alert.alert("🚫 Signup Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("⚠️ Error", "Something went wrong. Please try again.");
      console.error("🔥 Signup error:", error);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>

            {/* SmartCart Logo at the Top Left */}
            <Image source={require("../assets/images/smartcart-logo.png")} style={styles.logo} />

            {/* "Create Your Account" with Vegetables */}
            <View style={styles.headerContainer}>
              <Image source={require("../assets/images/broccoli.png")} style={styles.vegetable} />
              <Text style={styles.smartcartText}>Create Your Account</Text>
              <Image source={require("../assets/images/carrot.png")} style={styles.vegetable} />
            </View>

            <Text style={styles.subheader}>Sign up to personalize your experience.</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={setFullName}
            />
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
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.linkText}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Updated Styles (Consistent with Login Screen)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  container: { flex: 1, padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },

  /* ✅ Enlarged & Properly Positioned SmartCart Logo */
  logo: { width: 250, height: 55, resizeMode: "contain", position: "absolute", top: 10, left: -60 },

  /* ✅ "Create Your Account" with Vegetables */
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

  button: { backgroundColor: "#2D6A4F", padding: 12, borderRadius: 25, width: "80%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  linkText: { color: "#2D6A4F", fontSize: 14, marginTop: 15 },
});

export default SignupScreen;
