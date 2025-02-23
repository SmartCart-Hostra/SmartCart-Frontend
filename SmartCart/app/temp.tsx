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
    { label: "Gluten Free", color: "#E2C48E", apiLabel: "gluten free" },
    { label: "Ketogenic", color: "#FF9800", apiLabel: "ketogenic" },
    { label: "Vegetarian", color: "#A6C98A", apiLabel: "vegetarian" },
    { label: "Lacto-Vegetarian", color: "#9C27B0", apiLabel: "lacto-vegetarian" },
    { label: "Ovo-Vegetarian", color: "#8BC34A", apiLabel: "ovo-vegetarian" },
    { label: "Vegan", color: "#7FAF65", apiLabel: "vegan" },
    { label: "Pescetarian", color: "#D88C8C", apiLabel: "pescetarian" },
    { label: "Paleo", color: "#795548", apiLabel: "paleo" },
    { label: "Primal", color: "#FF5722", apiLabel: "primal" },
    { label: "Low FODMAP", color: "#607D8B", apiLabel: "low fodmap" },
    { label: "Whole30", color: "#009688", apiLabel: "whole30" },
  ],
  "Allergies": [
    { label: "Dairy", color: "#F6BE67", apiLabel:"dairy" },
    { label: "Egg", color: "#DC9CF7" , apiLabel: "egg"},
    { label: "Gluten", color: "#A4D869",apiLabel:"gluten" },
    { label: "Peanut", color: "#D9A87E", apiLabel: "peanut" },
    { label: "Sesame", color: "#8EA9E8", apiLabel:"sesame" },
    { label: "Seafood", color: "#DB5B5B", apiLabel:"seafood" },
    { label: "Shellfish", color: "#4B6650", apiLabel:"shellfish"},
    { label: "Soy", color: "#C17D7D" , apiLabel:"sony"},
    { label: "Tree Nut", color: "#E4C68D" ,apiLabel:"tree nut"},
    { label: "Wheat", color: "#E6A15E" , apiLabel: "wheat"},
  ],
};

const PreferencesScreen: React.FC = () => {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [initialSelectedOptions, setInitialSelectedOptions] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchSelectedDiets = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(`${API_URL}/diets`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const data = await response.json();
          setSelectedOptions(data.diets || []);
          setInitialSelectedOptions(data.diets || []);
        }
      } catch (error) {
        console.error("Error fetching dietary restrictions:", error);
      }
    };
    fetchSelectedDiets();
  }, []);

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const savePreferences = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const selectedDietsForAPI = selectedOptions.map(option => {
        const match = Object.values(options)[0].find(o => o.label === option);
        return match ? match.apiLabel : option;
      });

      const removedDiets = initialSelectedOptions.filter(diet => !selectedOptions.includes(diet));
      const addedDiets = selectedOptions.filter(diet => !initialSelectedOptions.includes(diet));

      if (addedDiets.length > 0) {
        await fetch(`${API_URL}/diets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ diets: addedDiets }),
        });
      }

      if (removedDiets.length > 0) {
        await fetch(`${API_URL}/diets`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ diets: removedDiets }),
        });
      }

      setInitialSelectedOptions(selectedOptions);
      console.log("Diets updated successfully");
    } catch (error) {
      console.error("Error saving dietary preferences:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity 
      style={[styles.backButton, {top: insets.top}]} onPress={() => router.back()}>
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
              {items.map(({ label, color }) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.optionButton,
                    { backgroundColor: color },
                    selectedOptions.includes(label) && styles.selectedOption,
                  ]}
                  onPress={() => toggleOption(label)}
                >
                  <Text style={styles.optionText}>{label}</Text>
                  {selectedOptions.includes(label) && (
                    <Text style={styles.checkmark}> ✅</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.saveButton} onPress={savePreferences}>
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
