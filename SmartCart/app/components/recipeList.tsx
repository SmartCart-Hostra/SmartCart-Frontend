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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddToCart from "./add_recipe_cart";

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
      await fetchRandomRecipes();
    } catch (error) {
      console.error("Error refreshing recipes:", error);
    }
    setRefreshing(false);
  }, [fetchRandomRecipes]);

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

              <AddToCart recipe={item} />
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
});
