// Firebase configuration for Nexus Educational Platform
// Using REALTIME DATABASE (free plan compatible)
// Configured for free plan: Authentication + Realtime Database (no Storage, no Firestore)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - REALTIME DATABASE ONLY
const firebaseConfig = {
  apiKey: "AIzaSyDjl-tbsDaqx_9vpZaCqn45eT06kKPVU6A",
  authDomain: "nexus-012.firebaseapp.com",
  databaseURL: "https://nexus-012-default-rtdb.firebaseio.com", // Corrected Realtime Database URL
  projectId: "nexus-012", 
  storageBucket: "nexus-012.firebasestorage.app", // Storage not used in free plan
  messagingSenderId: "272428886699",
  appId: "1:272428886699:web:b426957001b662b9e7a5ee",
  measurementId: "G-D6ZFG1MHJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Analytics (only in production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Helper function to check if Realtime Database is accessible
export const checkDatabaseConnection = async () => {
  try {
    // This will test if we can access Realtime Database
    const { ref, get } = await import('firebase/database');
    const testRef = ref(db, 'test/connection');
    await get(testRef);
    console.log('✅ Realtime Database connection successful');
    return true;
  } catch (error) {
    // Handle permission denied errors more gracefully
    if (error.code === 'PERMISSION_DENIED') {
      console.warn('⚠️ Realtime Database: Permission denied. Please check Firebase rules.');
    } else if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      console.warn('⚠️ Realtime Database: Network error. Please check your internet connection.');
    } else {
      console.warn('⚠️ Realtime Database connection issue:', error.code || error.message);
    }
    return false;
  }
};

// Legacy alias for backward compatibility during migration
export const checkFirestoreConnection = checkDatabaseConnection;

// Export the app instance
export default app;