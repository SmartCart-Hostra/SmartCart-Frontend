import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;

interface Recipe {
  id: number;
  title: string;
  image: string;
}

export default function RecipeSearchScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // First useEffect to load token
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
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  // Second useEffect to handle search when token and query are available
  useEffect(() => {
    const performSearch = async () => {
      if (!token || !query) return;
      
      console.log('Token and query available, performing search');
      setSearchQuery(query);
      await handleSearch();
    };

    performSearch();
  }, [token, query]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('Search skipped: No query');
      return;
    }

    if (!token) {
      console.log('Search skipped: No token');
      return;
    }

    setLoading(true);
    try {
      console.log('Searching with query:', searchQuery);
      console.log('Using API URL:', API_URL);
      console.log('Using token:', token);
      
      const url = `${API_URL}/recipes?query=${encodeURIComponent(searchQuery)}`;
      console.log('Full URL:', url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.status !== 200) {
        throw new Error(data.error || "Failed to fetch recipes");
      }

      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
      Alert.alert("Error", "Failed to search recipes. Please try again.");
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.recipeCard} 
      onPress={() => router.push(`/recipeDetail/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

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
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={24} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        ) : (
          <FlatList
            data={recipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007BFF"]} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recipes found. Try searching for something else!</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  }
}); 