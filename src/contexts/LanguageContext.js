import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Common
    loading: 'Loading...',
    success: 'Success',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email Address',
    password: 'Password',
    or: 'or',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    confirmYourPassword: 'Confirm your password',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    forgotPassword: 'Forgot Password?',
    guestMode: 'Guest Mode',
    loginTitle: 'Welcome to HanapLokal!',
    loginSubtitle: 'Sign in to discover products and services near you',
    signupTitle: 'Join HanapLokal!',
    signupSubtitle: 'Join our community and discover products and services near you',
    createAccount: 'Create Account',
    haveAccount: 'Already have an account? ',
    signInHere: 'Sign in here',
    noAccount: "Don't have an account? ",
    signUpHere: 'Sign up here',
    
    // Terms and Conditions
    agreeToTerms: 'I agree to the',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    andPrivacyPolicy: 'and Privacy Policy',
    mustAcceptTerms: 'You must accept the Terms of Service to continue',
    
    // Login Errors
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmailFormat: 'Please enter a valid email address',
    userNotFound: 'No account found with this email address',
    wrongPassword: 'Incorrect password. Please try again.',
    accountDisabled: 'This account has been disabled. Please contact support.',
    tooManyAttempts: 'Too many login attempts. Please try again later.',
    networkError: 'Network error. Please check your connection.',
    invalidCredentials: 'Invalid email or password. Please try again.',
    loginFailed: 'Login failed. Please try again.',
    
    // Home
    greeting: 'Hello!',
    welcomeUser: 'Hello, {name}!',
    homeTitle: 'Let\'s find great local stores & services',
    nearYou: 'Near you',
    searchPlaceholder: 'Search for stores, products or services...',
    searchRadius: 'Search Radius',
    categories: 'Categories',
    localStores: 'Local Stores & Services',
    storesFound: 'business(es) found',
    within: 'within',
    accuracy: 'accuracy',
    enableLocation: '📍 Enable location to filter by distance',
    getLocation: 'Get My Location',
    gettingLocation: 'Getting Location...', 
    updating: 'Updating...', 
    noStores: 'No stores found',
    waitForStores: 'Please wait, stores will appear here soon',
    tryDifferentKeyword: 'Try a different keyword',
    
    // Profile
    profile: 'Profile',
    guestUser: 'Guest User',
    guestAccount: 'Guest Account',
    registeredUser: 'Registered User',
    rateReviewApp: 'Rate & Review App',
    settings: 'Settings',
    helpSupport: 'Help & Support',
    language: 'Language',
    version: 'HanapLokal v1.0.0',
    
    // Review
    rateOurApp: 'Rate Our App',
    helpUsImprove: 'Help us improve by sharing your experience',
    howWouldYouRate: 'How would you rate our app?',
    tellUsMore: 'Tell us more about your experience (Optional)',
    shareThoughts: 'Share your thoughts, suggestions, or any issues you encountered...',
    submitReview: 'Submit Review',
    submitting: 'Submitting...', 
    ratingRequired: 'Rating Required',
    selectRating: 'Please select a star rating before submitting.',
    thankYou: 'Thank You!',
    reviewSubmitted: 'Your review has been submitted successfully. We appreciate your feedback!',
    feedbackHelps: 'Your feedback helps us make HanapLokal better for everyone! 🙏',
    tapStarToRate: 'Tap a star to rate',
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    veryGood: 'Very Good',
    excellent: 'Excellent',
    
    // Categories
    all: 'All',
    sariSari: 'Sari-sari',
    restaurant: 'Restaurant',
    laundry: 'Laundry',
    vegetables: 'Vegetables',
    meatShop: 'Meat Shop',
    bakery: 'Bakery',
    pharmacy: 'Pharmacy',
    hardware: 'Hardware',
    clothing: 'Clothing',
    electronics: 'Electronics',
    beauty: 'Beauty',
    automotive: 'Automotive',
    other: 'Other',
    
    // Radius
    '1km': '1 km',
    '2km': '2 km',
    '5km': '5 km',
    '10km': '10 km',
    '20km': '20 km',
    '50km': '50 km',
    '100km': '100 km',
    noLimit: 'No limit',
    
    // Modals
    selectSearchRadius: 'Select Search Radius',
    selectCategory: 'Select Category',
    selectFilters: 'Select Filters',
    clearAll: 'Clear All',
    apply: 'Apply',
    selected: 'selected',
    
    // Filter sections
    profileTypes: 'Profile Types',
    businessCategories: 'Business Categories',
    
    // Alerts
    logoutConfirm: 'Are you sure you want to logout?',
    locationUpdated: 'Location Updated!',
    locationUpdateSuccess: 'Your location has been updated with high accuracy.\n\nNow showing stores within',
    unlimited: 'unlimited',
    radius: 'radius.',
    locationError: 'Location Error',
    locationErrorMessage: 'Could not get your precise location. Please check your GPS settings.',
    
    // Validation
    completeAllFields: 'Please complete all fields',
    passwordsDontMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    registrationFailed: 'Registration failed',
    couldNotFetchStores: 'Could not fetch stores',
    failedToLogout: 'Failed to logout',
    invalidName: 'Names can only contain letters, spaces, hyphens, and apostrophes',
    invalidFirstName: 'First name can only contain letters, spaces, hyphens, and apostrophes',
    invalidLastName: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
    
    // Language
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    english: 'English',
    tagalog: 'Tagalog',
    changeLanguage: 'Change Language',
    changeLanguageConfirm: 'Are you sure you want to change the language to {language}?',
    languageChanged: 'Language Changed',
    languageChangedMessage: 'Language has been changed successfully!',
    languageChangeNote: 'App interface will switch to your selected language immediately.',
    
    // Dynamic Greetings
    greetingMorning: 'Good morning!',
    greetingMorningPersonalized: 'Good morning, {name}!',
    greetingAfternoon: 'Good afternoon!',
    greetingAfternoonPersonalized: 'Good afternoon, {name}!',
    greetingEvening: 'Good evening!',
    greetingEveningPersonalized: 'Good evening, {name}!',
    greetingCasual: 'Hey there!',
    greetingCasualPersonalized: 'Hey {name}!',
    greetingFriendly: 'Welcome back!',
    greetingFriendlyPersonalized: 'Welcome back, {name}!',
    greetingEnthusiastic: 'Great to see you!',
    greetingEnthusiasticPersonalized: 'Great to see you, {name}!',
    
    // Navigation
    home: 'Home',
    myBusiness: 'My Business',
    chats: 'Chats',
    notifications: 'Notifications',
    startNewChat: 'Start New Chat',
    favorites: 'Favorites',
    profile: 'Profile',
    storeDetails: 'Store Details',
    storeMap: 'Store Map',
    productDetails: 'Product Details',
    createStore: 'Create Store',
    editStore: 'Edit Store',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    storeSettings: 'Store Settings',
    
    // Home Screen
    greetingHello: 'Hello!',
    findGoodStores: 'Let\'s find great stores',
    searchPlaceholder: 'Search for stores...',
    searchingStores: 'Searching for stores...',
    noStoresFound: 'No stores found',
    tryDifferentKeyword: 'Try a different keyword',
    waitForStores: 'Please wait, stores will appear here soon',
    
    // MyStore Screen
    failedToFetchStore: 'Failed to fetch store information',
    failedToFetchProducts: 'Failed to fetch products',
    guestWelcomeMessage: 'Thank you for using HanapLokal! As a guest, you can only view stores and products.',
    registrationBenefits: 'Benefits of registration:',
    ownStore: 'Have your own store',
    sellProducts: 'Sell products',
    getCustomers: 'Get customers',
    earnFromBusiness: 'Earn from business',
    registerForStore: 'Register for Store',
    refreshing: 'Refreshing...', 
    noStoreYet: 'No Store Yet',
    createStoreDescription: 'Create your store to start selling your products to local customers',
    createStore: 'Create Store',
    settings: 'Settings',
    myProducts: 'My Products',
    addProduct: 'Add Product',
    noProductsYet: 'No products yet',
    addFirstProduct: 'Add your first product to get started',
    
    // Reviews
    reviews: 'Reviews',
    review: 'Review',
    writeReview: 'Write Review',
    writeFirstReview: 'Write First Review',
    noReviewsYet: 'No reviews yet',
    beFirstToReview: 'Be the first to review this store',
    seeAll: 'See All',
    about: 'About',
    products: 'Products',
    loadingProducts: 'Loading products...', 
    noProductsAvailable: 'No products available',
    reviewingStore: 'Reviewing Store',
    shareExperience: 'Share your thoughts, suggestions, or any issues you encountered...',
    guestUserLimit: 'Guest User Limitation',
    registerToReview: 'Please register an account to write reviews',
    register: 'Register',
    thankYouForReview: 'Thank you for your review! Your feedback helps other customers.',
    failedToSubmitReview: 'Failed to submit review. Please try again.',
    
    // Business Tabs
    details: 'Details',
    services: 'Services',
    bookings: 'Bookings',
    portfolio: 'Portfolio',
    labor: 'Labor',
    addService: 'Add Service',
    noServicesAvailable: 'No services available yet.',
    addBooking: 'Add Booking',
    noBookingsAvailable: 'There are no bookings yet.',
    bookAppointment: 'Book Appointment',
    bookingRequestSent: 'Booking request sent!',
    failedToBook: 'Failed to book appointment.',
    addPortfolioImage: 'Add Image',
    noPortfolioImagesAvailable: 'The portfolio is empty.',
    addLabor: 'Add Labor',
    noLaborsAvailable: 'No labor services available yet.',
    editService: 'Edit Service',
    deleteService: 'Delete Service',
    areYouSureDeleteService: 'Are you sure you want to delete this service?',
    serviceDeletedSuccess: 'Service deleted successfully',
    failedToFetchServices: 'Failed to fetch services',
    failedToDeleteService: 'Failed to delete service',
    available: 'Available',
    unavailable: 'Unavailable',
  },
  
  tl: {
    // Common
    loading: 'Naglo-load...', 
    error: 'Error',
    success: 'Tagumpay',
    ok: 'OK',
    cancel: 'Kanselahin',
    save: 'I-save',
    delete: 'Tanggalin',
    edit: 'I-edit',
    add: 'Idagdag',
    search: 'Hanapin',
    filter: 'I-filter',
    refresh: 'I-refresh',
    
    // Auth
    login: 'Mag-log in',
    signup: 'Mag-register',
    logout: 'Mag-logout',
    email: 'Email Address',
    password: 'Password',
    or: 'o',
    confirmPassword: 'Confirm Password',
    firstName: 'Pangalan',
    lastName: 'Apelyido',
    enterEmail: 'Ilagay ang inyong email',
    enterPassword: 'Ilagay ang inyong password',
    confirmYourPassword: 'Kumpirmahin ang inyong password',
    enterFirstName: 'Ilagay ang inyong pangalan',
    enterLastName: 'Ilagay ang inyong apelyido',
    forgotPassword: 'Nakalimutan ang password?',
    guestMode: 'Guest Mode',
    loginTitle: 'Maligayang pagbabalik!',
    loginSubtitle: 'Mag-sign in para tuklasin ang mga lokal na tindahan malapit sa inyo',
    signupTitle: 'Mag-register sa HanapLokal!',
    signupSubtitle: 'Sumali sa aming komunidad at tuklasin ang mga lokal na tindahan',
    createAccount: 'Gumawa ng Account',
    haveAccount: 'May account na? ',
    signInHere: 'Mag-log in dito',
    noAccount: 'Wala pang account? ',
    signUpHere: 'Mag-register dito',
    
    // Terms and Conditions
    agreeToTerms: 'Sumasang-ayon ako sa ',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    andPrivacyPolicy: 'at Privacy Policy',
    mustAcceptTerms: 'Dapat kayong sumang-ayon sa Terms of Service para magtuloy',
    
    // Login Errors
    emailRequired: 'Kailangan ang email',
    passwordRequired: 'Kailangan ang password',
    invalidEmailFormat: 'Maglagay ng tamang email address',
    userNotFound: 'Walang account na nakita sa email na ito',
    wrongPassword: 'Mali ang password. Subukan ulit.',
    accountDisabled: 'Na-disable ang account na ito. Makipag-ugnayan sa support.',
    tooManyAttempts: 'Sobrang daming attempts. Subukan ulit mamaya.',
    networkError: 'May problema sa network. Tignan ang connection.',
    invalidCredentials: 'Mali ang email o password. Subukan ulit.',
    loginFailed: 'Hindi naka-login. Subukan ulit.',
    
    // Home
    greeting: 'Kumusta!',
    welcomeUser: 'Kumusta, {name}!',
    homeTitle: 'Hanap tayo ng magandang tindahan at serbisyo',
    nearYou: 'Malapit sa iyo',
    searchPlaceholder: 'Hanapin ang tindahan, produkto o serbisyo...',
    searchRadius: 'Search Radius',
    categories: 'Mga Kategorya',
    localStores: 'Mga Lokal na Tindahan at Serbisyo',
    storesFound: 'negosyo nahanap',
    within: 'sa loob ng',
    accuracy: 'accuracy',
    enableLocation: '📍 I-enable ang location para ma-filter by distance',
    getLocation: 'Kunin ang Aking Location',
    gettingLocation: 'Kinukuha ang Location...', 
    updating: 'Nag-a-update...', 
    noStores: 'Walang nakitang tindahan',
    waitForStores: 'Mag-antay lang, darating din ang mga tindahan dito',
    tryDifferentKeyword: 'Subukan ang ibang keyword',
    
    // Profile
    profile: 'Profile',
    guestUser: 'Guest User',
    guestAccount: 'Guest Account',
    registeredUser: 'Registered User',
    rateReviewApp: 'I-rate at Review ang App',
    settings: 'Mga Setting',
    helpSupport: 'Tulong at Suporta',
    language: 'Wika',
    version: 'HanapLokal v1.0.0',
    
    // Review
    rateOurApp: 'I-rate ang Aming App',
    helpUsImprove: 'Tulungan mo kami na mapabuti ang app sa pamamagitan ng inyong feedback',
    howWouldYouRate: 'Paano ninyo ire-rate ang aming app?',
    tellUsMore: 'Sabihin pa ninyo ang inyong experience (Optional)',
    shareThoughts: 'I-share ang inyong mga iniisip, suggestion, o mga problema...',
    submitReview: 'I-submit ang Review',
    submitting: 'Nag-su-submit...', 
    ratingRequired: 'Kailangan ng Rating',
    selectRating: 'Pakipili muna ang star rating bago i-submit.',
    thankYou: 'Salamat!',
    reviewSubmitted: 'Na-submit na ang inyong review. Salamat sa feedback!',
    feedbackHelps: 'Ang inyong feedback ay tumutulong para mapabuti namin ang HanapLokal! 🙏',
    tapStarToRate: 'I-tap ang star para mag-rate',
    poor: 'Hindi Maganda',
    fair: 'Pwede Na',
    good: 'Maganda',
    veryGood: 'Napaka-ganda',
    excellent: 'Excellent',
    
    // Categories
    all: 'Lahat',
    sariSari: 'Sari-sari',
    restaurant: 'Kainan',
    laundry: 'Laundry',
    vegetables: 'Gulay',
    meatShop: 'Meat Shop',
    bakery: 'Bakery',
    pharmacy: 'Pharmacy',
    hardware: 'Hardware',
    clothing: 'Damit',
    electronics: 'Electronics',
    beauty: 'Beauty',
    automotive: 'Automotive',
    other: 'Iba Pa',
    
    // Radius
    '1km': '1 km',
    '2km': '2 km',
    '5km': '5 km',
    '10km': '10 km',
    '20km': '20 km',
    '50km': '50 km',
    '100km': '100 km',
    noLimit: 'Walang hangganan',
    
    // Modals
    selectSearchRadius: 'Piliin ang Search Radius',
    selectCategory: 'Piliin ang Kategorya',
    selectFilters: 'Piliin ang mga Filter',
    clearAll: 'Burahin Lahat',
    apply: 'I-apply',
    selected: 'napili',
    
    // Filter sections
    profileTypes: 'Mga Uri ng Profile',
    businessCategories: 'Mga Kategorya ng Negosyo',
    
    // Alerts
    logoutConfirm: 'Sigurado ba kayong mag-logout?',
    locationUpdated: 'Na-update ang Location!',
    locationUpdateSuccess: 'Na-update na ang inyong location.\n\nNagpapakita na ng mga tindahan sa loob ng',
    unlimited: 'unlimited',
    radius: 'radius.',
    locationError: 'May Error sa Location',
    locationErrorMessage: 'Hindi makuha ang inyong location. Pakicheck ang GPS settings.',
    
    // Validation
    completeAllFields: 'Kumpletuhin po lahat ng fields',
    passwordsDontMatch: 'Hindi tugma ang mga password',
    passwordTooShort: 'Dapat hindi bababa sa 6 characters ang password',
    registrationFailed: 'Hindi makapag-register',
    couldNotFetchStores: 'Hindi makuha ang mga tindahan',
    failedToLogout: 'Hindi makapag-logout',
    invalidName: 'Ang pangalan ay pwedeng may mga titik, spaces, gitling, at apostrophe lang',
    invalidFirstName: 'Ang pangalan ay pwedeng may mga titik, spaces, gitling, at apostrophe lang',
    invalidLastName: 'Ang apelyido ay pwedeng may mga titik, spaces, gitling, at apostrophe lang',
    
    // Language
    languageSettings: 'Mga Setting ng Wika',
    selectLanguage: 'Piliin ang Wika',
    english: 'English',
    tagalog: 'Tagalog',
    changeLanguage: 'Baguhin ang Wika',
    changeLanguageConfirm: 'Sigurado ka bang gusto mong baguhin ang wika sa {language}?',
    languageChanged: 'Nabago na ang Wika',
    languageChangedMessage: 'Matagumpay na nabago ang wika!',
    languageChangeNote: 'Ang interface ng app ay agad na magiging sa napiling wika.',
    
    // Dynamic Greetings
    greetingMorning: 'Magandang umaga!',
    greetingMorningPersonalized: 'Magandang umaga, {name}!',
    greetingAfternoon: 'Magandang hapon!',
    greetingAfternoonPersonalized: 'Magandang hapon, {name}!',
    greetingEvening: 'Magandang gabi!',
    greetingEveningPersonalized: 'Magandang gabi, {name}!',
    greetingCasual: 'Kumusta!',
    greetingCasualPersonalized: 'Kumusta, {name}!',
    greetingFriendly: 'Balik ka na!',
    greetingFriendlyPersonalized: 'Balik ka na, {name}!',
    greetingEnthusiastic: 'Masaya kitang makita!',
    greetingEnthusiasticPersonalized: 'Masaya kitang makita, {name}!',
    
    // Navigation
    home: 'Simula',
    myBusiness: 'Aking Negosyo',
    chats: 'Mga Usapan',
    notifications: 'Mga Abiso',
    startNewChat: 'Bagong Usapan',
    favorites: 'Paborito',
    profile: 'Profile',
    storeDetails: 'Detalye ng Tindahan',
    storeMap: 'Mapa ng Tindahan',
    productDetails: 'Detalye ng Produkto',
    createStore: 'Gumawa ng Tindahan',
    editStore: 'I-edit ang Tindahan',
    addProduct: 'Magdagdag ng Produkto',
    editProduct: 'I-edit ang Produkto',
    storeSettings: 'Mga Setting ng Tindahan',
    
    // Home Screen
    greetingHello: 'Kumusta!',
    findGoodStores: 'Hanap tayo ng magandang tindahan',
    searchPlaceholder: 'Hanapin ang tindahan o produkto...',
    searchingStores: 'Hinahanap ang mga tindahan...', 
    noStoresFound: 'Walang nakitang tindahan',
    tryDifferentKeyword: 'Subukan ang ibang keyword',
    waitForStores: 'Mag-antay lang, darating din ang mga tindahan dito',
    
    // MyStore Screen
    failedToFetchStore: 'Hindi nakuha ang impormasyon ng tindahan',
    failedToFetchProducts: 'Hindi nakuha ang mga produkto',
    guestWelcomeMessage: 'Salamat sa paggamit ng HanapLokal! Bilang guest, pwede mo lang tingnan ang mga tindahan at produkto.',
    registrationBenefits: 'Mga benepisyo ng pag-register:',
    ownStore: 'Magkakaroon ng sariling tindahan',
    sellProducts: 'Magtinda ng mga produkto',
    getCustomers: 'Makakuha ng mga customer',
    earnFromBusiness: 'Kumita mula sa negosyo',
    registerForStore: 'Mag-register para sa Store',
    refreshing: 'Nire-refresh...', 
    noStoreYet: 'Wala Pang Tindahan',
    createStoreDescription: 'Gumawa ng tindahan para magsimulang magtinda ng mga produkto sa mga lokal na customer',
    createStore: 'Gumawa ng Tindahan',
    settings: 'Settings',
    myProducts: 'Mga Produkto Ko',
    addProduct: 'Magdagdag ng Produkto',
    noProductsYet: 'Wala pang mga produkto',
    addFirstProduct: 'Magdagdag ng unang produkto para magsimula',
    
    // Reviews
    reviews: 'Mga Review',
    review: 'Review',
    writeReview: 'Sumulat ng Review',
    writeFirstReview: 'Sumulat ng Unang Review',
    noReviewsYet: 'Wala pang mga review',
    beFirstToReview: 'Maging una sa pag-review sa tindahang ito',
    seeAll: 'Tingnan Lahat',
    about: 'Tungkol',
    products: 'Mga Produkto',
    loadingProducts: 'Naglo-load ng mga produkto...', 
    noProductsAvailable: 'Walang available na produkto',
    reviewingStore: 'Nire-review ang Tindahan',
    shareExperience: 'Ibahagi ang inyong opinyon, suhestiyon, o anumang problema na naranasan...',
    guestUserLimit: 'Limitasyon ng Guest User',
    registerToReview: 'Mag-register ng account para magsulat ng mga review',
    register: 'Mag-register',
    thankYouForReview: 'Salamat sa inyong review! Ang inyong feedback ay nakakatulong sa ibang customer.',
    failedToSubmitReview: 'Hindi naisumite ang review. Subukan ulit.',

    // Business Tabs
    details: 'Detalye',
    services: 'Serbisyo',
    bookings: 'Mga Booking',
    portfolio: 'Portfolio',
    labor: 'Trabaho',
    addService: 'Magdagdag ng Serbisyo',
    noServicesAvailable: 'Wala pang available na serbisyo.',
    addBooking: 'Magdagdag ng Booking',
    noBookingsAvailable: 'Wala pang mga booking.',
    bookAppointment: 'Mag-book ng Appointment',
    bookingRequestSent: 'Naipadala na ang request para sa booking!',
    failedToBook: 'Hindi nagtagumpay ang pag-book ng appointment.',
    addPortfolioImage: 'Magdagdag ng Larawan',
    noPortfolioImagesAvailable: 'Walang laman ang portfolio.',
    addLabor: 'Magdagdag ng Trabaho',
    noLaborsAvailable: 'Wala pang available na serbisyo sa paggawa.',
    editService: 'I-edit ang Serbisyo',
    deleteService: 'Tanggalin ang Serbisyo',
    areYouSureDeleteService: 'Sigurado ka bang gusto mong tanggalin ang serbisyong ito?',
    serviceDeletedSuccess: 'Matagumpay na natanggal ang serbisyo',
    failedToFetchServices: 'Hindi nakuha ang mga serbisyo',
    failedToDeleteService: 'Hindi natanggal ang serbisyo',
    available: 'Available',
    unavailable: 'Hindi Available',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('app_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}