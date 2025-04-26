import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import AddToCart from "../components/add_cart";

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface KrogerProduct {
  productId: string;
  name: string;
  description: string;
  brand: string;
  upc: string;
  images: Array<{
    perspective: string;
    featured?: boolean;
    sizes: Array<{
      size: string;
      url: string;
    }>;
  }>;
  items: Array<{
    itemId: string;
    price: {
      regular: number;
      promo: number | null;
    };
    size: string;
    soldBy: string;
    inventory: {
      status: string;
    };
  }>;
}

export default function GroceryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<KrogerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please login to continue");
      }

      console.log("Searching for:", searchQuery);
      const response = await fetch(`${API_URL}/krogerSearchItem?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      if (!data.products || !Array.isArray(data.products)) {
        console.error("Expected products array but got:", typeof data.products);
        throw new Error("Invalid response format");
      }

      if (data.products.length === 0) {
        console.log("No products found for query:", searchQuery);
      } else {
        console.log("Found", data.products.length, "products");
      }

      setProducts(data.products);
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Error", error.message || "Failed to search products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (product: KrogerProduct) => {
    console.log("Navigating to product:", product.productId);
    router.push(`/productDetail/${product.productId}`);
  };

  const renderProduct = ({ item }: { item: KrogerProduct }) => {
    // Find the featured image or use the first image
    const productImage = item.images.find(img => img.featured) || item.images[0];
    // Get the largest size image URL
    const imageUrl = productImage?.sizes[0]?.url;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.productContent}>
          {imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUrl }}
                style={styles.productImage}
                resizeMode="contain"
                onError={(error) => console.error("Image loading error:", error.nativeEvent)}
              />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.description || item.name}</Text>
            <Text style={styles.productBrand}>{item.brand}</Text>
            <Text style={styles.productSize}>
              {item.items[0]?.size || "N/A"} - {item.items[0]?.soldBy || "N/A"}
            </Text>
            <Text style={styles.productPrice}>
              ${item.items[0]?.price.regular.toFixed(2)}
            </Text>
            <AddToCart 
              item={{
                id: item.productId,
                name: item.description || item.name,
                price: item.items[0]?.price.regular,
                image: imageUrl,
                description: item.description || item.name,
                brand: item.brand,
                size: item.items[0]?.size,
                soldBy: item.items[0]?.soldBy
              }}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color="#2D6A4F" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={searchProducts}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setProducts([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchProducts}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.productId}
          contentContainerStyle={styles.listContainer}
        />
      ) : searchQuery ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#2D6A4F" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={48} color="#2D6A4F" />
          <Text style={styles.emptyText}>Search for products to get started</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  productContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productSize: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2D6A4F",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    padding: 2,
  },
}); 