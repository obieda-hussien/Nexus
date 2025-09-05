import React from 'react';

// Components
import Navigation from '../components/sections/Navigation';
import Hero from '../components/sections/Hero';
import Courses from '../components/sections/Courses';
import Stats from '../components/sections/Stats';
import CompetitiveAdvantages from '../components/sections/CompetitiveAdvantages';
import LiveSessions from '../components/sections/LiveSessions';
import Instructor from '../components/sections/Instructor';
import TestimonialsReviews from '../components/sections/TestimonialsReviews';
import Pricing from '../components/sections/Pricing';
import Footer from '../components/sections/Footer';

const HomePage = () => {
  return (
    <>
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
    </>
  );
};

export default HomePage;