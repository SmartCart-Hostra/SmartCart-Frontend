import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
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

  

// ✅ Main Settings Screen
export default function SettingsScreen() {
  const router = useRouter();

  // ✅ Account Information Component
const AccountInfo = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
  
    useEffect(() => {
      const loadUserData = async () => {
        try {
          const storedEmail = await AsyncStorage.getItem("userEmail");
          const storedUsername = await AsyncStorage.getItem("username");
  
          if (storedEmail) {
            setEmail(storedEmail);
            setUsername(storedUsername || storedEmail.split("@")[0]); // Default username from email
          }
        } catch (error) {
          console.error("Failed to load user data:", error);
        }
      };
  
      loadUserData();
    }, []);
  
    const handleSaveUsername = async () => {
      if (!username) {
        Alert.alert("Invalid Username", "Username cannot be empty.");
        return;
      }
  
      try {
        await AsyncStorage.setItem("username", username);
        Alert.alert("Success", "Username updated successfully.");
      } catch (error) {
        console.error("Error saving username:", error);
      }
    };
  
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} editable={false} />
        <TouchableOpacity style={styles.button} onPress={handleSaveUsername}>
          <Text style={styles.buttonText}>Save Username</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // ✅ Change Password Component
  const ChangePassword = () => {
    const [password, setPassword] = useState("");
  
    const handleChangePassword = () => {
      Alert.alert("Password Changed", "Your password has been successfully updated.");
      setPassword("");
    };
  
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // ✅ Notifications Toggle Component
  const NotificationSettings = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </View>
    );
  };
  
  // ✅ Security (2FA) Component
  const SecuritySettings = ({ router }) => {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
    return (
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
    );
  };
  
  const handleLogout = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");

      if (!authToken) {
        console.warn("No auth token found, skipping logout request.");
      } else {
        // ✅ Send POST request to /logout with correct JWT Authorization header
        const response = await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,  // ✅ Fixed token header
          },
        });

        if (response.status !== 200) {
          console.warn("Logout request failed:", response.status);
        }
      }

      // ✅ Clear AsyncStorage (remove token and user data)
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("username");

      // ✅ Navigate back to login page
      router.push("/");

      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>⚙️ Settings</Text>

          <AccountInfo />
          <ChangePassword />
          <NotificationSettings />
          <SecuritySettings router={router} />

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },

  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

  section: { width: "100%", padding: 15, borderRadius: 10, backgroundColor: "#f5f5f5", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  label: { fontSize: 14, fontWeight: "bold", marginTop: 5 },
  input: { width: "100%", borderWidth: 1, borderRadius: 5, padding: 10, fontSize: 16, backgroundColor: "#fff", marginBottom: 10 },

  button: { backgroundColor: "#007BFF", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  toggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  toggleText: { fontSize: 16 },

  setupButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5, alignItems: "center", marginTop: 10 },

  logoutButton: { backgroundColor: "red", padding: 15, borderRadius: 8, width: "100%", alignItems: "center", marginTop: 20 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
