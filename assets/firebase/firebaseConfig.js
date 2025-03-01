import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc , deleteDoc} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Optionally import the services that you want to use
import {getAuth} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

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
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export {app, db, getFirestore, collection, addDoc, getDocs, auth, getDoc, updateDoc, deleteDoc, getAuth};

