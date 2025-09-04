import React from 'react';
import Navigation from '../components/sections/Navigation';
import Footer from '../components/sections/Footer';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { currentUser, userProfile } = useAuth();

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            مرحباً، {currentUser?.displayName || 'الطالب'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">الكورسات المسجلة</h3>
              <p className="text-3xl font-bold text-blue-400">0</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">الكورسات المكتملة</h3>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">ساعات التعلم</h3>
              <p className="text-3xl font-bold text-purple-400">0</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-gray-300">لوحة تحكم الطالب قيد التطوير...</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StudentDashboard;