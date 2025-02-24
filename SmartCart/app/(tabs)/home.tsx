import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeList from "../components/recipeList";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          Alert.alert("Error", "Authentication required. Please log in.");
          router.push("/");
          return;
        }
        setToken(storedToken);
        fetchRandomRecipes(storedToken);
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  const fetchRandomRecipes = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/randomrecipe?page=1&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });
  
      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.error || "Failed to fetch recipes");
      }
  
      const uniqueRecipes = [];
      const seenIds = new Set();
  
      for (const recipe of data.results) {
        if (!seenIds.has(recipe.id)) {
          seenIds.add(recipe.id);
          uniqueRecipes.push(recipe);
        }
      }
  
      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      Alert.alert("Error", "Failed to load recipes. Please try again.");
    }
    setLoading(false);
  };
  


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipes?query=${searchQuery}&page=1&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.error || "Failed to fetch recipes");
      }

      setRecipes(data.results);
    } catch (error) {
      console.error("Error searching recipes:", error);
      Alert.alert("Error", "Failed to search recipes. Please try again.");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
  
          <TouchableOpacity onPress={() => router.push("/preferencesScreen")} style={styles.settingsButton}>
            <Ionicons name="filter" size={34} color="black" />
          </TouchableOpacity>
        </View>
  
        {/* "Try It Out" Text (Just Text, No Button) */}
        <Text style={styles.tryItOutText}>🍽️ Try Out Random Recipes Fit Your Preference</Text>
  
        {/* Recipe List (Now in a separate file) */}
        <RecipeList recipes={recipes} loading={loading} fetchRandomRecipes={() => fetchRandomRecipes(token)} />
      </View>
    </SafeAreaView>
  );
  
}

// Styles
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#F8F3E6" 
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F3E6",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    width: "100%",
    height: 40,
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
  settingsButton: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  tryItOutText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10, // ✅ Adds spacing below the search bar
    color: "#333", // ✅ Dark gray text for better readability
  }
});
