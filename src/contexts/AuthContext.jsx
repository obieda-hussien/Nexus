import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create Authentication Context
const AuthContext = createContext();

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up function
  const signup = async (email, password, displayName) => {
    console.log('Starting signup process...', { email, displayName });
    
    try {
      // First create the authentication user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Auth:', user.uid);
      
      // Update user profile in Firebase Auth
      await updateProfile(user, { displayName });
      console.log('Profile updated in Auth');
      
      // Create user document in Firestore
      const userProfileData = {
        uid: user.uid,
        displayName,
        email,
        createdAt: new Date().toISOString(),
        role: 'student',
        progress: {},
        enrolledCourses: [],
        completedCourses: [],
        lastLogin: new Date().toISOString(),
        // Additional profile fields
        profilePicture: null,
        bio: '',
        phoneNumber: '',
        dateOfBirth: '',
        preferences: {
          language: 'ar',
          notifications: true,
          darkMode: true
        }
      };
      
      console.log('Attempting to save user data to Firestore:', userProfileData);
      
      // Use a try-catch specifically for Firestore write
      try {
        await setDoc(doc(db, 'users', user.uid), userProfileData);
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Firestore write error:', firestoreError);
        // Try alternative approach - set with merge
        try {
          await setDoc(doc(db, 'users', user.uid), userProfileData, { merge: true });
          console.log('User data saved to Firestore with merge successfully');
        } catch (mergeError) {
          console.error('Firestore merge error:', mergeError);
          // Even if Firestore fails, we still have the auth user, so don't throw
          console.warn('Continuing with authentication only, Firestore save failed');
        }
      }
      
      // Update the local userProfile state immediately
      setUserProfile(userProfileData);
      console.log('Local userProfile state updated');
      
      return user;
    } catch (error) {
      console.error('Error in signup process:', error);
      throw error;
    }
  };

  // Sign in function
  const signin = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    // Refresh user profile
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
    
    return user;
  };

  // Sign out function
  const logout = () => {
    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Get user profile from Firestore
  const getUserProfile = async (userId) => {
    try {
      console.log('Fetching user profile for:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User profile fetched successfully:', userData);
        return userData;
      } else {
        console.log('No user profile found in Firestore for:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Create or update user profile if missing
  const createUserProfile = async (userData = {}) => {
    if (!currentUser) return null;
    
    try {
      const userProfileData = {
        uid: currentUser.uid,
        displayName: userData.displayName || currentUser.displayName || 'مستخدم جديد',
        email: currentUser.email,
        createdAt: userData.createdAt || new Date().toISOString(),
        role: userData.role || 'student',
        progress: userData.progress || {},
        enrolledCourses: userData.enrolledCourses || [],
        completedCourses: userData.completedCourses || [],
        lastLogin: new Date().toISOString(),
        // Additional profile fields
        profilePicture: userData.profilePicture || null,
        bio: userData.bio || '',
        phoneNumber: userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        preferences: {
          language: 'ar',
          notifications: true,
          darkMode: true,
          ...userData.preferences
        }
      };
      
      console.log('Creating/updating user profile:', userProfileData);
      await setDoc(doc(db, 'users', currentUser.uid), userProfileData, { merge: true });
      setUserProfile(userProfileData);
      console.log('User profile created/updated successfully');
      
      return userProfileData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  };

  // Update user progress
  const updateUserProgress = async (courseId, lessonId, progress) => {
    if (!currentUser) return;
    
    try {
      const progressPath = `progress.${courseId}.${lessonId}`;
      await setDoc(doc(db, 'users', currentUser.uid), {
        [progressPath]: {
          completed: progress.completed,
          completedAt: progress.completed ? new Date().toISOString() : null,
          timeSpent: progress.timeSpent || 0
        }
      }, { merge: true });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const enrolledCourses = userData.enrolledCourses || [];
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId);
        await setDoc(userRef, {
          enrolledCourses,
          enrolledAt: {
            ...userData.enrolledAt,
            [courseId]: new Date().toISOString()
          }
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.uid || 'No user');
      if (user) {
        setCurrentUser(user);
        console.log('Getting user profile for authenticated user...');
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setUserProfile(profile);
          console.log('Auth state updated with profile:', profile);
        } else {
          console.log('No profile found, will need to create one manually');
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        console.log('User logged out, cleared auth state');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    signin,
    logout,
    resetPassword,
    updateUserProgress,
    enrollInCourse,
    getUserProfile,
    createUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};