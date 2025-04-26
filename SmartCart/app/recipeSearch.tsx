// ✅ RECIPE SEARCH SCREEN W/ SMART RECOMMENDATIONS
import React, { useState, useEffect, useCallback } from "react";
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
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeFilter from "./components/recipe_filter";
import AddToCart from "./components/add_cart";

const API_URL = Constants.expoConfig?.extra?.API_URL;
const screenWidth = Dimensions.get("window").width;

interface Recipe {
  id: number;
  title: string;
  image: string;
  match_score?: number; // for smart feed
}

interface Filters {
  price_range?: string;
  time_range?: string;
  meal_type?: string;
}

export default function RecipeSearchScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string }>();

  const [searchQuery, setSearchQuery] = useState(query || "");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const rotateAnim = new Animated.Value(0);

<<<<<<< Updated upstream
  // Animation for filter icon rotation
=======
  // ✅ Smart Recommendations
  const [smartRecommendations, setSmartRecommendations] = useState<Recipe[]>([]);
  const [loadingSmart, setLoadingSmart] = useState(true);
  const [showSmartPrompt, setShowSmartPrompt] = useState(false);

  useEffect(() => {
    const loadTokenAndSearch = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          Alert.alert("Error", "Authentication required. Please log in.");
          router.push("/");
          return;
        }
        setToken(storedToken);

        if (query) {
          setSearchQuery(query);
          setTimeout(() => {
            handleSearch();
          }, 100);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadTokenAndSearch();
  }, [query]);

  useEffect(() => {
    if (token && query) {
      handleSearch();
    }
  }, [token]);

  // ✅ Smart Recs loader
  useEffect(() => {
    const fetchSmartFeed = async () => {
      try {
        const stored = await AsyncStorage.getItem("savedRecipes");
        const parsed = stored ? JSON.parse(stored) : [];

        const response = await fetch(`${API_URL}/smartfeed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ savedRecipes: parsed }),
        });

        const data = await response.json();

        if (data.showSmartRecommendations) {
          setSmartRecommendations(data.smartRecommendations);
          setShowSmartPrompt(false);
        } else {
          setShowSmartPrompt(true);
        }
      } catch (error) {
        console.error("Error fetching smart recommendations:", error);
      } finally {
        setLoadingSmart(false);
      }
    };

    fetchSmartFeed();
  }, [token]);

>>>>>>> Stashed changes
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isFilterVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFilterVisible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    if (!token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchQuery,
        ...(filters.price_range && { price_range: filters.price_range }),
        ...(filters.time_range && { time_range: filters.time_range }),
        ...(filters.meal_type && { meal_type: filters.meal_type }),
      });

      const url = `${API_URL}/recipes?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status !== 200) throw new Error(data.error || "Failed to fetch recipes");

      setRecipes(data.results || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
      Alert.alert("Error", "Failed to search recipes. Please try again.");
    }
    setLoading(false);
  }, [searchQuery, token, filters]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await handleSearch();
    setRefreshing(false);
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCard}>
      <TouchableOpacity 
        onPress={() => router.push(`/recipeDetail/${item.id}`)}
        style={styles.recipeContent}
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
        {item.match_score !== undefined && (
          <Text style={{ paddingLeft: 12, color: "#888" }}>
            💡 Match Score: {item.match_score}%
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.addToCartContainer}>
        <AddToCart recipe={item} />
      </View>
    </View>
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
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setIsFilterVisible(!isFilterVisible)}
            >
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="chevron-down" size={24} color="#007BFF" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {isFilterVisible && (
          <RecipeFilter
            currentFilters={filters}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* ✨ Smart Recommendations */}
        {loadingSmart ? (
          <ActivityIndicator size="small" color="#888" />
        ) : showSmartPrompt ? (
          <View style={{ padding: 16 }}>
            <Text>🚀 Save at least 3 recipes to unlock Smart Recommendations!</Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
              ✨ Smart Recommendations
            </Text>
            <FlatList
              horizontal
              data={smartRecommendations}
              keyExtractor={(item) => item.id?.toString() ?? item.title}
              renderItem={renderRecipeItem}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Regular Recipes */}
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipeItem}
            contentContainerStyle={styles.recipeList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007BFF"]} />
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
  filterButton: {
    marginLeft: 10,
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recipeList: {
    padding: 15,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 240
  },
  recipeContent: {
    width: "100%",
  },
  recipeImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 12,
    color: "#333",
  },
  addToCartContainer: {
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
