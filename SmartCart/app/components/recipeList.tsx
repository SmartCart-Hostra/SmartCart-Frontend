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

const screenWidth = Dimensions.get("window").width;

export default function RecipeList({ recipes, loading, fetchRandomRecipes }: { recipes: any[]; loading: boolean; fetchRandomRecipes: () => void }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");

  // Handle pull-down refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const storedToken = await AsyncStorage.getItem("authToken"); // ✅ Wait for token
      if (storedToken) {
        await fetchRandomRecipes(storedToken); // ✅ Pass token correctly
      } else {
        console.error("No token found, unable to refresh.");
      }
    } catch (error) {
      console.error("Error fetching token for refresh:", error);
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
          keyExtractor={(item, index) => (item.id ? item.id.toString() : `recipe-${index}`)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recipeCard} onPress={() => router.push(`/recipeDetail/${item.id}`)} >

              <Image source={{ uri: item.image }} style={styles.recipeImage} />
              <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007BFF"]} />
          }
        />
      )}
    </View>
  );
}

// Styles for RecipeList
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
    //shadowColor: "#000",
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.2,
    //shadowRadius: 4,
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
  },
});
