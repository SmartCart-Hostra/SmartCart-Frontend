import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AddToCartProps {
  item: {
    id: string | number;
    name: string;
    price?: number;
    image?: string;
    description?: string;
    brand?: string;
    size?: string;
    soldBy?: string;
  };
}

export default function AddToCart({ item }: AddToCartProps) {
  const addToCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cartRecipes');
      const cartItems = storedCart ? JSON.parse(storedCart) : [];
      
      // Find the grocery recipe in cart
      let groceryRecipe = cartItems.find((cartItem: any) => cartItem.recipe.title === 'Grocery');
      
      if (!groceryRecipe) {
        // Create new grocery recipe if it doesn't exist
        groceryRecipe = {
          recipe: {
            id: 'grocery',
            title: 'Grocery',
            image: 'https://via.placeholder.com/150',
          },
          krogerIngredients: [],
          totalPrice: 0,
          selected: true,
          ingredientQuantities: {}
        };
        cartItems.push(groceryRecipe);
      }

      // Check if item already exists in grocery recipe
      const existingIngredient = groceryRecipe.krogerIngredients.find(
        (ing: any) => ing.productId === item.id.toString()
      );

      if (existingIngredient) {
        // Update quantity if item exists
        groceryRecipe.ingredientQuantities[item.name] = 
          (groceryRecipe.ingredientQuantities[item.name] || 0) + 1;
      } else {
        // Add new item if it doesn't exist
        groceryRecipe.krogerIngredients.push({
          name: item.name,
          productId: item.id.toString(),
          upc: '',
          description: item.description || item.name,
          brand: item.brand || '',
          images: [{
            perspective: 'front',
            featured: true,
            sizes: [{
              size: 'large',
              url: item.image || 'https://via.placeholder.com/150'
            }]
          }],
          items: [{
            itemId: item.id.toString(),
            price: {
              regular: item.price || 0,
              promo: null
            },
            size: item.size || '',
            soldBy: item.soldBy || '',
            inventory: {
              status: 'Available'
            }
          }]
        });
        groceryRecipe.ingredientQuantities[item.name] = 1;
      }

      // Update total price
      groceryRecipe.totalPrice = groceryRecipe.krogerIngredients.reduce((total: number, ing: any) => {
        const quantity = groceryRecipe.ingredientQuantities[ing.name] || 0;
        return total + (ing.items[0].price.regular * quantity);
      }, 0);

      await AsyncStorage.setItem('cartRecipes', JSON.stringify(cartItems));
      Alert.alert('Success', 'Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  return (
    <TouchableOpacity style={styles.addButton} onPress={addToCart}>
      <Ionicons name="cart-outline" size={20} color="#fff" />
      <Text style={styles.buttonText}>Add to Cart</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D6A4F',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
}); 