import React from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';

const BecomeInstructorPage = () => {
  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">كن مدرساً في نيكسوس</h1>
          <p className="text-gray-300">نموذج طلب أن تصبح مدرس قيد التطوير...</p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BecomeInstructorPage;