import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeList from "../components/recipeList";

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Recipe {
  id: number;
  title: string;
  image: string;
  match_score?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [smartRecipes, setSmartRecipes] = useState<Recipe[]>([]);
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
        fetchSmartRecommendations(storedToken);
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
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      if (response.status !== 200) throw new Error(data.error);

      const uniqueRecipes: Recipe[] = [];
      const seenIds = new Set<number>();

      for (const r of data.results) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          uniqueRecipes.push(r);
        }
      }

      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error("Error fetching random recipes:", error);
      Alert.alert("Error", "Failed to load recipes. Please try again.");
    }
    setLoading(false);
  };

  const fetchSmartRecommendations = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/smart-recommendations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      console.log("Smart Recommendations Response:", data);

      if (data.showSmartRecommendations) {
        console.log("Smart Recipes:", data.smartRecommendations);
        setSmartRecipes(data.smartRecommendations || []);
      } else {
        console.log("No smart recommendations available.");
      }
    } catch (error) {
      console.error("Smart recommendations error:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recipes?query=${encodeURIComponent(searchQuery)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status !== 200) throw new Error(data.error);
      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
      Alert.alert("Error", "Failed to search recipes. Please try again.");
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={24} color="#007BFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push("/preferencesScreen")} style={styles.settingsButton}>
              <Ionicons name="filter" size={34} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Smart Recommendations */}
            {smartRecipes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>✨ Smart Recommendations</Text>
                <RecipeList recipes={smartRecipes} loading={false} showMatchScore />
              </>
            )}

            {/* Try It Out Text */}
            <Text style={styles.sectionTitle}>🍽️ Try Out Random Recipes</Text>

            {/* Recipe List */}
            <RecipeList
              recipes={recipes}
              loading={loading}
              fetchRandomRecipes={() => fetchRandomRecipes(token)}
            />
          </ScrollView>

          {/* Floating Cart Button */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="cart" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F3E6",
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
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 2,
    borderColor: "black",
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
  searchButton: {
    marginLeft: 10,
    padding: 8,
  },
  settingsButton: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    color: "#333",
  },
  cartButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#2D6A4F",
    padding: 16,
    borderRadius: 30,
    elevation: 4,
  },
});
