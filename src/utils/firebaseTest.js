// Test Firebase connection and create a sample course
// This script helps debug course creation issues

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, push, set, get } from 'firebase/database';

// Firebase configuration
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
const auth = getAuth(app);
const db = getDatabase(app);

console.log('🔧 Firebase Test Script Started');

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...');
    const testRef = ref(db, 'test/connection');
    await get(testRef);
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    return false;
  }
}

// Test auth state
function testAuthState() {
  return new Promise((resolve) => {
    console.log('👤 Testing auth state...');
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.uid);
        console.log('User details:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });
        resolve(user);
      } else {
        console.log('❌ No authenticated user');
        resolve(null);
      }
    });
  });
}

// Test course creation
async function testCourseCreation(user) {
  if (!user) {
    console.log('❌ Cannot test course creation without authenticated user');
    return false;
  }

  try {
    console.log('📚 Testing course creation...');
    
    const courseRef = push(ref(db, 'courses'));
    const testCourse = {
      id: courseRef.key,
      title: 'Test Course - Course Creation Test',
      description: 'This is a test course to verify creation functionality',
      category: 'test',
      level: 'beginner',
      language: 'ar',
      price: 0,
      isfree: true,
      instructorId: user.uid,
      instructorName: user.displayName || 'Test Instructor',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentsCount: 0,
      rating: 0,
      reviewsCount: 0,
      curriculum: {
        sections: [
          {
            id: '1',
            title: 'Test Section',
            order: 1,
            lessons: [
              {
                id: '1',
                title: 'Test Lesson',
                type: 'article',
                content: '# Test Markdown Content\n\nThis is a **test lesson** with *markdown* support.',
                order: 1
              }
            ]
          }
        ]
      }
    };

    await set(courseRef, testCourse);
    console.log('✅ Test course created successfully with ID:', courseRef.key);
    
    // Verify the course was saved
    const savedCourse = await get(courseRef);
    if (savedCourse.exists()) {
      console.log('✅ Course verification successful');
      console.log('Course data:', savedCourse.val().title);
      return true;
    } else {
      console.log('❌ Course verification failed - course not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Course creation failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Firebase tests...');
  
  // Test 1: Database connection
  const dbConnected = await testDatabaseConnection();
  
  // Test 2: Auth state
  const user = await testAuthState();
  
  // Test 3: Course creation (only if authenticated)
  let courseCreated = false;
  if (user) {
    courseCreated = await testCourseCreation(user);
  }
  
  // Summary
  console.log('\n📊 Test Results:');
  console.log('- Database Connection:', dbConnected ? '✅ Success' : '❌ Failed');
  console.log('- User Authentication:', user ? '✅ Success' : '❌ Failed');
  console.log('- Course Creation:', courseCreated ? '✅ Success' : '❌ Failed');
  
  if (dbConnected && user && courseCreated) {
    console.log('\n🎉 All tests passed! Course creation should work properly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above for troubleshooting.');
  }
}

// Export for use in React components
export { testDatabaseConnection, testAuthState, testCourseCreation, runTests };

// Auto-run tests if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called manually
  window.runFirebaseTests = runTests;
  console.log('💡 Firebase tests available. Call window.runFirebaseTests() in console to run.');
}