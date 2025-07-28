# 🗄️ LocalFinds Refactored Database Schema

## Overview
Transform from rigid "Store" model to flexible "BusinessProfile" system supporting diverse local entrepreneurs.

## 📊 Firebase Collections Structure

### 1. **businessProfiles** (replaces `stores`)
```javascript
{
  id: "profile_123",
  
  // Basic Info
  name: "Juan's Tech Repair & Tutoring",
  description: "Computer repair services and programming lessons",
  address: "123 Main St, Quezon City",
  location: {
    latitude: 14.6349,
    longitude: 121.0383,
    accuracy: 10
  },
  
  // Profile Configuration
  profileTypes: ["service-provider", "freelancer"], // Multi-select
  primaryType: "service-provider", // Main business type
  categories: ["repair-tech", "education"], // Can span multiple categories
  
  // Contact & Social
  contact: {
    phone: "09123456789",
    email: "juan@email.com",
    whatsapp: "09123456789"
  },
  socialLinks: [
    { platform: "facebook", url: "https://facebook.com/juantechrepair" },
    { platform: "instagram", url: "https://instagram.com/juantech" }
  ],
  
  // Business Details
  hours: "Mon-Sat: 9AM-6PM",
  isActive: true,
  isMobile: false, // Can travel to customers
  serviceRadius: 5, // km radius for mobile services
  
  // Media
  profileImage: "https://...",
  coverImage: "https://...",
  gallery: ["https://...", "https://..."],
  
  // Metadata
  ownerId: "user_456",
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
  
  // Stats
  totalListings: 8,
  totalViews: 150,
  rating: 4.5,
  reviewCount: 12,
  
  // Search Tags (auto-generated + manual)
  searchTags: [
    "laptop repair", "phone repair", "tutoring", 
    "programming", "quezon city", "mobile service"
  ]
}
```

### 2. **listings** (replaces `products` + new)
```javascript
{
  id: "listing_789",
  profileId: "profile_123",
  
  // Listing Info
  title: "Laptop Screen Replacement",
  description: "Professional laptop screen repair service",
  type: "service", // product | service | supply | portfolio | booking | labor
  category: "repair-tech",
  
  // Pricing
  price: "₱2500",
  priceType: "fixed", // fixed | hourly | daily | negotiable
  currency: "PHP",
  
  // Service-specific fields
  duration: "2-3 hours",
  location: "customer_location", // shop | customer_location | both
  isAvailable: true,
  
  // Product-specific fields (when type = "product")
  inStock: true,
  quantity: 10,
  variants: [
    { name: "15-inch screen", price: "₱2500" },
    { name: "17-inch screen", price: "₱3200" }
  ],
  
  // Portfolio-specific fields (when type = "portfolio")
  completedDate: "2024-12-15",
  clientName: "ABC Company", // optional
  
  // Media
  images: ["https://...", "https://..."],
  video: "https://...", // optional
  
  // Metadata
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
  
  // Stats
  views: 45,
  inquiries: 8,
  orders: 3, // for products
  bookings: 5, // for services
  
  // Search optimization
  searchKeywords: ["laptop", "screen", "repair", "replacement"]
}
```

### 3. **users** (enhanced)
```javascript
{
  id: "user_456",
  
  // Basic Info
  name: "Juan Dela Cruz",
  email: "juan@email.com",
  avatar: "https://...",
  
  // User Preferences
  preferredLanguage: "en", // en | tl
  location: {
    latitude: 14.6349,
    longitude: 121.0383,
    city: "Quezon City",
    region: "NCR"
  },
  
  // Business Owner Status
  hasBusinessProfile: true,
  businessProfileId: "profile_123",
  
  // Customer Preferences
  favoriteCategories: ["repair-tech", "food-restaurant"],
  searchRadius: 10, // km
  notifications: {
    newListings: true,
    nearbyBusinesses: true,
    messages: true
  },
  
  // Activity
  totalFavorites: 25,
  totalReviews: 8,
  memberSince: "2024-01-01T00:00:00Z",
  lastActive: "2025-01-15T15:30:00Z"
}
```

### 4. **reviews** (updated)
```javascript
{
  id: "review_321",
  profileId: "profile_123", // Changed from storeId
  listingId: "listing_789", // optional - review specific listing
  reviewerId: "user_654",
  
  rating: 5,
  comment: "Excellent laptop repair service! Quick and professional.",
  
  // Review Type
  type: "service", // product | service | overall
  
  // Verification
  isVerified: true, // if they actually used the service/bought product
  
  createdAt: "2025-01-10T14:20:00Z",
  
  // Response from business owner
  response: {
    comment: "Thank you for your feedback!",
    respondedAt: "2025-01-10T16:00:00Z"
  }
}
```

### 5. **conversations** (enhanced chat)
```javascript
{
  id: "chat_555",
  participants: ["user_456", "user_654"],
  
  // Business Context
  profileId: "profile_123", // which business profile this is about
  listingId: "listing_789", // which listing sparked the conversation
  
  // Conversation Type
  type: "inquiry", // inquiry | booking | order | general
  
  lastMessage: {
    text: "When can you repair my laptop?",
    senderId: "user_654",
    timestamp: "2025-01-15T15:45:00Z"
  },
  
  // Status
  isActive: true,
  unreadCount: {
    "user_456": 0,
    "user_654": 2
  },
  
  createdAt: "2025-01-15T15:30:00Z",
  updatedAt: "2025-01-15T15:45:00Z"
}
```

### 6. **bookings** (new - for appointment-based services)
```javascript
{
  id: "booking_888",
  profileId: "profile_123",
  listingId: "listing_789",
  customerId: "user_654",
  
  // Booking Details
  scheduledDate: "2025-01-20T10:00:00Z",
  duration: 180, // minutes
  status: "confirmed", // pending | confirmed | completed | cancelled
  
  // Service Details
  serviceName: "Laptop Screen Replacement",
  price: "₱2500",
  notes: "Bring laptop with charger",
  
  // Location
  location: {
    type: "customer_location",
    address: "456 Customer St, Quezon City",
    coordinates: { latitude: 14.6400, longitude: 121.0400 }
  },
  
  // Payment
  paymentStatus: "pending", // pending | paid | partial
  paymentMethod: "cash", // cash | gcash | bank_transfer
  
  createdAt: "2025-01-15T16:00:00Z",
  updatedAt: "2025-01-15T16:00:00Z"
}
```

## 🔍 Search Index Structure

### Algolia/Elasticsearch Document
```javascript
{
  objectID: "profile_123",
  
  // Basic searchable fields
  name: "Juan's Tech Repair & Tutoring",
  description: "Computer repair services and programming lessons",
  
  // Location for geo-search
  _geoloc: {
    lat: 14.6349,
    lng: 121.0383
  },
  
  // Categories and types for filtering
  profileTypes: ["service-provider", "freelancer"],
  categories: ["repair-tech", "education"],
  
  // All listings for comprehensive search
  listings: [
    {
      title: "Laptop Screen Replacement",
      type: "service",
      price: "₱2500",
      category: "repair-tech"
    },
    {
      title: "Programming Lessons",
      type: "service", 
      price: "₱500/hour",
      category: "education"
    }
  ],
  
  // Enhanced search tags
  searchTags: [
    "laptop repair", "phone repair", "tutoring",
    "programming", "quezon city", "mobile service"
  ],
  
  // Filters
  isActive: true,
  isMobile: false,
  rating: 4.5,
  priceRange: "₱500-3000",
  
  // Location data
  city: "Quezon City",
  region: "NCR",
  serviceRadius: 5
}
```

## 🔄 Migration Strategy

### Phase 1: Dual Support
```javascript
// Keep existing `stores` collection
// Create new `businessProfiles` collection
// Run both systems in parallel
```

### Phase 2: Data Migration
```javascript
// Script to convert stores → businessProfiles
stores.forEach(store => {
  const businessProfile = {
    name: store.name,
    description: store.description,
    address: store.address,
    location: store.coordinates,
    profileTypes: ["store"], // Default for existing stores
    categories: [store.category],
    // ... map other fields
  }
  
  // Migrate products → listings
  products.where('storeId', store.id).forEach(product => {
    const listing = {
      title: product.name,
      type: "product",
      price: product.price,
      // ... map other fields
    }
  })
})
```

### Phase 3: Complete Migration
```javascript
// Switch all app logic to use businessProfiles
// Deprecate stores collection
// Update all UI components
```

This refactored schema provides:
- ✅ **Flexibility**: Support any business type
- ✅ **Scalability**: Easy to add new profile types
- ✅ **Search Power**: Rich filtering and location-based search
- ✅ **Future-Proof**: Ready for bookings, orders, and more features
