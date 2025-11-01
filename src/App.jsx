import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Services
import AnalyticsService from './services/AnalyticsService';
import SecurityService from './services/SecurityService';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailsPage = lazy(() => import('./pages/CourseDetailsPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BecomeInstructorPage = lazy(() => import('./pages/BecomeInstructorPage'));
const InstructorApplicationPage = lazy(() => import('./pages/InstructorApplicationPage'));
const AdminInstructorPanel = lazy(() => import('./pages/AdminInstructorPanel'));
const PaymentIntegrationTest = lazy(() => import('./components/common/PaymentIntegrationTest'));
const DataSetupPage = lazy(() => import('./pages/DataSetupPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-primary-bg flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white text-lg">Loading...</p>
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

    // Initialize security monitoring
    SecurityService.initializeSessionSecurity();

    // Track page view
    AnalyticsService.trackPageView('home', 'Nexus Educational Platform');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary-bg text-white">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Root redirect - HomePage is the main landing page */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public Routes */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/become-instructor" element={<BecomeInstructorPage />} />
              <Route path="/instructor-application" element={<InstructorApplicationPage />} />
              <Route path="/test-payment" element={<PaymentIntegrationTest />} />
              <Route path="/setup-data" element={<DataSetupPage />} />
              
              {/* Student Routes */}
              <Route path="/dashboard" element={<StudentDashboard />} />
              
              {/* Instructor Routes */}
              <Route path="/instructor" element={<InstructorDashboard />} />
              <Route path="/instructor/*" element={<InstructorDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/admin/instructors" element={<AdminInstructorPanel />} />
              
              {/* Legacy route redirects (for backward compatibility) */}
              <Route path="/Nexus" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
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
