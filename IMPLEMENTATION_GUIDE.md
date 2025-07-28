# 🚀 LocalFinds Refactoring Implementation Guide

## ✅ **Phase 1: Core Refactoring (COMPLETED)**

### 1. ✅ Categories System Refactored
- **File**: `/src/config/categories.js`
- **New Features**:
  - 7 profile types (Store, Service Provider, Freelancer, Producer, Home Seller, Student, Informal Worker)
  - 6 listing types (Product, Service, Supply, Portfolio, Booking, Labor)
  - 32 unified business categories
  - Smart category filtering based on profile types
  - Backward compatibility maintained

### 2. ✅ CreateStoreScreen → CreateBusinessProfile
- **File**: `/src/screens/CreateStoreScreen.js`
- **New Features**:
  - Multi-select business types
  - Primary business type selection
  - Smart category filtering
  - Mobile service options with radius
  - Enhanced data structure for `businessProfiles` collection

## 📋 **Phase 2: Database Migration (NEXT STEPS)**

### Migration Strategy

#### Step 1: Run Migration Script
```javascript
// scripts/migrateStoriesToBusinessProfiles.js
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/services/firebaseConfig';

const migrateStores = async () => {
  try {
    console.log('🔄 Starting migration from stores to businessProfiles...');
    
    // Get all existing stores
    const storesSnapshot = await getDocs(collection(db, 'stores'));
    const stores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    for (const store of stores) {
      // Map store data to businessProfile structure
      const businessProfile = {
        name: store.name,
        description: store.description || '',
        address: store.address,
        location: store.coordinates ? {
          latitude: store.coordinates.latitude,
          longitude: store.coordinates.longitude,
          accuracy: 10
        } : null,
        
        // Default profile configuration for existing stores
        profileTypes: ['store'],
        primaryType: 'store',
        categories: [store.category || 'other'],
        
        // Business details
        hours: store.hours || '',
        isActive: true,
        isMobile: false,
        serviceRadius: 0,
        
        // Media
        profileImage: store.profileImage || '',
        coverImage: store.coverImage || '',
        
        // Contact & Social
        socialLinks: store.socialLinks || [],
        
        // Metadata
        ownerId: store.ownerId,
        createdAt: store.createdAt,
        updatedAt: new Date().toISOString(),
        
        // Stats
        totalListings: 0, // Will be calculated
        totalViews: 0,
        rating: 0,
        reviewCount: 0,
        
        // Legacy reference
        legacyStoreId: store.id,
        
        // Search tags
        searchTags: [
          store.name?.toLowerCase(),
          store.category?.toLowerCase(),
          store.address?.split(',')[1]?.trim()?.toLowerCase()
        ].filter(Boolean)
      };
      
      const docRef = await addDoc(collection(db, 'businessProfiles'), businessProfile);
      console.log(`✅ Migrated store ${store.name} → ${docRef.id}`);
    }
    
    console.log(`✅ Migration completed! ${stores.length} stores migrated.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

migrateStores();
```

#### Step 2: Migrate Products to Listings
```javascript
// scripts/migrateProductsToListings.js
const migrateProducts = async () => {
  try {
    console.log('🔄 Starting migration from products to listings...');
    
    // Get all products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get businessProfiles to map storeId → profileId
    const profilesSnapshot = await getDocs(collection(db, 'businessProfiles'));
    const storeToProfileMap = {};
    
    profilesSnapshot.docs.forEach(doc => {
      const profile = doc.data();
      if (profile.legacyStoreId) {
        storeToProfileMap[profile.legacyStoreId] = doc.id;
      }
    });
    
    for (const product of products) {
      const profileId = storeToProfileMap[product.storeId];
      if (!profileId) {
        console.warn(`⚠️ No profile found for storeId: ${product.storeId}`);
        continue;
      }
      
      const listing = {
        profileId: profileId,
        title: product.name,
        description: product.description || '',
        type: 'product',
        category: product.category || 'other',
        
        // Pricing
        price: product.price || '₱0',
        priceType: 'fixed',
        currency: 'PHP',
        
        // Product-specific
        inStock: product.inStock !== undefined ? product.inStock : true,
        quantity: product.quantity || 1,
        
        // Media
        images: product.imageUrl ? [product.imageUrl] : [],
        
        // Metadata
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Stats
        views: 0,
        inquiries: 0,
        orders: 0,
        
        // Legacy reference
        legacyProductId: product.id,
        
        // Search optimization
        searchKeywords: [
          product.name?.toLowerCase(),
          product.description?.toLowerCase().split(' ').slice(0, 5)
        ].flat().filter(Boolean)
      };
      
      const docRef = await addDoc(collection(db, 'listings'), listing);
      console.log(`✅ Migrated product ${product.name} → ${docRef.id}`);
    }
    
    console.log(`✅ Products migration completed! ${products.length} products migrated.`);
  } catch (error) {
    console.error('❌ Products migration failed:', error);
  }
};

migrateProducts();
```

## 📱 **Phase 3: UI Components Update**

### 1. Update Home Screen
```javascript
// src/screens/HomeScreen.js - Update to use businessProfiles
import { 
  PROFILE_TYPES, 
  BUSINESS_CATEGORIES, 
  getCategoryInfo,
  getProfileTypeInfo 
} from '../config/categories';

// Add filter options
const [selectedProfileTypes, setSelectedProfileTypes] = useState([]);
const [selectedCategories, setSelectedCategories] = useState([]);

// Update search to use businessProfiles collection
const searchBusinesses = async (searchTerm) => {
  const businessesRef = collection(db, 'businessProfiles');
  let q = businessesRef;
  
  if (selectedProfileTypes.length > 0) {
    q = query(q, where('profileTypes', 'array-contains-any', selectedProfileTypes));
  }
  
  // Add more filters...
};
```

### 2. Update Navigation
```javascript
// src/navigation/AppNavigator.js
// Rename "My Store" → "My Business"
// Add new screens for different business types

<Tab.Screen 
  name="MyBusinessMain" 
  component={MyBusinessScreen}
  options={{
    title: 'My Business',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="business" size={size} color={color} />
    ),
  }}
/>
```

### 3. Create Business Type Selection Screen
```javascript
// src/screens/BusinessTypeSelectionScreen.js
export default function BusinessTypeSelectionScreen({ navigation }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What type of business are you?</Text>
      
      {PROFILE_TYPES.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeCard,
            selectedTypes.includes(type.id) && styles.typeCardSelected
          ]}
          onPress={() => {
            // Toggle selection logic
          }}
        >
          <Ionicons name={type.icon} size={32} color={type.color} />
          <Text style={styles.typeName}>{type.name}</Text>
          <Text style={styles.typeDescription}>{type.description}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('CreateBusinessProfile', { 
          preselectedTypes: selectedTypes 
        })}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

## 🔍 **Phase 4: Enhanced Search System**

### 1. Algolia/Search Integration
```javascript
// src/services/searchService.js
import algoliasearch from 'algoliasearch';

const client = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_KEY');
const index = client.initIndex('business_profiles');

export const searchBusinesses = async (query, filters = {}) => {
  const searchParams = {
    query,
    filters: buildAlgoliaFilters(filters),
    aroundLatLng: filters.location ? `${filters.location.lat},${filters.location.lng}` : undefined,
    aroundRadius: filters.radius ? filters.radius * 1000 : undefined, // Convert km to meters
  };
  
  try {
    const { hits } = await index.search('', searchParams);
    return hits;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

const buildAlgoliaFilters = (filters) => {
  const filterParts = [];
  
  if (filters.profileTypes?.length > 0) {
    const typeFilters = filters.profileTypes.map(type => `profileTypes:"${type}"`);
    filterParts.push(`(${typeFilters.join(' OR ')})`);
  }
  
  if (filters.categories?.length > 0) {
    const categoryFilters = filters.categories.map(cat => `categories:"${cat}"`);
    filterParts.push(`(${categoryFilters.join(' OR ')})`);
  }
  
  if (filters.isMobile) {
    filterParts.push('isMobile:true');
  }
  
  if (filters.isActive !== undefined) {
    filterParts.push(`isActive:${filters.isActive}`);
  }
  
  return filterParts.join(' AND ');
};
```

### 2. Smart Filter Component
```javascript
// src/components/BusinessFilters.js
export default function BusinessFilters({ onFiltersChange }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [radius, setRadius] = useState(10);
  const [mobileOnly, setMobileOnly] = useState(false);
  
  return (
    <View style={styles.container}>
      {/* Profile Type Filters */}
      <Text style={styles.sectionTitle}>Business Types</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {PROFILE_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              selectedTypes.includes(type.id) && styles.filterChipSelected
            ]}
            onPress={() => toggleSelection(type.id, selectedTypes, setSelectedTypes)}
          >
            <Ionicons name={type.icon} size={16} color={type.color} />
            <Text style={styles.filterChipText}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Category Filters */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoryGrid}>
        {BUSINESS_CATEGORIES.slice(0, 8).map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategories.includes(category.id) && styles.categoryChipSelected
            ]}
            onPress={() => toggleSelection(category.id, selectedCategories, setSelectedCategories)}
          >
            <Ionicons name={category.icon} size={16} color="#3498db" />
            <Text style={styles.categoryChipText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Distance Filter */}
      <Text style={styles.sectionTitle}>Distance: {radius}km</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={50}
        value={radius}
        onValueChange={setRadius}
        step={1}
      />
      
      {/* Mobile Service Filter */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setMobileOnly(!mobileOnly)}
      >
        <Ionicons 
          name={mobileOnly ? "checkbox" : "square-outline"} 
          size={24} 
          color={mobileOnly ? "#27ae60" : "#7f8c8d"} 
        />
        <Text style={styles.checkboxText}>Mobile services only</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🎯 **Phase 5: New Features Implementation**

### 1. Listing Management Screen
```javascript
// src/screens/ManageListingsScreen.js
export default function ManageListingsScreen({ route }) {
  const { profileId } = route.params;
  const [listings, setListings] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  
  const addNewListing = (type) => {
    navigation.navigate('CreateListing', { profileId, listingType: type });
  };
  
  return (
    <View style={styles.container}>
      {/* Listing Type Tabs */}
      <ScrollView horizontal style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeTab, selectedType === 'all' && styles.typeTabActive]}
          onPress={() => setSelectedType('all')}
        >
          <Text>All</Text>
        </TouchableOpacity>
        {LISTING_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeTab, selectedType === type.id && styles.typeTabActive]}
            onPress={() => setSelectedType(type.id)}
          >
            <Ionicons name={type.icon} size={16} />
            <Text>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Add New Listing Buttons */}
      <View style={styles.addButtonsContainer}>
        {LISTING_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={styles.addButton}
            onPress={() => addNewListing(type.id)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add {type.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Listings List */}
      <FlatList
        data={listings.filter(l => selectedType === 'all' || l.type === selectedType)}
        renderItem={({ item }) => <ListingCard listing={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
```

### 2. Booking System (for Service Providers)
```javascript
// src/screens/BookingCalendarScreen.js
export default function BookingCalendarScreen({ route }) {
  const { serviceId } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const bookSlot = async (slot) => {
    try {
      const booking = {
        profileId: service.profileId,
        listingId: serviceId,
        customerId: currentUser.uid,
        scheduledDate: slot.datetime,
        duration: service.duration,
        status: 'pending',
        serviceName: service.title,
        price: service.price,
        // ... other booking data
      };
      
      await addDoc(collection(db, 'bookings'), booking);
      Alert.alert('Success', 'Booking request sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to book service');
    }
  };
  
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(new Date(day.dateString))}
        markedDates={{
          [selectedDate.toISOString().split('T')[0]]: { selected: true }
        }}
      />
      
      <Text style={styles.sectionTitle}>Available Times</Text>
      <ScrollView style={styles.slotsContainer}>
        {availableSlots.map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={styles.timeSlot}
            onPress={() => bookSlot(slot)}
          >
            <Text style={styles.slotTime}>{slot.time}</Text>
            <Text style={styles.slotDuration}>{service.duration}</Text>
            <Text style={styles.slotPrice}>{service.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
```

## 🏁 **Implementation Checklist**

### ✅ **Completed**
- [x] Refactored categories system
- [x] Updated CreateStoreScreen → CreateBusinessProfile
- [x] New database schema documentation
- [x] Backward compatibility maintained

### 🔲 **Next Steps (Priority Order)**
1. [ ] Run database migration scripts
2. [ ] Update HomeScreen to use businessProfiles
3. [ ] Update MyStoreScreen → MyBusinessScreen
4. [ ] Implement search with new filters
5. [ ] Create ManageListingsScreen
6. [ ] Add booking system for services
7. [ ] Update all existing screens to use new schema
8. [ ] Implement Algolia search integration
9. [ ] Add analytics and reporting
10. [ ] Launch beta testing

### 🎯 **Key Benefits Achieved**
- **Flexibility**: Support any business type
- **Scalability**: Easy to add new profile types and listing types
- **User Experience**: Smart filtering and categorization
- **Future-Ready**: Ready for bookings, payments, and advanced features
- **SEO Optimized**: Rich search tags and metadata

This refactoring transforms LocalFinds from a simple "store directory" into a comprehensive **local business ecosystem** that can serve the entire spectrum of Filipino entrepreneurs! 🚀
