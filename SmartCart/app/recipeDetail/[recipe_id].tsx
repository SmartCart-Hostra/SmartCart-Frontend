import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddToCart from "../components/add_recipe_cart";

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Recipe {
  id: number;
  title: string;
  image: string;
  aggregateLikes: number;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: Array<{
    id: number;
    image: string;
    original: string;
  }>;
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
      equipment: Array<{
        image: string;
      }>;
    }>;
  }>;
}

export default function RecipeDetail() {
  const params = useLocalSearchParams();
  const recipe_id = params.recipe_id;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        if (!recipe_id) {
          Alert.alert("Error", "No recipe ID provided.");
          return;
        }

        const authToken = await AsyncStorage.getItem("authToken");
        if (!authToken) {
          Alert.alert("Error", "Authentication required. Please log in.");
          return;
        }

        const response = await fetch(`${API_URL}/recipedetail/${recipe_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("🚨 API Error Response:", errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data: Recipe = await response.json();
        setRecipe(data);

        const saved = JSON.parse((await AsyncStorage.getItem("savedRecipes")) ?? "[]");
        setIsFavorited(saved.some((r: Recipe) => r.id === data.id));
      } catch (error) {
        console.error("🚨 Error fetching recipe details:", error);
        Alert.alert("Error", "Failed to load recipe details. Please try again.");
      }
      setLoading(false);
    };

    fetchRecipeDetails();
  }, [recipe_id]);

  const toggleFavorite = async () => {
    let savedRecipes: Recipe[] = JSON.parse((await AsyncStorage.getItem("savedRecipes")) ?? "[]");

    if (isFavorited) {
      savedRecipes = savedRecipes.filter((r) => r.id !== recipe?.id);
    } else {
      if (recipe) savedRecipes.push(recipe);
    }

    await AsyncStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Recipe not found.</Text>
      </View>
    );
  }

  const renderIngredient = ({ item }: { item: Recipe["extendedIngredients"][0] }) => (
    <View style={styles.ingredientItem}>
      <Image
        source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }}
        style={styles.ingredientImage}
      />
      <Text style={styles.ingredientText}>{item.original}</Text>
    </View>
  );

  return (
    <FlatList
      data={recipe.extendedIngredients}
      keyExtractor={(item, index) => `ingredient-${item.id}-${index}`}
      ListHeaderComponent={
        <>
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          {/* Like Button from Shreya’s branch */}
          <TouchableOpacity onPress={toggleFavorite} style={styles.heartButtonCentered}>
            <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={30} color="red" />
          </TouchableOpacity>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.metaText}>❤️ {recipe.aggregateLikes} Likes</Text>
          <Text style={styles.metaText}>⏳ {recipe.readyInMinutes} minutes</Text>
          <Text style={styles.metaText}>🍽 {recipe.servings} servings</Text>

          <View style={styles.addToCartContainer}>
            <AddToCart recipe={recipe} />
          </View>

          <Text style={styles.sectionTitle}>Ingredients</Text>
        </>
      }
      renderItem={renderIngredient}
      ListFooterComponent={
        <>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.analyzedInstructions.length > 0 ? (
            recipe.analyzedInstructions[0].steps.map((step) => (
              <View key={`step-${step.number}`} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>Step {step.number}</Text>
                <Text style={styles.stepText}>{step.step}</Text>
                <View style={styles.stepImagesContainer}>
                  {step.equipment.map((equipment, index) => (
                    <Image
                      key={`equipment-${step.number}-${index}`}
                      source={{ uri: equipment.image }}
                      style={styles.stepImage}
                    />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noInstructionsText}>No instructions available.</Text>
          )}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F3E6",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  recipeImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  heartButtonCentered: {
    alignSelf: "center",
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 15,
    color: "#333",
  },
  metaText: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  addToCartContainer: {
    padding: 15,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 15,
    color: "#333",
    backgroundColor: "#fff",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  stepContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 10,
  },
  stepImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stepImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  noInstructionsText: {
    padding: 15,
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});
