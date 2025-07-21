import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginAnonymously,
    isGuestUser,
    logoutGuestAndSignup,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
