import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        await UserService.createUserDocument(user);
        
        const unsubscribeUser = UserService.onUserDataChange(
          user.uid,
          (data) => setUserData(data)
        );
        
        return () => unsubscribeUser();
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    signIn: AuthService.signInWithEmail,
    signUp: async (email, password, additionalData) => {
      const userCredential = await AuthService.signUpWithEmail(email, password);
      await UserService.createUserDocument(userCredential.user, additionalData);
      return userCredential.user;
    },
    signOut: AuthService.signOut,
    updateUserData: (data) => UserService.updateUserData(user?.uid, data),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};