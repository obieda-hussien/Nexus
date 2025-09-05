import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BecomeInstructorPage from './pages/BecomeInstructorPage';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Services
import AnalyticsService from './services/AnalyticsService';
import SecurityService from './services/SecurityService';

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
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/Nexus/" replace />} />
            
            {/* Public Routes */}
            <Route path="/Nexus/" element={<HomePage />} />
            <Route path="/Nexus/courses" element={<CoursesPage />} />
            <Route path="/Nexus/courses/:id" element={<CourseDetailsPage />} />
            <Route path="/Nexus/become-instructor" element={<BecomeInstructorPage />} />
            
            {/* Student Routes */}
            <Route path="/Nexus/dashboard" element={<StudentDashboard />} />
            
            {/* Instructor Routes */}
            <Route path="/Nexus/instructor" element={<InstructorDashboard />} />
            <Route path="/Nexus/instructor/*" element={<InstructorDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/Nexus/admin" element={<AdminDashboard />} />
            <Route path="/Nexus/admin/*" element={<AdminDashboard />} />
          </Routes>
          
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
