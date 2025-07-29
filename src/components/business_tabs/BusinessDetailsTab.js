import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReviewCard from "../ReviewCard";

const BusinessDetailsTab = ({ route, navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const { t } = useLanguage();
  const { currentUser, userProfile, isGuestUser } = useAuth();

  return (
    <View>
      {/* Content Sections */}
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

          {/* Profile Type */}
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

          {/* Business Category */}
          {store.category && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Category:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons
                  name={getCategoryInfo(store.category).icon}
                  size={16}
                  color="#3498db"
                />
                <Text style={styles.businessDetailText}>
                  {getCategoryInfo(store.category).name}
                </Text>
              </View>
            </View>
          )}

          {/* Owner Name */}
          {store.ownerName && (
            <View style={styles.businessDetailRow}>
              <Text style={styles.businessDetailLabel}>Owner:</Text>
              <View style={styles.businessDetailValue}>
                <Ionicons name="person" size={16} color="#7f8c8d" />
                <Text style={styles.businessDetailText}>{store.ownerName}</Text>
              </View>
            </View>
          )}

          {/* Establishment Date */}
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

          {/* Business License */}
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

            {/* Website Link */}
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

            {/* Email Contact */}
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

            {/* Social Media Links */}
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

        {/* Products Section */}
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
      </View>
    </View>
  );
};

export default BusinessDetailsTab;

const styles = StyleSheet.create({});
