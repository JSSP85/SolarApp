// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrSh_P2JjyOlveC1rkPS2_WBl2hY6E8ig",
  authDomain: "solarapp-12b70.firebaseapp.com",
  projectId: "solarapp-12b70",
  storageBucket: "solarapp-12b70.firebasestorage.app",
  messagingSenderId: "780419471456",
  appId: "1:780419471456:web:7fa3c5e1c01fbe1f6c8b05",
  measurementId: "G-R3304E46HX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
