import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updatePassword
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, db, checkDatabaseConnection } from '../config/firebase';

// Create Authentication Context
const AuthContext = createContext();

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [databaseConnected, setDatabaseConnected] = useState(false);

  // Test Realtime Database connection on app load
  useEffect(() => {
    const testConnection = async () => {
      const connected = await checkDatabaseConnection();
      setDatabaseConnected(connected);
      
      if (!connected) {      }
    };
    
    testConnection();
  }, []);

  // Sign up function with enhanced error handling
  const signup = async (email, password, displayName) => {    
    try {
      // First create the authentication user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);      
      // Update user profile in Firebase Auth
      await updateProfile(user, { displayName });      
      // Create comprehensive user document in Realtime Database
      const userProfileData = {
        uid: user.uid,
        displayName: displayName || 'New User',
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
          language: 'ar', // Default language preference
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
      // Enhanced Realtime Database save with multiple fallback strategies
      let saveSuccess = false;
      
      try {
        // Primary save attempt
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, userProfileData);        saveSuccess = true;
      } catch (databaseError) {
        console.error('❌ Primary Realtime Database save failed:', databaseError);
        
        // Fallback 1: Try saving minimal profile
        try {
          const minimalProfile = {
            uid: user.uid,
            displayName: displayName || 'New User',
            email,
            createdAt: new Date().toISOString(),
            role: 'student'
          };
          
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, minimalProfile);          saveSuccess = true;
        } catch (minimalError) {
          console.error('❌ All Realtime Database save attempts failed:', minimalError);
          
          // Provide user guidance
          console.error('🛠️ Troubleshooting tips:');
          console.error('1. Check Firebase Console → Realtime Database → Rules');
          console.error('2. Ensure rules allow authenticated users to write');
          console.error('3. Verify project configuration in Firebase Console');
          
          // Don't throw error - user is still authenticated
          saveSuccess = false;
        }
      }
      
      // Update local state regardless of Realtime Database save result
      if (saveSuccess) {
        setUserProfile(userProfileData);      } else {
        setUserProfile(null);      }
      
      return { user, profileSaved: saveSuccess };
    } catch (error) {
      console.error('💥 Registration process failed:', error);
      
      // Provide specific error guidance
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already in use');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email');
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    }
  };

  // Sign in function with profile sync
  const signin = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);      
      // Update last login if possible
      try {
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          lastLogin: new Date().toISOString()
        });      } catch (error) {      }
      
      // Fetch and update user profile
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      return user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email');
      } else {
        throw new Error('Failed to log in. Please check your credentials.');
      }
    }
  };

  // Google Sign In function
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add custom scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists in Realtime Database
      const profile = await getUserProfile(user.uid);
      
      if (!profile) {
        // Create profile for new Google user
        const userProfileData = {
          uid: user.uid,
          displayName: user.displayName || 'Google User',
          email: user.email,
          emailVerified: user.emailVerified,
          profilePicture: user.photoURL || null,
          createdAt: new Date().toISOString(),
          role: 'student',
          progress: {},
          enrolledCourses: [],
          completedCourses: [],
          lastLogin: new Date().toISOString(),
          // User information fields
          phoneNumber: '',
          dateOfBirth: '',
          address: '',
          city: '',
          country: '',
          // Preferences
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
        
        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, userProfileData);
        setUserProfile(userProfileData);
      } else {
        // Update last login
        try {
          const userRef = ref(db, `users/${user.uid}`);
          await update(userRef, {
            lastLogin: new Date().toISOString(),
            emailVerified: user.emailVerified || false
          });
        } catch (error) {
          console.warn('Failed to update last login:', error);
        }
        setUserProfile(profile);
      }
      
      return user;
    } catch (error) {
      console.error('Google Sign In failed:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('تسجيل الدخول تم إلغاؤه');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('النوافذ المنبثقة محظورة، يرجى السماح بالنوافذ المنبثقة');
      } else {
        throw new Error('فشل في تسجيل الدخول باستخدام Google');
      }
    }
  };

  // Sign out function
  const logout = () => {    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Change password function
  const changePassword = async (newPassword) => {
    if (!currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    try {
      await updatePassword(currentUser, newPassword);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      
      if (error.code === 'auth/weak-password') {
        throw new Error('كلمة المرور ضعيفة جداً');
      } else if (error.code === 'auth/requires-recent-login') {
        throw new Error('هذا الإجراء يتطلب تسجيل دخول جديد لأسباب أمنية');
      } else {
        throw new Error('فشل في تغيير كلمة المرور');
      }
    }
  };

  // Update user profile information
  const updateUserInfo = async (userInfo) => {
    if (!currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    
    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      
      const updates = {
        displayName: userInfo.displayName || currentUser.displayName,
        phoneNumber: userInfo.phoneNumber || '',
        dateOfBirth: userInfo.dateOfBirth || '',
        address: userInfo.address || '',
        city: userInfo.city || '',
        country: userInfo.country || '',
        bio: userInfo.bio || '',
        profilePicture: userInfo.profilePicture || currentUser.photoURL,
        updatedAt: new Date().toISOString()
      };
      
      await update(userRef, updates);
      
      // Update local state
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          ...updates
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user info:', error);
      throw new Error('فشل في تحديث المعلومات');
    }
  };

  // Get user profile from Realtime Database with enhanced error handling
  const getUserProfile = async (userId) => {
    try {      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();        return userData;
      } else {        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Realtime Database security rules');
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
        displayName: userData.displayName || currentUser.displayName || 'New User',
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
          language: 'ar', // Default language preference
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
      };      const userRef = ref(db, `users/${currentUser.uid}`);
      await update(userRef, userProfileData);
      setUserProfile(userProfileData);      
      return userProfileData;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Realtime Database security rules');
        console.error('📋 Required rule: allow read, write: if auth != null && auth.uid == $uid;');
      }
      
      return null;
    }
  };

  // Update user progress
  const updateUserProgress = async (courseId, lessonId, progress) => {
    if (!currentUser) return;
    
    try {
      const progressRef = ref(db, `users/${currentUser.uid}/progress/${courseId}/${lessonId}`);
      await set(progressRef, {
        completed: progress.completed,
        completedAt: progress.completed ? new Date().toISOString() : null,
        timeSpent: progress.timeSpent || 0
      });    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  };

  // Enroll in course
  const enrollInCourse = async (courseId) => {
    if (!currentUser) return;
    
    try {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val() || {};
      
      const enrolledCourses = userData?.enrolledCourses || [];
      if (!enrolledCourses.includes(courseId)) {
        enrolledCourses.push(courseId);
        
        const updates = {
          enrolledCourses,
          [`enrolledAt/${courseId}`]: new Date().toISOString()
        };
        
        await update(userRef, updates);      }
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
    }
  };

  // Update user role (for becoming instructor)
  const updateUserRole = async (newRole) => {
    if (!currentUser) {
      console.error('❌ No authenticated user to update role for');
      return false;
    }
    
    try {      const userRef = ref(db, `users/${currentUser.uid}`);
      
      const updates = {
        role: newRole,
        roleUpdatedAt: new Date().toISOString(),
        // Add instructor-specific fields if becoming instructor
        ...(newRole === 'instructor' && {
          instructorProfile: {
            bio: '',
            specialization: '',
            experience: '',
            coursesCreated: 0,
            totalstudents: 0,
            rating: 0,
            joinedAsInstructorAt: new Date().toISOString()
          }
        })
      };
      
      await update(userRef, updates);
      
      // Update local profile state
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          role: newRole,
          roleUpdatedAt: new Date().toISOString(),
          ...(newRole === 'instructor' && { instructorProfile: updates.instructorProfile })
        }));
      }      return true;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - user may not have access to update their role');
      }
      
      return false;
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return userProfile?.role === requiredRole;
  };

  // Check if user can perform instructor actions
  const canCreateCourses = () => {
    return hasRole('instructor') || hasRole('admin');
  };

  // Become instructor function
  const becomeInstructor = async () => {
    if (!currentUser) {
      throw new Error('You must be logged in first.');
    }

    if (hasRole('instructor') || hasRole('admin')) {
      throw new Error('You are already an instructor.');
    }

    const success = await updateUserRole('instructor');
    if (success) {      return true;
    } else {
      throw new Error('Failed to upgrade account to instructor. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {      
      if (user) {
        setCurrentUser(user);        
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          setUserProfile(profile);        } else {          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    signin,
    signInWithGoogle,
    logout,
    resetPassword,
    changePassword,
    updateUserInfo,
    updateUserProgress,
    enrollInCourse,
    getUserProfile,
    createUserProfile,
    updateUserRole,
    hasRole,
    canCreateCourses,
    becomeInstructor,
    databaseConnected
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
