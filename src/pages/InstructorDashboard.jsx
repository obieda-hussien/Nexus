import React from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';

const InstructorDashboard = () => {
  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">لوحة تحكم المدرس</h1>
          <p className="text-gray-300">لوحة تحكم المدرس قيد التطوير...</p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstructorDashboard;