// Firebase configuration for Nexus Educational Platform
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using the provided config
const firebaseConfig = {
  apiKey: "AIzaSyDjl-tbsDaqx_9vpZaCqn45eT06kKPVU6A",
  authDomain: "nexus-012.firebaseapp.com",
  databaseURL: "https://nexus-012-default-rtdb.firebaseio.com",
  projectId: "nexus-012",
  storageBucket: "nexus-012.firebasestorage.app",
  messagingSenderId: "272428886699",
  appId: "1:272428886699:web:f2ca98a2855ef56ee7a5ee",
  measurementId: "G-03MW3Y67RF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Export the app instance
export default app;