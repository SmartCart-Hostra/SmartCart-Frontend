import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

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
  recipe: {
    id: number;
    title: string;
    image: string;
  };
  krogerIngredients: KrogerIngredient[];
  totalPrice: number;
  selected: boolean;
  ingredientQuantities: { [key: string]: number };
}

interface ShippingInfo {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

interface PaymentInfo {
  cardholder_name: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardholder_name: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
  });
  const router = useRouter();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("cartRecipes");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          // Filter out any invalid items and add default values for new fields
          const validCartItems = parsedCart.filter((item: any) => 
            item && 
            item.recipe && 
            item.recipe.id && 
            item.recipe.title && 
            item.recipe.image &&
            Array.isArray(item.krogerIngredients) &&
            typeof item.totalPrice === 'number'
          ).map((item: any) => ({
            ...item,
            selected: item.selected || false,
            ingredientQuantities: item.ingredientQuantities || Object.fromEntries(
              item.krogerIngredients.map((ing: KrogerIngredient) => [ing.name, 1])
            )
          }));
          setCartItems(validCartItems);
          // Update storage with only valid items
          if (validCartItems.length !== parsedCart.length) {
            await AsyncStorage.setItem("cartRecipes", JSON.stringify(validCartItems));
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        Alert.alert("Error", "Failed to load cart. Please try again.");
      }
    };

    loadCart();
  }, []);

  const updateCartItem = async (updatedItem: CartItem) => {
    try {
      const updatedCart = cartItems.map(item => 
        item.recipe.id === updatedItem.recipe.id ? updatedItem : item
      );
      setCartItems(updatedCart);
      await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating cart:", error);
      Alert.alert("Error", "Failed to update cart. Please try again.");
    }
  };

  const removeFromCart = async (recipeId: number) => {
    try {
      const updatedCart = cartItems.filter((item) => item.recipe.id !== recipeId);
      setCartItems(updatedCart);
      await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
      Alert.alert("Removed", "Recipe removed from cart.");
    } catch (error) {
      console.error("Error removing from cart:", error);
      Alert.alert("Error", "Failed to remove item from cart. Please try again.");
    }
  };

  const toggleRecipeSelection = (recipeId: number) => {
    const updatedCart = cartItems.map(item => 
      item.recipe.id === recipeId 
        ? { ...item, selected: !item.selected }
        : item
    );
    setCartItems(updatedCart);
  };

  const updateIngredientQuantity = async (recipeId: number, ingredientName: string, change: number) => {
    try {
      const updatedCart = cartItems.map(item => {
        if (item.recipe.id === recipeId) {
          const currentQuantity = item.ingredientQuantities[ingredientName] || 1;
          const newQuantity = Math.max(0, currentQuantity + change);
          return {
            ...item,
            ingredientQuantities: {
              ...item.ingredientQuantities,
              [ingredientName]: newQuantity
            }
          };
        }
        return item;
      });
      setCartItems(updatedCart);
      await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error updating ingredient quantity:", error);
      Alert.alert("Error", "Failed to update ingredient quantity. Please try again.");
    }
  };

  const removeIngredient = async (recipeId: number, ingredientName: string) => {
    try {
      const updatedCart = cartItems.map(item => {
        if (item.recipe.id === recipeId) {
          return {
            ...item,
            krogerIngredients: item.krogerIngredients.filter(ing => ing.name !== ingredientName),
            ingredientQuantities: {
              ...item.ingredientQuantities,
              [ingredientName]: 1
            }
          };
        }
        return item;
      });
      setCartItems(updatedCart);
      await AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error removing ingredient:", error);
      Alert.alert("Error", "Failed to remove ingredient. Please try again.");
    }
  };

  const calculateItemTotalPrice = (item: CartItem) => {
    return item.krogerIngredients.reduce((total, ingredient) => {
      const quantity = item.ingredientQuantities[ingredient.name] || 0;
      if (quantity === 0) return total;
      
      const price = ingredient.items[0]?.price.regular || 0;
      return total + (price * quantity);
    }, 0);
  };

  const renderKrogerIngredients = (item: CartItem) => (
    <View style={styles.ingredientsContainer}>
      {item.krogerIngredients.map((ingredient, index) => {
        const quantity = item.ingredientQuantities[ingredient.name] || 1;
        if (quantity === 0) return null; // Don't render ingredients with 0 quantity
        
        return (
          <View key={index} style={styles.ingredientItem}>
            <View style={styles.ingredientMainContent}>
              <Text style={styles.ingredientName}>{ingredient.description || ingredient.name}</Text>
              <Text style={styles.ingredientDetails}>
                {ingredient.brand} - {ingredient.items[0]?.size || 'N/A'}
              </Text>
              <Text style={styles.ingredientPrice}>
                ${(ingredient.items[0]?.price.regular * quantity).toFixed(2)}
              </Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={() => updateIngredientQuantity(item.recipe.id, ingredient.name, -1)}
                style={styles.quantityButton}
              >
                <Ionicons name="remove-circle-outline" size={24} color="#2D6A4F" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {quantity}
              </Text>
              <TouchableOpacity 
                onPress={() => updateIngredientQuantity(item.recipe.id, ingredient.name, 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="add-circle-outline" size={24} color="#2D6A4F" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => removeIngredient(item.recipe.id, ingredient.name)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleRecipeSelection(item.recipe.id)}
        >
          <Ionicons 
            name={item.selected ? "checkbox" : "square-outline"} 
            size={24} 
            color="#2D6A4F" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/recipeDetail/${item.recipe.id}`)}
          style={styles.recipeContent}
        >
          <Image source={{ uri: item.recipe.image }} style={styles.recipeImage} />
          <View style={styles.textRow}>
            <Text style={styles.recipeTitle}>{item.recipe.title}</Text>
            <TouchableOpacity 
              onPress={() => removeFromCart(item.recipe.id)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.krogerSection}>
        <Text style={styles.krogerTitle}>🛒 Kroger Ingredients</Text>
        {renderKrogerIngredients(item)}
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Total Price:</Text>
          <Text style={styles.totalPrice}>
            ${calculateItemTotalPrice(item).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const calculateTotalCartPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item.selected) return total;
      return total + calculateItemTotalPrice(item);
    }, 0);
  };

  const selectedItemsCount = cartItems.filter(item => item.selected).length;

  const handleCheckout = async () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert("Error", "Please select items to checkout");
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please login to continue");
      }

      const response = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipe_items: selectedItems.map(item => ({
            recipe_id: item.recipe.id,
            recipe_name: item.recipe.title,
            ingredients: item.krogerIngredients.map(ing => ({
              name: ing.name,
              quantity: item.ingredientQuantities[ing.name] || 1,
              kroger_item: {
                productId: ing.productId,
                description: ing.description,
                items: [{
                  price: {
                    regular: ing.items[0]?.price.regular || 0
                  }
                }]
              }
            }))
          })),
          shipping_info: shippingInfo,
          payment_info: paymentInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      Alert.alert(
        "Success",
        `Order placed successfully! Order number: ${data.order_number}`,
        [
          {
            text: "OK",
            onPress: () => {
              setShowCheckoutModal(false);
              // Only remove selected items from the cart
              const updatedCart = cartItems.filter(item => !item.selected);
              setCartItems(updatedCart);
              AsyncStorage.setItem("cartRecipes", JSON.stringify(updatedCart));
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCheckoutModal = () => (
    <Modal
      visible={showCheckoutModal}
      animationType="slide"
      onRequestClose={() => setShowCheckoutModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setShowCheckoutModal(false);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#2D6A4F" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Checkout</Text>
          </View>

          <ScrollView 
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Shipping Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={shippingInfo.full_name}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, full_name: text })}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={shippingInfo.email}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
                keyboardType="email-address"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={shippingInfo.phone}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Address Line 1"
                value={shippingInfo.address_line1}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, address_line1: text })}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                value={shippingInfo.city}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="State"
                value={shippingInfo.state}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, state: text })}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Postal Code"
                value={shippingInfo.postal_code}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, postal_code: text })}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                value={paymentInfo.cardholder_name}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardholder_name: text })}
                returnKeyType="next"
              />
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={paymentInfo.card_number}
                onChangeText={(text) => setPaymentInfo({ ...paymentInfo, card_number: text })}
                keyboardType="numeric"
                returnKeyType="next"
              />
              <View style={styles.paymentRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="MM/YY"
                  value={paymentInfo.expiry_date}
                  onChangeText={(text) => setPaymentInfo({ ...paymentInfo, expiry_date: text })}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="CVV"
                  value={paymentInfo.cvv}
                  onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cvv: text })}
                  keyboardType="numeric"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                ${calculateTotalCartPrice().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#2D6A4F" />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🛒 Your Cart</Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.recipe.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <View style={styles.cartTotalContainer}>
            <View style={styles.selectedItemsInfo}>
              <Text style={styles.selectedItemsText}>
                {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} selected
              </Text>
            </View>
            <View style={styles.totalPriceRow}>
              <Text style={styles.cartTotalLabel}>Cart Total:</Text>
              <Text style={styles.cartTotalPrice}>
                ${calculateTotalCartPrice().toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setShowCheckoutModal(true)}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {renderCheckoutModal()}
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
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    padding: 15,
  },
  recipeContent: {
    flex: 1,
  },
  recipeImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  krogerSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  krogerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 8,
  },
  ingredientsContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  ingredientItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientMainContent: {
    flex: 1,
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ingredientDetails: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  ingredientPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D6A4F",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D6A4F",
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: "center",
  },
  totalPriceContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  cartTotalContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 15,
  },
  selectedItemsInfo: {
    marginBottom: 10,
  },
  selectedItemsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  totalPriceRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginRight: 8,
  },
  cartTotalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F3E6",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginLeft: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  checkoutButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
