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
import { auth, db, checkFirestoreConnection } from '../config/firebase';

// Create Authentication Context
const AuthContext = createContext();

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Test Firestore connection on app load
  useEffect(() => {
    const testConnection = async () => {
      const connected = await checkFirestoreConnection();
      setFirestoreConnected(connected);
      
      if (!connected) {
        console.warn('⚠️ Firestore connection failed. Check Firebase configuration and security rules.');
      }
    };
    
    testConnection();
  }, []);

  // Sign up function with enhanced error handling
  const signup = async (email, password, displayName) => {
    console.log('🚀 Starting registration process...', { email, displayName });
    
    try {
      // First create the authentication user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ User created in Firebase Auth:', user.uid);
      
      // Update user profile in Firebase Auth
      await updateProfile(user, { displayName });
      console.log('✅ Profile updated in Firebase Auth');
      
      // Create comprehensive user document in Firestore
      const userProfileData = {
        uid: user.uid,
        displayName: displayName || 'مستخدم جديد',
        email,
        createdAt: new Date().toISOString(),
        role: 'student',
        progress: {},
        enrolledCourses: [],
        completedCourses: [],
        lastLogin: new Date().toISOString(),
        // Additional profile fields for LMS
        profilePicture: null,
        bio: '',
        phoneNumber: '',
        dateOfBirth: '',
        preferences: {
          language: 'ar',
          notifications: true,
          darkMode: true,
          theme: 'dark'
        },
        // Learning analytics
        totalTimeSpent: 0,
        coursesCompleted: 0,
        achievementsUnlocked: [],
        learningStreak: 0
      };
      
      console.log('📝 Attempting to save user profile to Firestore...', userProfileData);
      
      // Enhanced Firestore save with multiple fallback strategies
      let saveSuccess = false;
      
      try {
        // Primary save attempt
        await setDoc(doc(db, 'users', user.uid), userProfileData);
        console.log('✅ User profile saved to Firestore successfully');
        saveSuccess = true;
      } catch (firestoreError) {
        console.error('❌ Primary Firestore save failed:', firestoreError);
        
        // Fallback 1: Try with merge option
        try {
          await setDoc(doc(db, 'users', user.uid), userProfileData, { merge: true });
          console.log('✅ User profile saved to Firestore with merge option');
          saveSuccess = true;
        } catch (mergeError) {
          console.error('❌ Firestore merge save failed:', mergeError);
          
          // Fallback 2: Save minimal profile
          try {
            const minimalProfile = {
              uid: user.uid,
              displayName: displayName || 'مستخدم جديد',
              email,
              createdAt: new Date().toISOString(),
              role: 'student'
            };
            
            await setDoc(doc(db, 'users', user.uid), minimalProfile);
            console.log('✅ Minimal user profile saved to Firestore');
            saveSuccess = true;
          } catch (minimalError) {
            console.error('❌ All Firestore save attempts failed:', minimalError);
            
            // Provide user guidance
            console.error('🛠️ Troubleshooting tips:');
            console.error('1. Check Firebase Console → Firestore → Rules');
            console.error('2. Ensure rules allow authenticated users to write');
            console.error('3. Verify project configuration in Firebase Console');
            
            // Don't throw error - user is still authenticated
            saveSuccess = false;
          }
        }
      }
      
      // Update local state regardless of Firestore save result
      if (saveSuccess) {
        setUserProfile(userProfileData);
        console.log('🎉 Registration completed successfully with data persistence');
      } else {
        setUserProfile(null);
        console.warn('⚠️ Registration completed but profile data not saved. User can create profile manually.');
      }
      
      return { user, profileSaved: saveSuccess };
    } catch (error) {
      console.error('💥 Registration process failed:', error);
      
      // Provide specific error guidance
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('هذا البريد الإلكتروني مستخدم بالفعل');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('كلمة المرور ضعيفة جداً');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('البريد الإلكتروني غير صالح');
      } else {
        throw new Error('فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى');
      }
    }
  };

  // Sign in function with profile sync
  const signin = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in:', user.uid);
      
      // Update last login if possible
      try {
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
        console.log('✅ Last login time updated');
      } catch (error) {
        console.warn('⚠️ Could not update last login time:', error);
      }
      
      // Fetch and update user profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      return user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('المستخدم غير موجود');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('البريد الإلكتروني غير صالح');
      } else {
        throw new Error('فشل في تسجيل الدخول');
      }
    }
  };

  // Sign out function
  const logout = () => {
    console.log('🚪 User signing out...');
    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Get user profile from Firestore with enhanced error handling
  const getUserProfile = async (userId) => {
    try {
      console.log('📖 Fetching user profile for:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ User profile fetched successfully:', userData.displayName);
        return userData;
      } else {
        console.log('📭 No user profile found in Firestore for:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Firestore security rules');
      }
      
      return null;
    }
  };

  // Create or update user profile if missing
  const createUserProfile = async (userData = {}) => {
    if (!currentUser) {
      console.error('❌ No authenticated user to create profile for');
      return null;
    }
    
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
          theme: 'dark',
          ...userData.preferences
        },
        // Learning analytics
        totalTimeSpent: userData.totalTimeSpent || 0,
        coursesCompleted: userData.coursesCompleted || 0,
        achievementsUnlocked: userData.achievementsUnlocked || [],
        learningStreak: userData.learningStreak || 0
      };
      
      console.log('📝 Creating/updating user profile:', userProfileData.displayName);
      await setDoc(doc(db, 'users', currentUser.uid), userProfileData, { merge: true });
      setUserProfile(userProfileData);
      console.log('✅ User profile created/updated successfully');
      
      return userProfileData;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Firestore security rules');
        console.error('📋 Required rule: allow read, write: if request.auth != null && request.auth.uid == userId;');
      }
      
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
      
      console.log('✅ Progress updated for lesson:', lessonId);
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const enrolledCourses = userData?.enrolledCourses || [];
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId);
        await setDoc(userRef, {
          enrolledCourses,
          enrolledAt: {
            ...userData?.enrolledAt,
            [courseId]: new Date().toISOString()
          }
        }, { merge: true });
        
        console.log('✅ Enrolled in course:', courseId);
      }
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user?.uid || 'No user');
      
      if (user) {
        setCurrentUser(user);
        console.log('👤 Loading user profile...');
        
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setUserProfile(profile);
          console.log('✅ User profile loaded:', profile.displayName);
        } else {
          console.log('📭 No profile found - user may need to create one manually');
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        console.log('🚪 User logged out');
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
    createUserProfile,
    firestoreConnected
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