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
import { Ionicons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Password Change Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="key-outline" size={20} color="#2D6A4F" />
          <Text style={styles.cardTitle}>Change Password</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.greenButton}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications-outline" size={20} color="#2D6A4F" />
          <Text style={styles.cardTitle}>Notifications</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#D1D5DB", true: "#34D399" }}
            thumbColor={notificationsEnabled ? "#fff" : "#fff"}
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-outline" size={20} color="#2D6A4F" />
          <Text style={styles.cardTitle}>Security</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Enable 2FA</Text>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: "#D1D5DB", true: "#34D399" }}
            thumbColor={twoFactorEnabled ? "#fff" : "#fff"}
          />
        </View>
      </View>

      {/* Set Preferences Button */}
      <TouchableOpacity 
        style={styles.greenButton}
        onPress={() => router.push('/preferencesScreen')}
      >
        <Text style={styles.buttonText}>Set Preferences</Text>
      </TouchableOpacity>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => router.push('/orderHistory')}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="receipt-outline" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Order History</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuButtonContent}>
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Notifications</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuButtonContent}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Privacy Policy</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuButtonContent}>
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Terms of Service</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <View style={styles.menuButtonContent}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.menuButtonText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ✅ Fixed Styles (Includes All Missing Properties)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  container: {
    flex: 1,
    backgroundColor: '#F8F3E6',
    padding: 16,
  },
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

  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6A4F',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  menuSection: {
    marginTop: 8,
  },
  menuButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  greenButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
});

