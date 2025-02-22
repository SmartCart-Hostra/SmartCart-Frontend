import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("JohnDoe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [password, setPassword] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleChangePassword = () => {
    Alert.alert("Password Changed", "Your password has been successfully updated.");
    setPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Account Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      </View>

      {/* Change Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput style={styles.input} placeholder="Enter New Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </View>

      {/* Security (2FA) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable 2FA</Text>
          <Switch value={is2FAEnabled} onValueChange={setIs2FAEnabled} />
        </View>
        {is2FAEnabled && (
          <TouchableOpacity style={styles.setupButton} onPress={() => router.push("/setup-2fa")}>
            <Text style={styles.buttonText}>Setup 2FA</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => Alert.alert("Logged Out", "You have been logged out successfully.")}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

  section: { padding: 15, borderRadius: 10, backgroundColor: "#f5f5f5", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  label: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, fontSize: 16, backgroundColor: "#fff", marginBottom: 10 },

  button: { backgroundColor: "#007BFF", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  toggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggleText: { fontSize: 16 },

  setupButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },
  
  logoutButton: { backgroundColor: "red", padding: 15, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 20 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
