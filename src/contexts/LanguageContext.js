import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
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
    confirmPassword: 'Confirm Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    confirmYourPassword: 'Confirm your password',
    forgotPassword: 'Forgot Password?',
    guestMode: 'Guest Mode (No registration required)',
    loginTitle: 'Welcome Back!',
    loginSubtitle: 'Sign in to discover local stores near you',
    signupTitle: 'Join LokalFinds!',
    signupSubtitle: 'Join our community and discover local stores',
    createAccount: 'Create Account',
    haveAccount: 'Already have an account? ',
    signInHere: 'Sign in here',
    noAccount: "Don't have an account? ",
    signUpHere: 'Sign up here',
    
    // Home
    greeting: 'Hello!',
    homeTitle: 'Let\'s find great local stores',
    nearYou: 'Near you',
    searchPlaceholder: 'Search for stores or products...',
    searchRadius: 'Search Radius',
    categories: 'Categories',
    localStores: 'Local Stores',
    storesFound: 'store(s) found',
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
    version: 'LokalFinds v1.0.0',
    
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
    feedbackHelps: 'Your feedback helps us make LokalFinds better for everyone! 🙏',
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
    
    // Language
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    english: 'English',
    tagalog: 'Tagalog',
    languageChanged: 'Language Changed',
    languageChangedMessage: 'Language has been changed successfully!',
    
    // Navigation
    home: 'Home',
    storeDetails: 'Store Details',
    productDetails: 'Product Details',
    
    // Home Screen
    greetingHello: 'Hello!',
    findGoodStores: 'Let\'s find great stores',
    searchPlaceholder: 'Search for stores or products...',
    searchingStores: 'Searching for stores...',
    noStoresFound: 'No stores found',
    tryDifferentKeyword: 'Try a different keyword',
    waitForStores: 'Please wait, stores will appear here soon',
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
    confirmPassword: 'Confirm Password',
    enterEmail: 'Ilagay ang inyong email',
    enterPassword: 'Ilagay ang inyong password',
    confirmYourPassword: 'Kumpirmahin ang inyong password',
    forgotPassword: 'Nakalimutan ang password?',
    guestMode: 'Guest Mode (Hindi kailangan mag-register)',
    loginTitle: 'Maligayang pagbabalik!',
    loginSubtitle: 'Mag-sign in para tuklasin ang mga lokal na tindahan malapit sa inyo',
    signupTitle: 'Mag-register sa LokalFinds!',
    signupSubtitle: 'Sumali sa aming komunidad at tuklasin ang mga lokal na tindahan',
    createAccount: 'Gumawa ng Account',
    haveAccount: 'May account na? ',
    signInHere: 'Mag-log in dito',
    noAccount: 'Wala pang account? ',
    signUpHere: 'Mag-register dito',
    
    // Home
    greeting: 'Kumusta!',
    homeTitle: 'Hanap tayo ng magandang tindahan',
    nearYou: 'Malapit sa iyo',
    searchPlaceholder: 'Hanapin ang tindahan o produkto...',
    searchRadius: 'Search Radius',
    categories: 'Mga Kategorya',
    localStores: 'Mga Lokal na Tindahan',
    storesFound: 'tindahan nahanap',
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
    version: 'LokalFinds v1.0.0',
    
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
    feedbackHelps: 'Ang inyong feedback ay tumutulong para mapabuti namin ang LokalFinds! 🙏',
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
    
    // Language
    languageSettings: 'Mga Setting ng Wika',
    selectLanguage: 'Piliin ang Wika',
    english: 'English',
    tagalog: 'Tagalog',
    languageChanged: 'Nabago na ang Wika',
    languageChangedMessage: 'Matagumpay na nabago ang wika!',
    
    // Navigation
    home: 'Simula',
    storeDetails: 'Detalye ng Tindahan',
    productDetails: 'Detalye ng Produkto',
    
    // Home Screen
    greetingHello: 'Kumusta!',
    findGoodStores: 'Hanap tayo ng magandang tindahan',
    searchPlaceholder: 'Hanapin ang tindahan o produkto...',
    searchingStores: 'Hinahanap ang mga tindahan...',
    noStoresFound: 'Walang nakitang tindahan',
    tryDifferentKeyword: 'Subukan ang ibang keyword',
    waitForStores: 'Mag-antay lang, darating din ang mga tindahan dito',
  }
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
