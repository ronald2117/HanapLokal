// 🏗️ LocalFinds - Flexible Business Profile Categories
// Supporting: Stores, Service Providers, Freelancers, Producers, Students, Informal Workers

// 👥 BUSINESS PROFILE TYPES
export const PROFILE_TYPES = [
  {
    id: 'store',
    name: 'Store/Reseller',
    description: 'Best for businesses with a physical or online storefront that primarily sell tangible goods. This includes sari-sari stores, boutiques, hardware shops, and online resellers.',
    icon: 'storefront',
    canHave: ['products', 'services'],
    color: '#3498db'
  },
  {
    id: 'service-provider',
    name: 'Service Provider',
    description: 'Ideal for professionals and businesses offering skilled labor or expertise. Examples include repair shops (automotive, electronics), salons, laundry services, and construction contractors.',
    icon: 'construct',
    canHave: ['services', 'bookings'],
    color: '#e74c3c'
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    description: 'For independent professionals offering project-based work or specialized skills. Perfect for graphic designers, writers, photographers, IT consultants, and other remote or on-site experts.',
    icon: 'laptop',
    canHave: ['services', 'portfolio'],
    color: '#9b59b6'
  },
  {
    id: 'producer',
    name: 'Producer/Manufacturer',
    description: 'Suits businesses that create or manufacture their own products from raw materials. This includes furniture makers, clothing manufacturers, food producers, and artisans who produce in bulk.',
    icon: 'hammer',
    canHave: ['products', 'supplies'],
    color: '#f39c12'
  },
  {
    id: 'home-seller',
    name: 'Home-Based Seller',
    description: 'For entrepreneurs running their business from home. This is great for home-cooked food sellers, bakers, crafters, and those who manage a small-scale business without a formal storefront.',
    icon: 'home',
    canHave: ['products', 'services'],
    color: '#27ae60'
  },
  {
    id: 'student',
    name: 'Student/Hobbyist',
    description: 'Perfect for students or hobbyists looking to earn from their skills and passion projects. Showcase your talents in tutoring, art commissions, simple repairs, or selling items you create.',
    icon: 'school',
    canHave: ['services', 'products', 'portfolio'],
    color: '#16a085'
  },
  {
    id: 'informal-worker',
    name: 'Informal Worker',
    description: "For individuals offering on-demand services, daily gigs, or flexible labor. This includes roles like delivery riders, household helpers, event staff, and other 'on-call' or temporary work.",
    icon: 'person',
    canHave: ['services', 'labor'],
    color: '#34495e'
  },
  {
    id: 'events-venue',
    name: 'Events & Venues',
    description: 'For businesses that host or organize events. This includes function halls, private resorts, party planners, and rental services for event equipment.',
    icon: 'megaphone',
    canHave: ['bookings', 'services', 'portfolio'],
    color: '#008080' // Teal
  },
  {
    id: 'real-estate',
    name: 'Real Estate & Rentals',
    description: 'For property owners, agents, or managers offering spaces for rent. This includes apartments, rooms for rent, commercial spaces, and vacation rentals.',
    icon: 'key',
    canHave: ['bookings', 'portfolio', 'services'],
    color: '#795548' // Brown
  }
];

// 📦 LISTING TYPES (what can be offered)
export const LISTING_TYPES = [
  {
    id: 'product',
    name: 'Product',
    description: 'Physical items for sale',
    icon: 'cube',
    fields: ['name', 'price', 'description', 'images', 'inStock', 'category']
  },
  {
    id: 'service',
    name: 'Service',
    description: 'Services and skilled work',
    icon: 'construct',
    fields: ['name', 'price', 'description', 'duration', 'location', 'category']
  },
  {
    id: 'supply',
    name: 'Supply/Wholesale',
    description: 'Bulk supplies for other businesses',
    icon: 'layers',
    fields: ['name', 'price', 'description', 'minimumOrder', 'availability']
  },
  {
    id: 'portfolio',
    name: 'Portfolio Item',
    description: 'Showcase of previous work',
    icon: 'images',
    fields: ['title', 'description', 'images', 'category', 'completedDate']
  },
  {
    id: 'booking',
    name: 'Bookable Service',
    description: 'Time-slot based services',
    icon: 'calendar',
    fields: ['name', 'price', 'duration', 'availability', 'location']
  },
  {
    id: 'labor',
    name: 'Labor/Gig Work',
    description: 'Physical work and temporary jobs',
    icon: 'fitness',
    fields: ['name', 'rate', 'description', 'availability', 'location']
  }
];

// 🏪 BUSINESS CATEGORIES (unified for all profile types)
export const BUSINESS_CATEGORIES = [
  // 🛒 RETAIL & PRODUCTS
  { id: 'sari-sari', name: 'Sari-sari Store', icon: 'storefront', types: ['store', 'home-seller'] },
  { id: 'food-restaurant', name: 'Food & Restaurant', icon: 'restaurant', types: ['store', 'home-seller'] },
  { id: 'groceries', name: 'Groceries & Fresh Food', icon: 'leaf', types: ['store', 'producer', 'home-seller'] },
  { id: 'clothing', name: 'Clothing & Fashion', icon: 'shirt', types: ['store', 'home-seller', 'student'] },
  { id: 'electronics', name: 'Electronics & Gadgets', icon: 'phone-portrait', types: ['store', 'freelancer'] },
  { id: 'pharmacy', name: 'Health & Pharmacy', icon: 'medical', types: ['store'] },
  { id: 'hardware', name: 'Hardware & Tools', icon: 'hammer', types: ['store', 'producer'] },
  { id: 'beauty-products', name: 'Beauty & Cosmetics', icon: 'color-palette', types: ['store', 'home-seller'] },
  { id: 'books-education', name: 'Books & Educational', icon: 'library', types: ['store', 'student'] },
  { id: 'handicrafts', name: 'Handicrafts & Art', icon: 'brush', types: ['home-seller', 'student', 'producer'] },
  
  // 🔧 SERVICES & REPAIRS
  { id: 'beauty-salon', name: 'Beauty & Personal Care', icon: 'cut', types: ['service-provider', 'freelancer'] },
  { id: 'repair-tech', name: 'Tech Repair & IT', icon: 'laptop', types: ['service-provider', 'freelancer', 'student'] },
  { id: 'repair-appliance', name: 'Appliance & Electronics Repair', icon: 'construct', types: ['service-provider', 'informal-worker'] },
  { id: 'automotive', name: 'Automotive & Transport', icon: 'car', types: ['service-provider', 'informal-worker'] },
  { id: 'construction', name: 'Construction & Renovation', icon: 'hammer', types: ['service-provider', 'informal-worker'] },
  { id: 'cleaning', name: 'Cleaning & Maintenance', icon: 'home', types: ['service-provider', 'informal-worker'] },
  { id: 'laundry', name: 'Laundry & Garment Care', icon: 'shirt', types: ['service-provider', 'home-seller'] },
  { id: 'delivery', name: 'Delivery & Transport', icon: 'bicycle', types: ['service-provider', 'informal-worker'] },
  
  // 💼 PROFESSIONAL SERVICES
  { id: 'education', name: 'Education & Tutoring', icon: 'school', types: ['freelancer', 'student', 'service-provider'] },
  { id: 'creative', name: 'Creative & Design', icon: 'color-palette', types: ['freelancer', 'student'] },
  { id: 'photography', name: 'Photography & Video', icon: 'camera', types: ['freelancer', 'student'] },
  { id: 'writing', name: 'Writing & Translation', icon: 'create', types: ['freelancer', 'student'] },
  { id: 'accounting', name: 'Accounting & Legal', icon: 'calculator', types: ['freelancer', 'service-provider'] },
  { id: 'health-wellness', name: 'Health & Wellness', icon: 'fitness', types: ['service-provider', 'freelancer'] },
  { id: 'events', name: 'Events & Entertainment', icon: 'musical-notes', types: ['service-provider', 'freelancer'] },
  
  // 🏭 PRODUCTION & SUPPLY
  { id: 'manufacturing', name: 'Manufacturing & Production', icon: 'cog', types: ['producer'] },
  { id: 'agriculture', name: 'Agriculture & Farming', icon: 'leaf', types: ['producer', 'home-seller'] },
  { id: 'food-production', name: 'Food Production & Catering', icon: 'restaurant', types: ['producer', 'home-seller'] },
  { id: 'wholesale', name: 'Wholesale & Supply', icon: 'layers', types: ['producer', 'store'] },
  
  // 🎯 SPECIALIZED
  { id: 'pet-services', name: 'Pet Care & Services', icon: 'paw', types: ['service-provider', 'freelancer'] },
  { id: 'childcare', name: 'Childcare & Babysitting', icon: 'heart', types: ['service-provider', 'informal-worker'] },
  { id: 'digital', name: 'Digital Services', icon: 'globe', types: ['freelancer', 'student'] },
  { id: 'other', name: 'Other Services', icon: 'business', types: ['store', 'service-provider', 'freelancer', 'producer', 'home-seller', 'student', 'informal-worker'] }
];

// 🔍 HELPER FUNCTIONS

// Get profile type info
export const getProfileTypeInfo = (typeId) => {
  return PROFILE_TYPES.find(type => type.id === typeId) || PROFILE_TYPES[0];
};

// Get listing type info
export const getListingTypeInfo = (typeId) => {
  return LISTING_TYPES.find(type => type.id === typeId) || LISTING_TYPES[0];
};

// Get category info
export const getCategoryInfo = (categoryId) => {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categoryId);
  return category || BUSINESS_CATEGORIES[BUSINESS_CATEGORIES.length - 1]; // Default to 'other'
};

// Get categories by profile type
export const getCategoriesForProfileType = (profileTypeId) => {
  return BUSINESS_CATEGORIES.filter(category => 
    category.types.includes(profileTypeId)
  );
};

// Get profile types that can use a category
export const getProfileTypesForCategory = (categoryId) => {
  const category = getCategoryInfo(categoryId);
  return PROFILE_TYPES.filter(type => category.types.includes(type.id));
};

// Get suitable listing types for profile type
export const getListingTypesForProfile = (profileTypeId) => {
  const profileType = getProfileTypeInfo(profileTypeId);
  return LISTING_TYPES.filter(listingType => 
    profileType.canHave.includes(listingType.id.replace('-', ''))
  );
};

// Search and filter functions
export const searchCategories = (searchTerm) => {
  if (!searchTerm) return BUSINESS_CATEGORIES;
  
  const term = searchTerm.toLowerCase();
  return BUSINESS_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(term) ||
    category.id.toLowerCase().includes(term)
  );
};

// Get categories as object for quick lookup
export const getCategoriesAsObject = () => {
  return BUSINESS_CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});
};

// Get profile types as object
export const getProfileTypesAsObject = () => {
  return PROFILE_TYPES.reduce((acc, type) => {
    acc[type.id] = type;
    return acc;
  }, {});
};

// 📱 EXPORT FOR BACKWARD COMPATIBILITY
export const businessCategories = BUSINESS_CATEGORIES;
export const profileTypes = PROFILE_TYPES;
export const listingTypes = LISTING_TYPES;

// Legacy exports (will be deprecated)
export const storeCategories = BUSINESS_CATEGORIES.filter(cat => cat.types.includes('store'));
export const serviceCategories = BUSINESS_CATEGORIES.filter(cat => cat.types.includes('service-provider'));
