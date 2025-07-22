import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Input sanitization function to prevent injection attacks
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    // Remove any potentially harmful characters and limit length
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"`;]/g, '') // Remove quotes and semicolons
      .slice(0, 50); // Limit to 50 characters
  };

  // Validate name format (only letters, spaces, hyphens, apostrophes)
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
    return nameRegex.test(name);
  };

  async function signup(email, password, firstName = '', lastName = '') {
    // Sanitize and validate input
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);

    if (!validateName(sanitizedFirstName) || !validateName(sanitizedLastName)) {
      throw new Error('Names can only contain letters, spaces, hyphens, and apostrophes');
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      const displayName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();
      await updateProfile(user, { displayName });

      // Create user profile document in Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);

      return userCredential;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  // Function to fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        return profileData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function loginAnonymously() {
    return signInAnonymously(auth);
  }

  // Check if current user is anonymous/guest
  function isGuestUser() {
    return currentUser && currentUser.isAnonymous;
  }

  // Helper function to logout guest and prepare for signup
  async function logoutGuestAndSignup() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error logging out guest:', error);
      return false;
    }
  }

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user && !user.isAnonymous) {
        // Fetch user profile for authenticated users
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loginAnonymously,
    isGuestUser,
    logoutGuestAndSignup,
    resetPassword,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
