import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReviewCard from "../ReviewCard";
import ProductCard from "../ProductCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProfileTypeInfo, getCategoryInfo } from "../../config/categories";
import { db } from "../../services/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const BusinessDetailsTab = ({ store, navigation, isMyStore = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(
        collection(db, "storeReviews"),
        where("storeId", "==", store.id),
        orderBy("createdAt", "desc"),
        limit(3)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];
      let totalRating = 0;
      let count = 0;
      let userReviewed = false;

      querySnapshot.forEach((doc) => {
        const reviewData = doc.data();
        reviewsData.push({ id: doc.id, ...reviewData });
        totalRating += reviewData.rating;
        count++;
        if (currentUser && reviewData.userId === currentUser.uid) {
          userReviewed = true;
        }
      });

      setReviews(reviewsData);
      setReviewCount(count);
      setAverageRating(count > 0 ? totalRating / count : 0);
      setUserHasReviewed(userReviewed);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const openSocialLink = (url) => {
    if (url) {
      const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert("Error", "Could not open this link");
      });
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: "logo-facebook",
      instagram: "logo-instagram",
      twitter: "logo-twitter",
      youtube: "logo-youtube",
      tiktok: "logo-tiktok",
      linkedin: "logo-linkedin",
      whatsapp: "logo-whatsapp",
      telegram: "send",
      viber: "call",
      shopee: "storefront",
      lazada: "bag",
      link: "link",
    };
    return icons[platform] || "link";
  };

  const getPlatformColor = (platform) => {
    const colors = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      twitter: "#1DA1F2",
      youtube: "#FF0000",
      tiktok: "#000000",
      linkedin: "#0A66C2",
      whatsapp: "#25D366",
      telegram: "#0088CC",
      viber: "#665CAC",
      shopee: "#FF5722",
      lazada: "#0F146D",
      link: "#6B7280",
    };
    return colors[platform] || "#6B7280";
  };

  return (
    <View>
      <View style={styles.contentContainer}>
        {/* Store Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#3498db" />
            <Text style={styles.infoText}>{store.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#3498db" />
            <Text style={styles.infoText}>{store.hours}</Text>
          </View>
          {store.contact && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#3498db" />
              <Text style={styles.infoText}>{store.contact}</Text>
            </View>
          )}
          {store.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#3498db" />
              <Text style={styles.infoText}>{store.email}</Text>
            </View>
          )}
          {store.website && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => openSocialLink(store.website)}
            >
              <Ionicons name="globe" size={20} color="#3498db" />
              <Text style={[styles.infoText, styles.linkText]}>
                {store.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Business Details Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          {(store.profileType ||
            store.primaryType ||
            (store.profileTypes && store.profileTypes.length > 0)) && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Business Type:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons
                  name={
                    getProfileTypeInfo(
                      store.profileType ||
                        store.primaryType ||
                        (store.profileTypes && store.profileTypes[0])
                    ).icon
                  }
                  size={16}
                  color={
                    getProfileTypeInfo(
                      store.profileType ||
                        store.primaryType ||
                        (store.profileTypes && store.profileTypes[0])
                    ).color
                  }
                />
                <Text style={styles.businessDetailText}>
                  {
                    getProfileTypeInfo(
                      store.profileType ||
                        store.primaryType ||
                        (store.profileTypes && store.profileTypes[0])
                    ).name
                  }
                </Text>
              </View>
            </View>
          )}
          {Array.isArray(store.categories) && store.categories.length > 0 && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Categories:</Text>
              <View style={[styles.businessDetailValue, { flexWrap: "wrap", flex: 1 }]}>
                {store.categories.map((cat) => (
                  <View
                    key={cat}
                    style={{
                      marginRight: 8,
                      marginBottom: 4,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={getCategoryInfo(cat).icon}
                      size={14}
                      color="#3498db"
                    />
                    <Text
                      style={[
                        styles.businessDetailText,
                        { flexShrink: 1, flexWrap: "wrap" },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {getCategoryInfo(cat).name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {/* fallback for single category (if categories array is not present) */}
          {!Array.isArray(store.categories) && store.category && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Category:</Text>
              <View style={styles.businessDetailValue}>
                <View
                  style={[
                    { marginRight: 8, flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <Ionicons
                    name={getCategoryInfo(store.category).icon}
                    size={14}
                    color="#3498db"
                  />
                  <Text style={styles.businessDetailText}>
                    {getCategoryInfo(store.category).name}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {store.ownerName && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Owner:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons name="person" size={16} color="#7f8c8d" />
                <Text style={styles.businessDetailText}>{store.ownerName}</Text>
              </View>
            </View>
          )}
          {store.establishedDate && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Established:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons name="calendar" size={16} color="#7f8c8d" />
                <Text style={styles.businessDetailText}>
                  {new Date(store.establishedDate).getFullYear()}
                </Text>
              </View>
            </View>
          )}
          {store.businessLicense && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>License:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons name="document-text" size={16} color="#27ae60" />
                <Text style={styles.businessDetailText}>Licensed Business</Text>
              </View>
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("about")}</Text>
          <Text style={styles.description}>{store.description}</Text>
        </View>

        {/* Social Links & Online Presence */}
        {((store.socialLinks && store.socialLinks.length > 0) ||
          store.website ||
          store.email) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Connect & Follow</Text>
            {store.website && (
              <TouchableOpacity
                style={styles.primarySocialLink}
                onPress={() => openSocialLink(store.website)}
              >
                <View style={styles.socialLinkIcon}>
                  <Ionicons name="globe" size={20} color="#3498db" />
                </View>
                <View style={styles.socialLinkContent}>
                  <Text style={styles.socialLinkTitle}>Website</Text>
                  <Text style={styles.socialLinkUrl} numberOfLines={1}>
                    {store.website.replace(/^https?:\/\//, "")}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#7f8c8d" />
              </TouchableOpacity>
            )}
            {store.email && (
              <TouchableOpacity
                style={styles.primarySocialLink}
                onPress={() => Linking.openURL(`mailto:${store.email}`)}
              >
                <View style={styles.socialLinkIcon}>
                  <Ionicons name="mail" size={20} color="#e74c3c" />
                </View>
                <View style={styles.socialLinkContent}>
                  <Text style={styles.socialLinkTitle}>Email</Text>
                  <Text style={styles.socialLinkUrl} numberOfLines={1}>
                    {store.email}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color="#7f8c8d" />
              </TouchableOpacity>
            )}
            {store.socialLinks && store.socialLinks.length > 0 && (
              <>
                <View style={styles.socialLinksHeader}>
                  <Text style={styles.socialLinksSubtitle}>Social Media</Text>
                </View>
                <View style={styles.socialLinksGrid}>
                  {store.socialLinks.map((link, index) => {
                    const platform = link.platform || "link";
                    const platformIcon = getPlatformIcon(platform);
                    const platformColor = getPlatformColor(platform);
                    const platformName =
                      platform.charAt(0).toUpperCase() + platform.slice(1);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.socialLinkItem,
                          { borderColor: platformColor },
                        ]}
                        onPress={() => openSocialLink(link.url)}
                      >
                        <View
                          style={[
                            styles.socialPlatformIcon,
                            { backgroundColor: platformColor },
                          ]}
                        >
                          <Ionicons
                            name={platformIcon}
                            size={16}
                            color="#fff"
                          />
                        </View>
                        <View style={styles.socialLinkDetails}>
                          <Text style={styles.socialPlatformName}>
                            {platformName}
                          </Text>
                          <Text
                            style={[
                              styles.socialLinkText,
                              { color: platformColor },
                            ]}
                            numberOfLines={1}
                          >
                            {link.url
                              .replace(/^https?:\/\//, "")
                              .replace(/^www\./, "")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}

        {/* Reviews Section */}
        {!isMyStore && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("reviews")}</Text>
              {reviewCount > 0 && (
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("StoreReviews", { store })}
                >
                  <Text style={styles.seeAllText}>{t("seeAll")}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3498db" />
                </TouchableOpacity>
              )}
            </View>
            {reviewCount > 0 ? (
              <>
                <TouchableOpacity
                  style={styles.writeReviewCard}
                  onPress={() => navigation.navigate("StoreReview", { store })}
                >
                  <Ionicons
                    name={userHasReviewed ? "create" : "create-outline"}
                    size={20}
                    color="#3498db"
                  />
                  <Text style={styles.writeReviewText}>
                    {userHasReviewed ? "Edit Your Review" : "Write a Review"}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#3498db" />
                </TouchableOpacity>
                <View style={styles.reviewsList}>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="star-outline" size={48} color="#bdc3c7" />
                <Text style={styles.noReviewsText}>{t("noReviewsYet")}</Text>
                <Text style={styles.noReviewsSubtext}>
                  {t("beFirstToReview")}
                </Text>
                <TouchableOpacity
                  style={styles.firstReviewButton}
                  onPress={() => navigation.navigate("StoreReview", { store })}
                >
                  <Text style={styles.firstReviewButtonText}>
                    {t("writeFirstReview")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Products Section */}
        {!isMyStore && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t("products")}</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t("loadingProducts")}</Text>
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
                <Text style={styles.emptyText}>{t("noProductsAvailable")}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default BusinessDetailsTab;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  linkText: {
    color: "#3498db",
    textDecorationLine: "underline",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  businessDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  businessDetailLabel: {
    fontSize: 14,
    color: "#777",
    width: 100,
  },
  businessDetailValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  businessDetailText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  primarySocialLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  socialLinkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  socialLinkContent: {
    flex: 1,
    marginLeft: 12,
  },
  socialLinkTitle: {
    fontSize: 16,
    color: "#333",
  },
  socialLinkUrl: {
    fontSize: 14,
    color: "#3498db",
  },
  socialLinksHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  socialLinksSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  socialLinksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  socialLinkItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  socialPlatformIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  socialLinkDetails: {
    flex: 1,
    marginLeft: 12,
  },
  socialPlatformName: {
    fontSize: 14,
    color: "#333",
  },
  socialLinkText: {
    fontSize: 12,
    color: "#555",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3498db",
    marginRight: 4,
  },
  writeReviewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
    marginBottom: 16,
  },
  writeReviewText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  reviewsList: {
    maxHeight: 200,
  },
  noReviewsContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#777",
    marginTop: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  firstReviewButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#3498db",
  },
  firstReviewButtonText: {
    fontSize: 16,
    color: "#fff",
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
