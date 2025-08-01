import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "../components/Toast";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { getProfileTypeInfo} from "../config/categories";
import BusinessDetailsTab from "../components/business_tabs/BusinessDetailsTab";
import BusinessProductsTab from "../components/business_tabs/BusinessProductsTab";
import BusinessServicesTab from "../components/business_tabs/BusinessServicesTab";
import BusinessBookingsTab from "../components/business_tabs/BusinessBookingsTab";
import BusinessPortfolioTab from "../components/business_tabs/BusinessPortfolioTab";
import BusinessLaborTab from "../components/business_tabs/BusinessLaborTab";

export default function StoreDetailsScreen({ route, navigation }) {
  const { store } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { t } = useLanguage();
  const { currentUser, userProfile, isGuestUser } = useAuth();

  // Build tabs dynamically
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

  // Only keep logic for favorite, chat, and report actions here
  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.includes(store.id));
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        favoritesArray = favoritesArray.filter((id) => id !== store.id);
      } else {
        favoritesArray.push(store.id);
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      Alert.alert("Error", "Failed to update favorites");
      console.error("Error updating favorites:", error);
    }
  };

  const startChatWithStore = async () => {
    if (isGuestUser()) {
      Alert.alert(
        "Sign Up Required",
        "You need to create an account to chat with stores.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Up",
            onPress: () => navigation.navigate("Auth", { screen: "Signup" }),
          },
        ]
      );
      return;
    }

    try {
      if (!store.ownerId) {
        Alert.alert(
          "Error",
          "Cannot start chat - store owner information is missing."
        );
        return;
      }

      if (store.ownerId === currentUser.uid) {
        Alert.alert("Error", "You cannot chat with your own store.");
        return;
      }

      setChatLoading(true);

      // Check if conversation already exists
      const conversationsRef = collection(db, "conversations");
      const existingQuery = query(
        conversationsRef,
        where("participants", "array-contains", currentUser.uid)
      );

      const existingSnapshot = await getDocs(existingQuery);
      let existingConversation = null;

      existingSnapshot.forEach((doc) => {
        const conversationData = doc.data();
        if (conversationData.participants.includes(store.ownerId)) {
          existingConversation = { id: doc.id, ...conversationData };
        }
      });

      if (existingConversation) {
        // Navigate to existing conversation using nested navigation
        navigation.navigate("Chats", {
          screen: "ChatDetail",
          params: {
            conversationId: existingConversation.id,
            otherParticipant: {
              uid: store.ownerId,
              name: store.ownerName || "Store Owner",
              storeName: store.name,
              profileImage: store.profileImage || null,
              isStore: true,
            },
          },
        });
        return;
      }

      // Create new conversation
      const conversationData = {
        participants: [currentUser.uid, store.ownerId],
        participantsInfo: [
          {
            uid: currentUser.uid,
            name: userProfile?.firstName
              ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
              : currentUser.email || "Customer",
            profileImage: userProfile?.profileImage || null,
            isStore: false,
          },
          {
            uid: store.ownerId,
            name: store.ownerName || "Store Owner",
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true,
          },
        ],
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [currentUser.uid]: 0,
          [store.ownerId]: 0,
        },
      };

      const docRef = await addDoc(conversationsRef, conversationData);

      // Navigate to the new conversation using nested navigation
      navigation.navigate("Chats", {
        screen: "ChatDetail",
        params: {
          conversationId: docRef.id,
          otherParticipant: {
            uid: store.ownerId,
            name: store.ownerName || "Store Owner",
            storeName: store.name,
            profileImage: store.profileImage || null,
            isStore: true,
          },
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleReportStore = () => {
    if (isGuestUser()) {
      Alert.alert(
        "Sign Up Required",
        "You need to create an account to report stores.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign Up",
            onPress: () => navigation.navigate("Auth", { screen: "Signup" }),
          },
        ]
      );
      return;
    }

    const reportReasons = [
      { key: "inappropriate_content", label: "Inappropriate Content" },
      { key: "false_information", label: "False Information" },
      { key: "spam", label: "Spam" },
      { key: "harassment", label: "Harassment" },
      { key: "fraud", label: "Fraudulent Activity" },
      { key: "closed_permanently", label: "Store Permanently Closed" },
      { key: "wrong_location", label: "Wrong Location" },
      { key: "other", label: "Other" },
    ];

    Alert.alert(
      "Report Store",
      "Why are you reporting this store?",
      [
        { text: "Cancel", style: "cancel" },
        ...reportReasons.map((reason) => ({
          text: reason.label,
          onPress: () => submitReport(reason.key, reason.label),
        })),
      ],
      { cancelable: true }
    );
  };

  const submitReport = async (reasonKey, reasonLabel) => {
    try {
      const reportData = {
        storeId: store.id,
        storeName: store.name,
        storeOwnerId: store.ownerId,
        reportedBy: currentUser.uid,
        reporterName: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
          : currentUser.email || "User",
        reason: reasonKey,
        reasonLabel: reasonLabel,
        createdAt: serverTimestamp(),
        status: "pending", // pending, reviewed, resolved, dismissed
        additionalInfo: null,
      };

      await addDoc(collection(db, "storeReports"), reportData);

      Alert.alert(
        "Report Submitted",
        "Thank you for your report. Our team will review it and take appropriate action.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  useEffect(() => {
    checkIfFavorite();
  }, []);

  // Manual refresh function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkIfFavorite();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const tabs = getTabsForProfile(store);
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const renderTabContent = () => {
    const tab = tabs.find((t) => t.key === activeTab);
    if (!tab) return null;
    const TabComponent = tab.component;
    return <TabComponent store={store} navigation={navigation} />;
  };

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
      {/* Hero/Profile Section */}
      <View style={styles.heroSection}>
        {store.coverImage ? (
          <Image source={{ uri: store.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        <View style={styles.profileSection}>
          <View style={styles.profileAndActionsContainer}>
            <View style={styles.profileContainer}>
              {store.profileImage ? (
                <Image
                  source={{ uri: store.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {store.name ? store.name.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
              )}
            </View>
            {/* --- ACTION BUTTONS (restored) --- */}
            <View style={styles.actionButtons}>
              <View style={styles.horizontalActionsRow}>
                {store.ownerId !== currentUser?.uid && (
                  <TouchableOpacity
                    style={styles.roundActionButton}
                    onPress={handleReportStore}
                  >
                    <Ionicons name="flag" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.roundActionButton}
                  onPress={() =>
                    navigation.navigate("StoreMap", { stores: [store] })
                  }
                >
                  <Ionicons name="map" size={18} color="#27ae60" />
                </TouchableOpacity>
                {store.ownerId && store.ownerId !== currentUser?.uid && (
                  <TouchableOpacity
                    style={styles.roundActionButton}
                    onPress={startChatWithStore}
                    disabled={chatLoading}
                  >
                    <Ionicons
                      name={chatLoading ? "hourglass" : "chatbubble"}
                      size={18}
                      color="#3498db"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.roundActionButton}
                  onPress={toggleFavorite}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={18}
                    color={isFavorite ? "#e74c3c" : "#7f8c8d"}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* --- END ACTION BUTTONS --- */}
          </View>
          <View style={styles.storeBasicInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
          </View>
        </View>
      </View>

      {/* Custom Top Tab Bar */}
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
      <View style={{ flex: 1 }}>{renderTabContent()}</View>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
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

  // Hero Section
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

  // Profile Section
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

  // Store Basic Info
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
  profileTypeBadgeContainer: {
    marginBottom: 8,
  },
  profileTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profileTypeBadgeText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#3498db",
    marginLeft: 6,
    fontWeight: "600",
  },

  // Action Buttons
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

  // Content Container
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },

  // Cards
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    color: "#3498db",
    textDecorationLine: "underline",
  },

  // Business Details
  businessDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  businessDetailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
    flex: 1,
  },
  businessDetailValue: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "flex-end",
  },
  businessDetailText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 4,
  },

  // Description
  description: {
    fontSize: 16,
    color: "#7f8c8d",
    lineHeight: 24,
  },

  // Social Links
  primarySocialLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  socialLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialLinkContent: {
    flex: 1,
  },
  socialLinkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  socialLinkUrl: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  socialLinksHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  socialLinksSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  socialLinksGrid: {
    gap: 12,
  },
  socialLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  socialPlatformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  socialLinkDetails: {
    flex: 1,
  },
  socialPlatformName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  socialLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Reviews
  writeReviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  writeReviewText: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  reviewsList: {
    gap: 12,
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7f8c8d",
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#95a5a6",
    marginBottom: 20,
  },
  firstReviewButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  firstReviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Products
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  productsGrid: {
    gap: 12,
  },
  productRow: {
    justifyContent: "space-between",
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 12,
  },

  // Custom Tab Styles
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
