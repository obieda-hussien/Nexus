import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Eagerly loaded components (critical for initial page load)
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import BecomeInstructorPage from './pages/BecomeInstructorPage';

// Lazy loaded components (loaded only when needed)
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const InstructorDashboard = React.lazy(() => import('./pages/InstructorDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Lazy loaded services to reduce initial bundle size
const initializeServices = async () => {
  const [{ default: AnalyticsService }, { default: SecurityService }] = await Promise.all([
    import('./services/AnalyticsService'),
    import('./services/SecurityService')
  ]);
  
  // Initialize security monitoring
  SecurityService.initializeSessionSecurity();
  
  // Track page view
  AnalyticsService.trackPageView('home', 'Nexus Educational Platform');
};

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="min-h-screen bg-primary-bg flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

function App() {
  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
    });

    // Set default direction
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');

    // Initialize services asynchronously to not block initial render
    initializeServices().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <Router basename="/Nexus">
        <div className="min-h-screen bg-primary-bg text-white">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/become-instructor" element={<BecomeInstructorPage />} />
              
              {/* Student Routes - Lazy Loaded */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              
              {/* Instructor Routes - Lazy Loaded */}
              <Route path="/instructor/*" element={<InstructorDashboard />} />
              
              {/* Admin Routes - Lazy Loaded */}
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </Suspense>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
