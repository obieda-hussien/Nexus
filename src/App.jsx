import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import Navigation from './components/sections/Navigation';
import Hero from './components/sections/Hero';
import Courses from './components/sections/Courses';
import Stats from './components/sections/Stats';
import CompetitiveAdvantages from './components/sections/CompetitiveAdvantages';
import LiveSessions from './components/sections/LiveSessions';
import Instructor from './components/sections/Instructor';
import TestimonialsReviews from './components/sections/TestimonialsReviews';
import Pricing from './components/sections/Pricing';
import Footer from './components/sections/Footer';

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
      <div className="min-h-screen bg-primary-bg text-white">
        <Navigation />
        <main>
          <Hero />
          <Courses />
          <Stats />
          <CompetitiveAdvantages />
          <LiveSessions />
          <Instructor />
          <TestimonialsReviews />
          <Pricing />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
