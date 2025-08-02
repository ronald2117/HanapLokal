import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useFocusEffect } from "@react-navigation/native";
import ProductCard from "../components/ProductCard";
import { getProfileTypeInfo } from "../config/categories";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../styles/theme";
import BusinessDetailsTab from "../components/business_tabs/BusinessDetailsTab";
import BusinessServicesTab from "../components/business_tabs/BusinessServicesTab";
import BusinessBookingsTab from "../components/business_tabs/BusinessBookingsTab";
import BusinessPortfolioTab from "../components/business_tabs/BusinessPortfolioTab";
import BusinessLaborTab from "../components/business_tabs/BusinessLaborTab";
import BusinessProductsTab from "../components/business_tabs/BusinessProductsTab";

export default function MyStoreScreen({ navigation }) {
  const [myBusinessProfile, setMyBusinessProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, isGuestUser, logoutGuestAndSignup } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("details");

  const fetchMyBusinessProfile = async () => {
    try {
      setLoading(true);
      const businessProfilesQuery = query(
        collection(db, "businessProfiles"),
        where("ownerId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(businessProfilesQuery);

      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        setMyBusinessProfile({ id: profileDoc.id, ...profileDoc.data() });
      } else {
        setMyBusinessProfile(null);
      }
    } catch (error) {
      Alert.alert(t("error"), t("failedToFetchStore"));
      console.error("Error fetching business profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        fetchMyBusinessProfile();
      }
    }, [currentUser])
  );

  useEffect(() => {
    if (myBusinessProfile) {
      // Reset tab to details when profile changes
      setActiveTab("details");
    }
  }, [myBusinessProfile]);

  const fetchMyProducts = async () => {
    if (!myBusinessProfile) return;
    try {
      const productsQuery = query(
        collection(db, "products"),
        where("storeId", "==", myBusinessProfile.id)
      );
      const querySnapshot = await getDocs(productsQuery);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (error) {
      Alert.alert(t("error"), t("failedToFetchProducts"));
      console.error("Error fetching products:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser) {
      await fetchMyBusinessProfile();
    }
    setRefreshing(false);
  };

  function getTabsForProfile(store) {
    const profileType = getProfileTypeInfo(
      store.profileType || store.primaryType
    );
    const tabs = [
      {
        key: "details",
        label: "Details",
        component: BusinessDetailsTab,
      },
    ];
    if (profileType && profileType.canHave) {
      profileType.canHave.forEach((type) => {
        if (type === "products") {
          tabs.push({
            key: "products",
            label: "Products",
            component: BusinessProductsTab,
          });
        }
        if (type === "services") {
          tabs.push({
            key: "services",
            label: "Services",
            component: BusinessServicesTab,
          });
        }
        if (type === "bookings") {
          tabs.push({
            key: "bookings",
            label: "Bookings",
            component: BusinessBookingsTab,
          });
        }
        if (type === "portfolio") {
          tabs.push({
            key: "portfolio",
            label: "Portfolio",
            component: BusinessPortfolioTab,
          });
        }
        if (type === "labor") {
          tabs.push({
            key: "labor",
            label: "Labor",
            component: BusinessLaborTab,
          });
        }
      });
    }
    return tabs;
  }

  const tabs = myBusinessProfile ? getTabsForProfile(myBusinessProfile) : [];

  const renderTabContent = () => {
    const tab = tabs.find((t) => t.key === activeTab);
    if (!tab) return null;

    const TabComponent = tab.component;
    if (!TabComponent) return null;

    return (
      <TabComponent
        store={myBusinessProfile}
        navigation={navigation}
        isMyStore={true}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  if (!myBusinessProfile) {
    if (isGuestUser()) {
      return (
        <View style={styles.noStoreContainer}>
          <Ionicons name="person-outline" size={80} color="#FF6B35" />
          <Text style={styles.guestTitle}>{t("guestUser")}</Text>
          <Text style={styles.guestText}>{t("guestWelcomeMessage")}</Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>
              {t("registrationBenefits")}
            </Text>
            <View style={styles.benefitItem}>
              <Ionicons name="storefront" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t("ownStore")}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cube" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t("sellProducts")}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t("getCustomers")}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="cash" size={20} color="#FF6B35" />
              <Text style={styles.benefitText}>{t("earnFromBusiness")}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={async () => {
              await AsyncStorage.setItem("pendingSignup", "true");
              await logoutGuestAndSignup();
            }}
          >
            <Text style={styles.signupButtonText}>
              {t("registerForStore")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color="#3498db" />
            <Text style={styles.refreshButtonText}>
              {refreshing ? t("refreshing") : t("refresh")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.noStoreContainer}>
        <Ionicons name="storefront-outline" size={80} color="#bdc3c7" />
        <Text style={styles.noStoreTitle}>{t("noStoreYet")}</Text>
        <Text style={styles.noStoreText}>{t("createStoreDescription")}</Text>
        <TouchableOpacity
          style={styles.createStoreButton}
          onPress={() => navigation.navigate("CreateStore")}
        >
          <Text style={styles.createStoreButtonText}>{t("createStore")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshButtonText}>
            {refreshing ? t("refreshing") : t("refresh")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3498db"]}
          tintColor="#3498db"
        />
      }
    >
      <View style={styles.heroSection}>
        {myBusinessProfile.coverImage ? (
          <Image
            source={{ uri: myBusinessProfile.coverImage }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        <View style={styles.profileSection}>
          <View style={styles.profileAndActionsContainer}>
            <View style={styles.profileContainer}>
              {myBusinessProfile.profileImage ? (
                <Image
                  source={{ uri: myBusinessProfile.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {myBusinessProfile.name
                      ? myBusinessProfile.name.charAt(0).toUpperCase()
                      : "?"}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.actionButtons}>
              <View style={styles.horizontalActionsRow}>
                <TouchableOpacity
                  style={styles.roundActionButton}
                  onPress={() =>
                    navigation.navigate("StoreMap", { stores: [myBusinessProfile] })
                  }
                >
                  <Ionicons name="map" size={18} color="#27ae60" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={() =>
                    navigation.navigate("StoreSettings", {
                      businessProfile: myBusinessProfile,
                    })
                  }
                >
                  <Ionicons name="settings" size={24} color="#2c3e50" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.storeBasicInfo}>
            <Text style={styles.storeName}>{myBusinessProfile.name}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.customTab,
              activeTab === tab.key && styles.customTabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.customTabLabel,
                activeTab === tab.key && styles.customTabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View>{renderTabContent()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noStoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  noStoreTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  noStoreText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 30,
  },
  createStoreButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: "#3498db",
    marginLeft: 5,
    fontWeight: "600",
  },
  heroSection: {
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#ecf0f1",
  },
  coverPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#ecf0f1",
  },
  profileSection: {
    backgroundColor: "#fff",
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  profileAndActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  profileContainer: {
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#f8f9fa",
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  actionButtons: {
    marginTop: -20,
    paddingLeft: 10,
  },
  horizontalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  roundActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeBasicInfo: {
    alignItems: "center",
    marginBottom: 0,
  },
  storeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  productsSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 1,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27ae60",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },
  productRow: {
    justifyContent: "space-between",
  },
  emptyProducts: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  guestText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  benefitsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#e9ecef",
    width: "100%",
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 5,
  },
  benefitText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 12,
    flex: 1,
  },
  signupButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: 15,
    ...Shadows.base,
  },
  signupButtonText: {
    color: "white",
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  customTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  customTabActive: {
    borderBottomColor: "#3498db",
    backgroundColor: "#fff",
  },
  customTabLabel: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  customTabLabelActive: {
    color: "#3498db",
  },
});
