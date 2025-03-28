import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type RecipeType = {
  id: number;
  title: string;
  image: string;
};

export default function CartScreen() {
  const [cartRecipes, setCartRecipes] = useState<RecipeType[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCart = async () => {
      const storedCart = await AsyncStorage.getItem("cartRecipes");
      if (storedCart) {
        setCartRecipes(JSON.parse(storedCart));
      }
    };

    loadCart();
  }, []);

  const removeFromCart = async (recipeId: number) => {
    const updatedCart = cartRecipes.filter((recipe) => recipe.id !== recipeId);
    setCartRecipes(updatedCart);
    await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
    Alert.alert("Removed", "Recipe removed from cart.");
  };

  const renderItem = ({ item }: { item: RecipeType }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipeDetail/${item.id}`)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.textRow}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Back Button */}
      <TouchableOpacity onPress={() => router.replace("/(tabs)/home")} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#2D6A4F" />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🛒 Your Cart</Text>

      {cartRecipes.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cartRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F3E6",
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2D6A4F",
    fontWeight: "bold",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2D6A4F",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
    marginTop: 50,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
    elevation: 3,
  },
  recipeImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
