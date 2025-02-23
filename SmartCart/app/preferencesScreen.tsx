import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

type Option = {
  label: string;
  color: string;
  apiLabel: string;
};

const options: Record<string, Option[]> = {
  "Dietary Restrictions": [
    { label: "Gluten Free", color: "#E2C48E", apiLabel: "Gluten Free" },
    { label: "Ketogenic", color: "#FF9800", apiLabel: "Ketogenic" },
    { label: "Vegetarian", color: "#A6C98A", apiLabel: "Vegetarian" },
    { label: "Lacto-Vegetarian", color: "#9C27B0", apiLabel: "Lacto-Vegetarian" },
    { label: "Ovo-Vegetarian", color: "#8BC34A", apiLabel: "Ovo-Vegetarian" },
    { label: "Vegan", color: "#7FAF65", apiLabel: "Vegan" },
    { label: "Pescetarian", color: "#D88C8C", apiLabel: "Pescetarian" },
    { label: "Paleo", color: "#795548", apiLabel: "Paleo" },
    { label: "Primal", color: "#FF5722", apiLabel: "Primal" },
    { label: "Low FODMAP", color: "#607D8B", apiLabel: "Low FODMAP" },
    { label: "Whole30", color: "#009688", apiLabel: "Whole30" },
  ],
//   ALLOWED_DIETS = {
//     'gluten free': 'Gluten Free',
//     'ketogenic': 'Ketogenic',
//     'vegetarian': 'Vegetarian',
//     'lacto-vegetarian': 'Lacto-Vegetarian',
//     'ovo-vegetarian': 'Ovo-Vegetarian',
//     'vegan': 'Vegan',
//     'pescetarian': 'Pescetarian',
//     'paleo': 'Paleo',
//     'primal': 'Primal',
//     'low fodmap': 'Low FODMAP',
//     'whole30': 'Whole30'
// }

  "Allergies": [
    { label: "Dairy", color: "#F6BE67", apiLabel:"dairy" },
    { label: "Egg", color: "#DC9CF7" , apiLabel: "egg"},
    { label: "Gluten", color: "#A4D869",apiLabel:"gluten" },
    { label: "Peanut", color: "#D9A87E", apiLabel: "peanut" },
    { label: "Sesame", color: "#8EA9E8", apiLabel:"sesame" },
    { label: "Seafood", color: "#DB5B5B", apiLabel:"seafood" },
    { label: "Shellfish", color: "#4B6650", apiLabel:"shellfish"},
    { label: "Soy", color: "#C17D7D" , apiLabel:"soy"},
    { label: "Tree Nut", color: "#E4C68D" ,apiLabel:"tree nut"},
    { label: "Wheat", color: "#E6A15E" , apiLabel: "wheat"},
  ],
};

const PreferencesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State for diet, intolerances (allergies)
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [initialDiets, setInitialDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [initialAllergies, setInitialAllergies] = useState<string[]>([]);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async (endpoint: string, setState: (data: string[]) => void, setInitialState: (data: string[]) => void) => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;
  
        const response = await fetch(`${API_URL}/${endpoint}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          const data = await response.json();
          console.log(`Fetched ${endpoint}:`, data); // ✅ Log API response
          setState(data[endpoint] || []);
          setInitialState(data[endpoint] || []); // ✅ Ensure initial state is set correctly
        } else {
          console.error(`Failed to fetch ${endpoint}. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };
  
    fetchPreferences("diets", setSelectedDiets, setInitialDiets);
    fetchPreferences("intolerances", setSelectedAllergies, setInitialAllergies); // ✅ Ensure allergies are set
  }, []);

  // Save preferences
  const savePreferences = async (endpoint: string, selected: string[], initial: string[]) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const removedItems = initial.filter(item => !selected.includes(item));
      const addedItems = selected.filter(item => !initial.includes(item));

      if (addedItems.length > 0) {
        await fetch(`${API_URL}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [endpoint]: addedItems }),
        });
      }

      if (removedItems.length > 0) {
        await fetch(`${API_URL}/${endpoint}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [endpoint]: removedItems }),
        });
      }
    } catch (error) {
      console.error(`Error saving ${endpoint}:`, error);
    }
  };

  // Handle selection toggles
  const toggleOption = (category: string, label: string) => {
    if (category === "Dietary Restrictions") {
      setSelectedDiets(prev =>
        prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
      );
    } else if (category === "Allergies") {
      setSelectedAllergies(prev =>
        prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity 
        style={[styles.backButton, { top: insets.top }]} 
        onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🥦 Tell us about your diet! 🥕</Text>
        <Text style={styles.subheader}>
          We will personalize your meal plans based on your preferences.
        </Text>

        {Object.entries(options).map(([category, items]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}:</Text>
            <View style={styles.optionContainer}>
  {items.map(({ label, color, apiLabel }) => {
    const isSelected =
      (category === "Dietary Restrictions" && selectedDiets.includes(apiLabel)) || 
      (category === "Allergies" && selectedAllergies.includes(apiLabel)); // ✅ Check both states

    return (
      <TouchableOpacity
        key={label}
        style={[
          styles.optionButton,
          { backgroundColor: color },
          isSelected && styles.selectedOption, // ✅ Apply selected style
        ]}
        onPress={() => toggleOption(category, apiLabel)} // ✅ Use apiLabel
      >
        <Text style={styles.optionText}>{label}</Text>
        {isSelected && <Text style={styles.checkmark}> ✅</Text>}
      </TouchableOpacity>
    );
  })}
</View>

          </View>
        ))}

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={() => {
            savePreferences("diets", selectedDiets, initialDiets);
            savePreferences("intolerances", selectedAllergies, initialAllergies);
          }}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F3E6" },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F3E6",
    padding: 20,
    alignItems: "center",
    marginTop: 40,
  },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 5 },
  subheader: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  section: { width: "100%", marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  optionContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  optionButton: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, margin: 5, minWidth: 90, justifyContent: "center" },
  selectedOption: { borderWidth: 2, borderColor: "#2D6A4F" },
  optionText: { fontSize: 14, color: "#fff" },
  checkmark: { marginLeft: 8, fontSize: 16 },
  saveButton: { backgroundColor: "#2D6A4F", padding: 12, borderRadius: 25, width: "80%", alignItems: "center", marginTop: 20 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default PreferencesScreen;
