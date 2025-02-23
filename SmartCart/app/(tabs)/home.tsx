import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ✅ Get safe area insets
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // Load auth token from AsyncStorage
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

  // Function to fetch random recipes
  const fetchRandomRecipes = async (authToken: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/randomrecipe?page=1&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, // ✅ Include token in headers
        },
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw new Error(data.error || "Failed to fetch recipes");
      }

      setRecipes(data.results);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      Alert.alert("Error", "Failed to load recipes. Please try again.");
    }
    setLoading(false);
  };

  // Function to search for recipes
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipes?query=${searchQuery}&page=1&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Include token in headers
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
        {/* Top Bar with Search and Settings */}
        <View style={styles.topBar}>
          {/* Search Bar Wrapper (Takes remaining space) */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>

          {/* Settings Button (Centered in the right space) */}
          <TouchableOpacity onPress={() => router.push("/preferencesScreen")} style={styles.settingsButton}>
            <Ionicons name="filter" size={34} color="black" />
          </TouchableOpacity>
        </View>



        {/* Recipe List or Loader */}
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipeCard} onPress={() => router.push(`/recipe/${item.id}`)}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        )}
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
    flex: 1, // ✅ Search bar takes up available space
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
    width: 50, // ✅ Ensure space for centering
    alignItems: "center", // ✅ Center the icon horizontally
    justifyContent: "center", // ✅ Center the icon vertically
  },
});