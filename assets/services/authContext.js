import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc,deleteDoc, onSnapshot } from 'firebase/firestore';

// Create the authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  // Load stored user data and set up auth state listener
  useEffect(() => {
    let isMounted = true;
    let firestoreUnsubscribe = null;
  
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
  
        // Real-time Firestore listener
        firestoreUnsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (!isMounted) return;
  
          const firestoreData = docSnapshot.data() || {};
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime,
            ...firestoreData // This merges Firestore data
          };
  
          // Update state and storage
          AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        });
      } else {
        if (firestoreUnsubscribe) firestoreUnsubscribe();
        await AsyncStorage.removeItem('user');
        setUser(null);
      
      }
    });
  
    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (firestoreUnsubscribe) firestoreUnsubscribe(); // Cleanup Firestore listener
    };
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force immediate retrieval of user data instead of waiting for auth state change
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        createdAt: userCredential.user.metadata.creationTime,
        ...(userDoc.exists() ? userDoc.data() : {})
      };
      
      // Explicitly update AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to login. Please try again.' 
      };
    }
  };
  
  // Signup function
  const signup = async (email, password, displayName) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await firebaseUpdateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        isOnboarded: false,
        username,
        // Add any additional user fields you want to store
      });
      
      // Force immediate user data update
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
        createdAt: userCredential.user.metadata.creationTime,
        isOnboarded: false
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account. Please try again.' 
      };
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      // Explicitly clear AsyncStorage and state
      await AsyncStorage.removeItem('user');
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to logout. Please try again.' 
      };
    }
  };
  
  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }
      
      // Update Firebase Auth profile if display name or photo URL is provided
      if (updates.displayName || updates.photoURL) {
        await firebaseUpdateProfile(currentUser, {
          displayName: updates.displayName || currentUser.displayName,
          photoURL: updates.photoURL || currentUser.photoURL
        });
      }
      
      // Update Firestore document with all updates
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
      
      // Get the updated user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      // Merge Firebase auth data with Firestore data
      const updatedUser = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        ...userDoc.data()
      };
      
      // Update AsyncStorage and state
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile. Please try again.' 
      };
    }
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      return await updateProfile({ isOnboarded: true });
    } catch (error) {
      console.error('Complete onboarding error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to complete onboarding. Please try again.' 
      };
    }
  };
  
  // Reset password - fixed to use the correct Firebase function
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send password reset email. Please try again.' 
      };
    }
  };

  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }
  
      // First, delete the user document from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
  
      // Then, delete the Firebase Authentication user
      await deleteUser(currentUser);
  
      // Remove user data from AsyncStorage
      await AsyncStorage.removeItem('user');
  
      // Set user state to null
      setUser(null);
  
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete account. Please try again.'
      };
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login,
      signup,
      logout,
      updateProfile,
      completeOnboarding,
      resetPassword,
      deleteAccount,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};