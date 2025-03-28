import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface KrogerItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  recipe_id: string;
  recipe_name: string;
  ingredient_name: string;
  kroger_item: KrogerItem;
}

interface Order {
  id: string;
  order_number: string;
  total_price: number;
  status: string;
  items_count: number;
  created_at: string;
  items?: OrderItem[];
  shipping_info?: any;
  payment_info?: any;
}

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view order history');
      }

      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to view order details');
      }

      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      setSelectedOrder(data);
      setShowDetails(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login to cancel order');
      }

      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      Alert.alert('Success', 'Order canceled successfully');
      setShowDetails(false);
      fetchOrders(); // Refresh the orders list
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'canceled':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRecipePress = (recipeId: string) => {
    setShowDetails(false); // Close the modal
    router.push(`/recipeDetail/${recipeId}`);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => fetchOrderDetails(item.id)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.orderItems}>{item.items_count} items</Text>
      </View>
      <View style={styles.orderTotal}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${item.total_price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  const OrderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {detailsLoading ? (
            <ActivityIndicator size="large" color="#2D6A4F" />
          ) : selectedOrder ? (
            <ScrollView style={styles.detailsScrollView}>
              <View style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsOrderNumber}>
                    Order #{selectedOrder.order_number}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedOrder.status) }
                  ]}>
                    <Text style={styles.statusText}>{selectedOrder.status}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Recipes:</Text>
                {selectedOrder.items?.reduce((recipes, item) => {
                  // Group items by recipe_id
                  const existingRecipe = recipes.find(r => r.recipe_id === item.recipe_id);
                  if (existingRecipe) {
                    existingRecipe.ingredients.push(item);
                  } else {
                    recipes.push({
                      recipe_id: item.recipe_id,
                      recipe_name: item.recipe_name || 'Unknown Recipe',
                      ingredients: [item]
                    });
                  }
                  return recipes;
                }, [] as { recipe_id: string; recipe_name: string; ingredients: OrderItem[] }[])
                .map((recipe, recipeIndex) => (
                  <View key={recipeIndex} style={styles.recipeCard}>
                    <TouchableOpacity 
                      style={styles.recipeHeader}
                      onPress={() => handleRecipePress(recipe.recipe_id)}
                    >
                      <Text style={styles.recipeName}>
                        {recipe.recipe_name || 'Unknown Recipe'}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#2D6A4F" />
                    </TouchableOpacity>
                    <View style={styles.ingredientsList}>
                      {recipe.ingredients.map((ingredient, ingredientIndex) => (
                        <View key={ingredientIndex} style={styles.ingredientItem}>
                          <View style={styles.ingredientInfo}>
                            <Text style={styles.ingredientName}>
                              {ingredient.ingredient_name}
                            </Text>
                            <Text style={styles.ingredientQuantity}>
                              x{ingredient.kroger_item.quantity}
                            </Text>
                          </View>
                          <Text style={styles.itemPrice}>
                            ${(ingredient.kroger_item.price * ingredient.kroger_item.quantity).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.recipeTotal}>
                      <Text style={styles.recipeTotalLabel}>Recipe Total:</Text>
                      <Text style={styles.recipeTotalAmount}>
                        ${recipe.ingredients.reduce((total, item) => 
                          total + (item.kroger_item.price * item.kroger_item.quantity), 0
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}

                <View style={styles.totalSection}>
                  <Text style={styles.totalText}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>
                    ${selectedOrder.total_price.toFixed(2)}
                  </Text>
                </View>

                {selectedOrder.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      Alert.alert(
                        'Cancel Order',
                        'Are you sure you want to cancel this order?',
                        [
                          { text: 'No', style: 'cancel' },
                          { 
                            text: 'Yes',
                            onPress: () => handleCancelOrder(selectedOrder.id),
                            style: 'destructive'
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#2D6A4F" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
      <OrderDetailsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3E6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  orderItems: {
    fontSize: 13,
    color: '#666',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 6,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  detailsScrollView: {
    maxHeight: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsOrderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D6A4F',
    flex: 1,
  },
  ingredientsList: {
    marginLeft: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2D6A4F',
  },
  recipeTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recipeTotalLabel: {
    fontSize: 15,
    color: '#4B5563',
    marginRight: 8,
  },
  recipeTotalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D6A4F',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    marginTop: 16,
  },
}); 