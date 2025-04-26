import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LogBox } from 'react-native';
import AddToCart from "../components/add_cart";

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text>',
]);

const API_URL = Constants.expoConfig?.extra?.API_URL;

interface KrogerProduct {
  productId: string;
  productPageURI: string;
  aisleLocations: Array<{
    bayNumber: string;
    description: string;
    number: string;
    numberOfFacings: string;
    sequenceNumber: string;
    side: string;
    shelfNumber: string;
    shelfPositionInBay: string;
  }>;
  brand: string;
  categories: string[];
  countryOrigin: string;
  description: string;
  items: Array<{
    itemId: string;
    inventory: {
      stockLevel: string;
    };
    favorite: boolean;
    fulfillment: {
      curbside: boolean;
      delivery: boolean;
      instore: boolean;
      shiptohome: boolean;
    };
    price: {
      regular: number;
      promo: number;
      regularPerUnitEstimate: number;
      promoPerUnitEstimate: number;
    };
    nationalPrice: {
      regular: number;
      promo: number;
      regularPerUnitEstimate: number;
      promoPerUnitEstimate: number;
    };
    size: string;
    soldBy: string;
  }>;
  itemInformation: {
    depth: string;
    height: string;
    width: string;
  };
  temperature: {
    indicator: string;
    heatSensitive: boolean;
  };
  images: Array<{
    id: string;
    perspective: string;
    default: boolean;
    sizes: Array<{
      id: string;
      size: string;
      url: string;
    }>;
  }>;
  upc: string;
}

export default function ProductDetailScreen() {
  const [product, setProduct] = useState<KrogerProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please login to continue");
      }

      const response = await fetch(`${API_URL}/kroger/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product details");
      }

      const data = await response.json();
      if (!data.productId) {
        throw new Error("Invalid product data");
      }

      setProduct(data);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", error.message || "Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Product not found</Text>
        <Text style={styles.errorSubtext}>ID: {String(id ?? '')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal for zoomed image */}
      <Modal visible={!!zoomedImage} transparent={true}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackground} onPress={() => setZoomedImage(null)} />
          {zoomedImage && (
            <>
              <TouchableOpacity style={styles.closeButton} onPress={() => setZoomedImage(null)}>
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
              <Image
                source={{ uri: zoomedImage }}
                style={styles.zoomedImage}
                resizeMode="contain"
              />
            </>
          )}
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D6A4F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.productInfo}>
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <View style={styles.imageSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGallery}>
                {product.images.map((img, index) => (
                  <TouchableOpacity key={index} onPress={() => setZoomedImage(img.sizes[0]?.url)}>
                    <Image
                      source={{ uri: img.sizes[0]?.url }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Basic Info */}
          <View style={styles.basicInfoSection}>
            <Text style={styles.productName}>{product.description}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <AddToCart 
              item={{
                id: product.productId,
                name: product.description,
                price: product.items[0]?.price.regular,
                image: product.images[0]?.sizes[0]?.url,
                description: product.description,
                brand: product.brand,
                size: product.items[0]?.size,
                soldBy: product.items[0]?.soldBy
              }}
            />
          </View>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {product.categories.map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <Text style={styles.categoryName}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>UPC:</Text>
              <Text style={styles.detailValue}>{String(product.upc ?? '')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Country of Origin:</Text>
              <Text style={styles.detailValue}>{String(product.countryOrigin ?? '')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Temperature:</Text>
              <Text style={styles.detailValue}>
                {`${String(product.temperature?.indicator ?? '')}${product.temperature?.heatSensitive ? " (Heat Sensitive)" : ""}`}
              </Text>
            </View>
            {product.itemInformation && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dimensions:</Text>
                    <Text style={styles.detailValue}>
                      {`${String(product.itemInformation.width ?? '')}" × ${String(product.itemInformation.height ?? '')}" × ${String(product.itemInformation.depth ?? '')}"`}
                    </Text>
                </View>
            )}
          </View>

          {/* Available Items */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Available Items</Text>
            {product.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemSize}>{item.size}</Text>
                  <Text style={styles.itemSoldBy}>Sold by: {item.soldBy}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Regular Price:</Text>
                    <Text style={styles.priceValue}>${item.price.regular.toFixed(2)}</Text>
                  </View>
                  {item.price.promo && (
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Promo Price:</Text>
                      <Text style={styles.promoPrice}>${item.price.promo.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.inventoryRow}>
                    <Text style={styles.inventoryLabel}>Stock Level:</Text>
                    <Text style={[
                      styles.inventoryValue,
                      { color: item.inventory.stockLevel === "HIGH" ? "#2D6A4F" : "#FF3B30" }
                    ]}>
                      {String(item.inventory?.stockLevel ?? '')}
                    </Text>
                  </View>
                  <View style={styles.fulfillmentRow}>
                    <Text style={styles.fulfillmentLabel}>Available for:</Text>
                    <View style={styles.fulfillmentOptions}>
                      {item.fulfillment.curbside && <Text style={styles.fulfillmentOption}>Curbside</Text>}
                      {item.fulfillment.delivery && <Text style={styles.fulfillmentOption}>Delivery</Text>}
                      {item.fulfillment.instore && <Text style={styles.fulfillmentOption}>In-Store</Text>}
                      {item.fulfillment.shiptohome && <Text style={styles.fulfillmentOption}>Ship to Home</Text>}
                      {!item.fulfillment.curbside &&
                       !item.fulfillment.delivery &&
                       !item.fulfillment.instore &&
                       !item.fulfillment.shiptohome && (
                         <Text style={styles.fulfillmentOption}>N/A</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Aisle Locations */}
          {product.aisleLocations && product.aisleLocations.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Store Location</Text>
              {product.aisleLocations.map((location, index) => (
                <View key={index} style={styles.locationCard}>
                  <Text style={styles.locationText}>{location.description}</Text>
                  <Text style={styles.locationDetails}>
                    {`Bay ${location.bayNumber}, Shelf ${location.shelfNumber}, Position ${location.shelfPositionInBay}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F3E6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, color: "#FF3B30", marginTop: 12 },
  errorSubtext: { fontSize: 14, color: "#666", marginTop: 8 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee", backgroundColor: "#fff" },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#2D6A4F", marginLeft: 8 },
  content: { flex: 1 },
  productInfo: { padding: 16 },
  imageSection: { width: '100%', height: 300, backgroundColor: '#fff', marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  imageGallery: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productImage: { width: 300, height: 300, borderRadius: 12, marginRight: 12 },
  basicInfoSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  productName: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 8 },
  productBrand: { fontSize: 16, color: "#666", marginBottom: 12 },
  detailsSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#2D6A4F", marginBottom: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  detailLabel: { fontSize: 15, color: "#666" },
  detailValue: { fontSize: 15, color: "#333", fontWeight: "500" },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: { backgroundColor: '#f8f8f8', padding: 8, borderRadius: 8 },
  categoryName: { fontSize: 14, color: '#666' },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemSize: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSoldBy: { fontSize: 14, color: '#666' },
  itemDetails: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  promoPrice: { fontSize: 15, color: '#FF3B30', fontWeight: '500' },
  inventoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  inventoryLabel: { fontSize: 14, color: '#666' },
  inventoryValue: { fontSize: 14, fontWeight: '500' },
  fulfillmentRow: { marginTop: 8 },
  fulfillmentLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  fulfillmentOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fulfillmentOption: { fontSize: 12, color: '#2D6A4F', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  locationCard: { backgroundColor: '#f8f8f8', padding: 12, borderRadius: 8, marginBottom: 8 },
  locationText: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 4 },
  locationDetails: { fontSize: 13, color: '#666' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  modalBackground: { ...StyleSheet.absoluteFillObject },
  zoomedImage: { width: '90%', height: '90%', borderRadius: 8 },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});