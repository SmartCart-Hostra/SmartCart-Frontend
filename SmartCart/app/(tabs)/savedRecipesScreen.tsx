import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type RecipeType = {
  id: string;
  recipe_id: number;
  title: string;
  image: string;
};

const API_URL = Constants.expoConfig?.extra?.API_URL;

const SavedRecipesScreen: React.FC = () => {
  const [savedRecipes, setSavedRecipes] = useState<RecipeType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadSavedRecipes = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.warn("No token found.");
        return;
      }

      const response = await fetch(`${API_URL}/saved-recipes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Saved recipes status:", response.status);
      console.log("Saved recipes response:", data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch saved recipes");
      }

      setSavedRecipes(data.saved_recipes || []);
    } catch (error: any) {
      console.error("Error fetching saved recipes:", error);
      Alert.alert("Error", "Failed to fetch saved recipes.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSavedRecipes();
    setRefreshing(false);
  }, []);

  const removeFavorite = async (recipeId: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Authentication required. Please log in.");
        return;
      }

      const response = await fetch(`${API_URL}/saved-recipes`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipe_id: recipeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove recipe");
      }

      // Only update UI after successful deletion
      const updatedRecipes = savedRecipes.filter((recipe) => recipe.recipe_id !== recipeId);
      setSavedRecipes(updatedRecipes);
      Alert.alert("Success", "Recipe removed from saved recipes");
    } catch (error: any) {
      console.error("Error removing recipe:", error);
      Alert.alert("Error", error.message || "Failed to remove recipe. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>❤️ Saved Recipes</Text>

      {savedRecipes.length > 0 ? (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <TouchableOpacity onPress={() => router.push(`/recipeDetail/${item.recipe_id}`)}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
              </TouchableOpacity>

              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </View>

              <TouchableOpacity onPress={() => removeFavorite(item.recipe_id)} style={styles.heartContainer}>
                <Ionicons name="heart" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007BFF"]}
            />
          }
        />
      ) : (
        <Text style={styles.noRecipesText}>No saved recipes yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F3E6",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  noRecipesText: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
  },
  recipeCard: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  recipeImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  recipeInfo: {
    alignItems: "center",
    marginTop: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  heartContainer: {
    marginTop: 10,
  },
});

export default SavedRecipesScreen;
