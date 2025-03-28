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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function SettingsScreen() {
  const router = useRouter();

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("userEmail");

      router.push("/"); // Redirect to login screen
      Alert.alert("✅ Logged Out", "You have been logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("⚠️ Error", "Failed to log out. Please try again.");
    }
  };

  // ✅ Account Information
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
            setUsername(storedUsername || storedEmail.split("@")[0]);
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
        Alert.alert("✅ Success", "Username updated successfully.");
      } catch (error) {
        console.error("Error saving username:", error);
      }
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Account Information</Text>
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

  const handleSetPreference = () => {
    router.push("/preferencesScreen");
  };

  const ChangePassword = () => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
      if (!password) {
        Alert.alert("⚠️ Error", "Password cannot be empty.");
        return;
      }

      setLoading(true);
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        const response = await fetch(`${API_URL}/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ newPassword: password }),
        });

        if (response.status === 200) {
          Alert.alert("✅ Success", "Password updated successfully.");
          setPassword("");
        } else {
          Alert.alert("❌ Error", "Failed to update password.");
        }
      } catch (error) {
        console.error("Password change error:", error);
        Alert.alert("❌ Error", "Something went wrong. Please try again.");
      }
      setLoading(false);
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          placeholderTextColor="#6B7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const NotificationSettings = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Enable Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>
      </View>
    );
  };

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
          // ✅ Send POST request to /logout with token in Cookie header
          const response = await fetch(`${API_URL}/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cookie": authToken, // ✅ Attach stored token in Cookie header
            },
            credentials: "include",
          });
    
          if (response.status !== 200) {
            console.warn("Logout request failed:", response.status);
          }
        }
    
        // ✅ Clear AsyncStorage (remove token and user data)
        await AsyncStorage.removeItem("authToken");
        //await AsyncStorage.removeItem("userEmail");
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

          {/* Preferences Button */}
        <TouchableOpacity style={styles.preferenceButton} onPress={handleSetPreference}>
          <Text style={styles.buttonText}>Set Preferences</Text>
        </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
}

// ✅ Fixed Styles (Includes All Missing Properties)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  container: { flex: 1, padding: 20 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 32, fontWeight: "bold", color: "#2D6A4F", marginBottom: 20 },

  section: { 
    width: "100%", 
    padding: 15, 
    borderRadius: 15, 
    backgroundColor: "#fff", 
    marginBottom: 20, 
    elevation: 2 
  },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#2D6A4F", marginBottom: 10 },
  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginTop: 5 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },

  button: { backgroundColor: "#2D6A4F", padding: 12, borderRadius: 25, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  toggleContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  toggleText: { fontSize: 16, color: "#333" },

  logoutButton: { backgroundColor: "red", padding: 15, borderRadius: 25, width: "100%", alignItems: "center", marginTop: 20 },
  logoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  preferenceButton: { backgroundColor: "#28A745", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 10, width: "100%"},
});

