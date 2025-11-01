// صفحة إعداد البيانات التجريبية - صفحة مؤقتة للإعداد
// Sample Data Setup Page - Temporary setup page

import React, { useState } from 'react';
import EnhancedDataSetupService from '../services/EnhancedDataSetupService';

const DataSetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSetupData = async () => {
    if (!window.confirm('Are you sure you want to add sample data? Existing data will be replaced.')) {
      return;
    }

    setLoading(true);
    setMessage('Adding sample data...');

    try {
      const result = await EnhancedDataSetupService.setupAllSampleData();
      
      if (result.success) {
        setSuccess(true);
        setMessage('✅ All sample data added successfully!');
      } else {
        setSuccess(false);
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('⚠️ Warning! Are you sure you want to delete all data? This action cannot be undone!')) {
      return;
    }

    setLoading(true);
    setMessage('Deleting data...');

    try {
      const result = await EnhancedDataSetupService.clearAllData();
      
      if (result.success) {
        setSuccess(true);
        setMessage('✅ All data deleted successfully!');
      } else {
        setSuccess(false);
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Sample Data Setup
          </h1>
          <p className="text-gray-300">
            Use this page to add or delete sample data from the database
          </p>
        </div>

        <div className="space-y-6">
          {/* Add Sample Data Button */}
          <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-400/30">
            <h2 className="text-xl font-semibold text-white mb-3">
              Add Sample Data
            </h2>
            <p className="text-gray-300 mb-4 text-sm">
              Includes: users, courses, lessons, enrollments, reviews, progress, and withdrawal requests
            </p>
            <button
              onClick={handleSetupData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Adding...' : 'Add Sample Data'}
            </button>
          </div>

/* Clear Data Button */
          <div className="bg-red-500/20 rounded-xl p-6 border border-red-400/30">
            <h2 className="text-xl font-semibold text-white mb-3">
              Delete All Data
            </h2>
            <p className="text-gray-300 mb-4 text-sm">
              ⚠️ Warning: All data will be permanently deleted from the database
            </p>
            <button
              onClick={handleClearData}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Deleting...' : 'Delete All Data'}
            </button>
          </div>

          {/* Result Message */}
          {message && (
            <div 
              className={`p-4 rounded-lg ${
                success 
                  ? 'bg-green-500/20 border border-green-400/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-400/30 text-red-300'
              }`}
            >
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

/* Return links */
          <div className="pt-6 border-t border-white/10">
            <div className="flex gap-4 justify-center">
              <a
                href="/Nexus/"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Back to Home Page
              </a>
              <span className="text-gray-500">|</span>
              <a
                href="/Nexus/courses"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Show Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSetupPage;
