import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type RecipeType = {
  id: string;
  title: string;
  image: string;
};

const SavedRecipesScreen: React.FC = () => {
  const [savedRecipes, setSavedRecipes] = useState<RecipeType[]>([]);
  const router = useRouter();

  // Load saved recipes on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadSavedRecipes = async () => {
        try {
          const storedRecipes = await AsyncStorage.getItem("savedRecipes");
          if (storedRecipes) {
            setSavedRecipes(JSON.parse(storedRecipes));
          } else {
            setSavedRecipes([]);
          }
        } catch (error) {
          console.error("Error fetching saved recipes:", error);
        }
      };

      loadSavedRecipes();
    }, [])
  );

  const removeFavorite = async (id: string) => {
    try {
      const updatedRecipes = savedRecipes.filter((recipe) => recipe.id !== id);
      setSavedRecipes(updatedRecipes);
      await AsyncStorage.setItem("savedRecipes", JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error("Error removing recipe:", error);
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
              <TouchableOpacity onPress={() => router.push(`/recipeDetail/${item.id}`)}>
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
              </TouchableOpacity>

              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </View>

              <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.heartContainer}>
                <Ionicons name="heart" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
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
    marginTop: 40, // Move title down
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
