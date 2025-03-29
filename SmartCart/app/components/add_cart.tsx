import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface Recipe {
  id: number;
  title: string;
  image: string;
}

interface KrogerIngredient {
  name: string;
  productId: string;
  upc: string;
  description: string;
  brand: string;
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

interface CartItem {
  recipe: Recipe;
  krogerIngredients: KrogerIngredient[];
  totalPrice: number;
}

export default function AddToCart({ recipe }: { recipe: Recipe }) {
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in.');
        return;
      }

      // Fetch Kroger ingredients for the recipe
      const response = await fetch(`${API_URL}/kroger/recipe/${recipe.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Kroger ingredients');
      }

      const data = await response.json();
      const { ingredients: krogerIngredients, totalPrice } = data;

      // Get current cart items
      const storedCart = await AsyncStorage.getItem('cartRecipes');
      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      // Check if recipe already exists
      const alreadyExists = cart.some(item => item.recipe.id === recipe.id);
      if (alreadyExists) {
        Alert.alert('Info', 'Recipe is already in your cart.');
        return;
      }

      // Add new item to cart
      const newCartItem: CartItem = {
        recipe,
        krogerIngredients,
        totalPrice,
      };

      cart.push(newCartItem);
      await AsyncStorage.setItem('cartRecipes', JSON.stringify(cart));
      Alert.alert('Added', 'Recipe added to your cart with Kroger ingredients.');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add recipe to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.addButton, loading && styles.addButtonDisabled]}
      onPress={addToCart}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons name="cart-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
}); 