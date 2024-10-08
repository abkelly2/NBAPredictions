// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHZk1eXkdovmxGVXLJTuN7JtjSizo77gM",
  authDomain: "nbapredictions-47e35.firebaseapp.com",
  projectId: "nbapredictions-47e35",
  storageBucket: "nbapredictions-47e35.appspot.com",
  messagingSenderId: "233945324607",
  appId: "1:233945324607:web:d2a5147e772b57909c2c8a",
  measurementId: "G-T6TNPWXX86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
const analytics = getAnalytics(app);
export const storage = getStorage(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export const db = getFirestore(app);
