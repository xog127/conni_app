import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc , deleteDoc} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getStorage} from "firebase/storage";
import Constants from 'expo-constants';




// Initialize Firebase
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig.extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig.extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig.extra.FIREBASE_APP_ID,
  measurementId: Constants.expoConfig.extra.FIREBASE_MEASUREMENT_ID
};

  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export {app, db, storage, getFirestore, collection, addDoc, getDocs, auth, getDoc, updateDoc, deleteDoc, getAuth};

