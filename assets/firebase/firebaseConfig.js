import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc , deleteDoc} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getStorage} from "firebase/storage";




// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAa4KuuMhZNToEr59Uv2YCaCIiB_jsfeEQ",
    authDomain: "uclcommunity.firebaseapp.com",
    projectId: "uclcommunity",
    storageBucket: "uclcommunity.appspot.com",
    messagingSenderId: "77961618652",
    appId: "1:77961618652:web:0a35ee8bfa045b6b1c0019",
    measurementId: "G-EXV9Z63NR0"
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export {app, db, storage, getFirestore, collection, addDoc, getDocs, auth, getDoc, updateDoc, deleteDoc, getAuth};

