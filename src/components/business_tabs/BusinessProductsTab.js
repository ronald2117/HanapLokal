
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProductCard from "../ProductCard";
import { db } from "../../services/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../../styles/theme";

const BusinessProductsTab = ({ store, navigation, isMyStore = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      where("storeId", "==", store.id)
    );

    const unsubscribe = onSnapshot(productsQuery, (querySnapshot) => {
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store.id]);

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() =>
        navigation?.navigate(isMyStore ? "EditProduct" : "ProductDetails", {
          product: item,
          storeId: store.id,
        })
      }
      showEditIcon={isMyStore}
    />
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t("loadingProducts")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isMyStore && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddProduct", { storeId: store.id })
          }
        >
          <Ionicons name="add-circle-outline" size={24} color={Colors.background.primary} />
          <Text style={styles.addButtonText}>{t("addProduct")}</Text>
        </TouchableOpacity>
      )}
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={Colors.text.light} />
          <Text style={styles.emptyText}>{t("noProductsAvailable")}</Text>
        </View>
      )}
    </View>
  );
};

export default BusinessProductsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.base,
    backgroundColor: Colors.background.secondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.base,
  },
  addButtonText: {
    color: Colors.text.white,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  productRow: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.light,
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
