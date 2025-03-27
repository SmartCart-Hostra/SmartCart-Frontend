import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

export default function RecipeList({
  recipes,
  loading,
  fetchRandomRecipes,
}: {
  recipes: any[];
  loading: boolean;
  fetchRandomRecipes: () => void;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      if (storedToken) {
        await fetchRandomRecipes(storedToken);
      } else {
        console.error("No token found, unable to refresh.");
      }
    } catch (error) {
      console.error("Error fetching token for refresh:", error);
    }
    setRefreshing(false);
  }, [fetchRandomRecipes]);

  const addToCart = async (recipe: any) => {
    try {
      const existingCart = await AsyncStorage.getItem("cartRecipes");
      const cartItems = existingCart ? JSON.parse(existingCart) : [];

      const alreadyExists = cartItems.some((item: any) => item.id === recipe.id);
      if (alreadyExists) {
        Alert.alert("Already Added", "This recipe is already in your cart.");
        return;
      }

      const updatedCart = [...cartItems, recipe];
      await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
      Alert.alert("Added", "Recipe added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <TouchableOpacity
                onPress={() => router.push(`/recipeDetail/${item.id}`)}
                style={styles.cardContent}
              >
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                <Text style={styles.addButtonText}>➕ Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007BFF"]} />
          }
        />
      )}
    </View>
  );
}

// ✅ Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: 20,
  },
  recipeCard: {
    width: screenWidth - 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    elevation: 3,
  },
  cardContent: {
    width: "100%",
    alignItems: "center",
  },
  recipeImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    resizeMode: "cover",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 10,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#2D6A4F",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
