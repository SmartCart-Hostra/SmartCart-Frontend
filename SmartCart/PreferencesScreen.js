// SmartCart Frontend - Prefrences Page 
// Author: Shreya Kembhavi
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// all options/buttons
const options = {
  "Dietary Restrictions": [
    { label: "Pescatarian", color: "#D88C8C" },
    { label: "Gluten-Free", color: "#E2C48E" },
    { label: "Vegan", color: "#7FAF65" },
    { label: "Vegetarian", color: "#A6C98A" },
    { label: "Dairy-Free", color: "#80A4D3" },
    { label: "Ketogenic", color: "#DFAE6A" },
    { label: "Paleo", color: "#B97575" },
    { label: "Low FODMAP", color: "#C48181" },
    { label: "Low Sodium", color: "#B4D4C8" }
  ],
  "Allergies": [
    { label: "Dairy", color: "#F6BE67" },
    { label: "Egg", color: "#DC9CF7" },
    { label: "Gluten", color: "#A4D869" },
    { label: "Peanut", color: "#D9A87E" },
    { label: "Sesame", color: "#8EA9E8" },
    { label: "Seafood", color: "#DB5B5B" },
    { label: "Shellfish", color: "#4B6650" },
    { label: "Soy", color: "#C17D7D" },
    { label: "Tree Nut", color: "#E4C68D" },
    { label: "Wheat", color: "#E6A15E" }
  ],
  "Cuisine Preferences": [
    { label: "African", color: "#A3C972" },
    { label: "American", color: "#E8773F" },
    { label: "British", color: "#5483F0" },
    { label: "Cajun", color: "#BF6CF8" },
    { label: "Caribbean", color: "#D88C8C" },
    { label: "Chinese", color: "#B66C66" },
    { label: "Eastern European", color: "#76D2C8" },
    { label: "French", color: "#4A6D3B" },
    { label: "German", color: "#D9D98E" },
    { label: "Greek", color: "#80A4D3" },
    { label: "Indian", color: "#E2C48E" },
    { label: "Irish", color: "#7FAF65" },
    { label: "Italian", color: "#DFAE6A" },
    { label: "Japanese", color: "#A6C98A" },
    { label: "Jewish", color: "#B97575" },
    { label: "Korean", color: "#C48181" },
    { label: "Latin American", color: "#B4D4C8" },
    { label: "Mediterranean", color: "#F6BE67" },
    { label: "Mexican", color: "#DC9CF7" },
    { label: "Middle Eastern", color: "#A4D869" },
    { label: "Nordic", color: "#D9A87E" },
    { label: "Southern", color: "#8EA9E8" },
    { label: "Spanish", color: "#DB5B5B" },
    { label: "Thai", color: "#4B6650" },
    { label: "Vietnamese", color: "#C17D7D" }
  ],
  "Nutrition Goals": [
    { label: "Low Carb", color: "#E46A2D" },
    { label: "High Protein", color: "#C583E1" }
  ]
};

const PreferencesScreen = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
// selectable options
  const toggleOption = (option) => {
    setSelectedOptions(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🥦 Tell us about your diet! 🥕</Text>
      <Text style={styles.subheader}>We will personalize your meal plans based on your preferences.</Text>
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
                  selectedOptions.includes(label) && styles.selectedOption
                ]}
                onPress={() => toggleOption(label)}
              >
                <Text style={styles.optionText}>{label}</Text>
                {selectedOptions.includes(label) && <Text style={styles.checkmark}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F3E6',
    padding: 20,
    alignItems: 'center'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20
  },
  section: {
    width: '100%',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 5,
    minWidth: 90,
    justifyContent: 'center'
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#2D6A4F'
  },
  optionText: {
    fontSize: 14,
    color: '#fff'
  },
  checkmark: {
    marginLeft: 8,
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#2D6A4F',
    padding: 12,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default PreferencesScreen;
