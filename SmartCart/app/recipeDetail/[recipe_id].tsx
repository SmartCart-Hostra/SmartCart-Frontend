import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export default function RecipeDetail() {
  const params = useLocalSearchParams();
  const recipe_id = params.recipe_id;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

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
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("🚨 API Error Response:", errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("🚨 Error fetching recipe details:", error);
        Alert.alert("Error", "Failed to load recipe details. Please try again.");
      }
      setLoading(false);
    };

    fetchRecipeDetails();
  }, [recipe_id]);

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

  return (
    <FlatList
      data={recipe.extendedIngredients}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <>
          {/* Recipe Image & Title */}
          <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Meta Info */}
          <Text style={styles.metaText}>❤️ {recipe.aggregateLikes} Likes</Text>
          <Text style={styles.metaText}>⏳ {recipe.readyInMinutes} minutes</Text>
          <Text style={styles.metaText}>🍽 {recipe.servings} servings</Text>

          {/* Ingredients Header */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.ingredientItem}>
          <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }} style={styles.ingredientImage} />
          <Text style={styles.ingredientText}>{item.original}</Text>
        </View>
      )}
      ListFooterComponent={
        <>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.analyzedInstructions.length > 0 ? (
            recipe.analyzedInstructions[0].steps.map((step) => (
              <View key={step.number} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>Step {step.number}</Text>
                <Text style={styles.stepText}>{step.step}</Text>
                <View style={styles.stepImagesContainer}>
                  {step.equipment.map((equipment, index) => (
                    <Image key={index} source={{ uri: equipment.image }} style={styles.stepImage} />
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

// Styles
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  metaText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ingredientImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
  stepContainer: {
    marginBottom: 15,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepText: {
    fontSize: 16,
    marginTop: 5,
  },
  stepImagesContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  stepImage: {
    width: 50,
    height: 50,
    marginRight: 5,
  },
  noInstructionsText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#777",
  },
});
