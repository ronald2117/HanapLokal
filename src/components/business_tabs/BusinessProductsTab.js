import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "../ProductCard";
import { db } from "../../services/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

const BusinessProductsTab = ({ store, navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsQuery = query(
        collection(db, "products"),
        where("storeId", "==", store.id)
      );
      const querySnapshot = await getDocs(productsQuery);
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
    } catch (error) {
      // Optionally handle error
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation?.navigate("ProductDetails", { product: item })}
    />
  );

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{t("products") || "Products"}</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("loadingProducts") || "Loading products..."}</Text>
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsGrid}
        />
      ) : (
        <View style={styles.emptyProducts}>
          <Ionicons name="cube-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>{t("noProductsAvailable") || "No products available."}</Text>
        </View>
      )}
    </View>
  );
};

export default BusinessProductsTab;

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#777",
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  productsGrid: {
    paddingBottom: 16,
  },
});