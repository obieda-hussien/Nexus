// Firebase configuration for Nexus Educational Platform
// Configured for free plan: Authentication + Cloud Firestore (no Storage)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using the provided config
const firebaseConfig = {
  apiKey: "AIzaSyDjl-tbsDaqx_9vpZaCqn45eT06kKPVU6A",
  authDomain: "nexus-012.firebaseapp.com",
  // Note: databaseURL is for Realtime Database, but we're using Cloud Firestore
  // databaseURL: "https://nexus-012-default-rtdb.firebaseio.com",
  projectId: "nexus-012",
  storageBucket: "nexus-012.firebasestorage.app", // Storage not used in free plan
  messagingSenderId: "272428886699",
  appId: "1:272428886699:web:f2ca98a2855ef56ee7a5ee",
  measurementId: "G-03MW3Y67RF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Helper function to check if Firestore is accessible
export const checkFirestoreConnection = async () => {
  try {
    // This will test if we can access Firestore
    const { doc, getDoc } = await import('firebase/firestore');
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log('✅ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    return false;
  }
};

// Export the app instance
export default app;