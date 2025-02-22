import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput style={styles.input} placeholder="Full Name" />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>

      {/* ✅ Ensure this button exists */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/settings")}>
        <Text style={styles.settingsButtonText}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 15, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#28A745", padding: 15, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  switchText: { marginTop: 15, color: "blue" },
  settingsButton: { marginTop: 15, padding: 10, backgroundColor: "#FFA500", borderRadius: 8, alignItems: "center", width: "100%" },
  settingsButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
