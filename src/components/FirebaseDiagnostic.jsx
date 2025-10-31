import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';

const FirebaseDiagnostic = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState({
    firebaseInit: 'testing',
    authStatus: 'testing',
    databaseConnection: 'testing'
  });
  const [detailedResults, setDetailedResults] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    runDiagnostics();
  }, [currentUser]);

  const runDiagnostics = async () => {
    const results = {};
    
    // Test 1: Firebase Initialization
    try {
      if (auth && db) {
        setDiagnostics(prev => ({ ...prev, firebaseInit: 'success' }));
        results.firebaseInit = { status: 'success', message: 'Firebase initialized correctly' };
      } else {
        setDiagnostics(prev => ({ ...prev, firebaseInit: 'error' }));
        results.firebaseInit = { status: 'error', message: 'Firebase initialization failed' };
      }
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, firebaseInit: 'error' }));
      results.firebaseInit = { status: 'error', message: error.message };
    }

    // Test 2: Authentication Status
    try {
      if (currentUser) {
        setDiagnostics(prev => ({ ...prev, authStatus: 'success' }));
        results.authStatus = { 
          status: 'success', 
          message: `Authenticated as: ${currentUser.email}`,
          details: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          }
        };
      } else {
        setDiagnostics(prev => ({ ...prev, authStatus: 'warning' }));
        results.authStatus = { status: 'warning', message: 'No user authenticated' };
      }
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, authStatus: 'error' }));
      results.authStatus = { status: 'error', message: error.message };
    }

    // Test 3: Realtime Database Connection
    try {
      // Simple connection test
      const testRef = ref(db, 'test/connection');
      await get(testRef);
      setDiagnostics(prev => ({ ...prev, databaseConnection: 'success' }));
      results.databaseConnection = { status: 'success', message: 'Realtime Database connection successful' };
    } catch (error) {
      setDiagnostics(prev => ({ ...prev, databaseConnection: 'error' }));
      results.databaseConnection = { 
        status: 'error', 
        message: 'Realtime Database connection failed',
        error: error.code,
        solution: 'Check Firebase project configuration'
      };
    }

    setDetailedResults(results);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'testing': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🔍 Firebase Diagnostic Tool</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Diagnostic Tests */}
          <div className="grid gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getStatusIcon(diagnostics.firebaseInit)}</span>
                <h3 className={`font-semibold ${getStatusColor(diagnostics.firebaseInit)}`}>
                  Firebase Initialization
                </h3>
              </div>
              {detailedResults.firebaseInit && (
                <p className="text-gray-300 text-sm">{detailedResults.firebaseInit.message}</p>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getStatusIcon(diagnostics.authStatus)}</span>
                <h3 className={`font-semibold ${getStatusColor(diagnostics.authStatus)}`}>
                  Authentication Status
                </h3>
              </div>
              {detailedResults.authStatus && (
                <div className="text-gray-300 text-sm">
                  <p>{detailedResults.authStatus.message}</p>
                  {detailedResults.authStatus.details && (
                    <div className="mt-2 text-xs text-gray-400">
                      <p>UID: {detailedResults.authStatus.details.uid}</p>
                      <p>Display Name: {detailedResults.authStatus.details.displayName || 'Not set'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getStatusIcon(diagnostics.databaseConnection)}</span>
                <h3 className={`font-semibold ${getStatusColor(diagnostics.databaseConnection)}`}>
                  Realtime Database Connection
                </h3>
              </div>
              {detailedResults.databaseConnection && (
                <div className="text-gray-300 text-sm">
                  <p>{detailedResults.databaseConnection.message}</p>
                  {detailedResults.databaseConnection.error && (
                    <p className="text-red-400 mt-1">Error: {detailedResults.databaseConnection.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Solutions */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4 mt-6">
            <h3 className="text-blue-400 font-semibold mb-3">🛠️ Quick Solutions</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-red-400">❌</span>
                <div>
                  <p className="font-medium">If Database connection fails:</p>
                  <p className="text-gray-400">1. Check if Realtime Database is enabled in Firebase Console</p>
                  <p className="text-gray-400">2. Verify project ID in configuration</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-red-400">❌</span>
                <div>
                  <p className="font-medium">If permission denied errors:</p>
                  <p className="text-gray-400">1. Update Database Rules in Firebase Console</p>
                  <p className="text-gray-400">2. Use the recommended rules in documentation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Firebase Console Links */}
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
            <h3 className="text-purple-400 font-semibold mb-3">🔗 Firebase Console Links</h3>
            <div className="space-y-2">
              <a 
                href="https://console.firebase.google.com/project/nexus-012/database/rules"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 transition-colors"
              >
                📋 Realtime Database Security Rules
              </a>
              <a 
                href="https://console.firebase.google.com/project/nexus-012/database/data"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 transition-colors"
              >
                📊 Realtime Database Data Viewer
              </a>
              <a 
                href="https://console.firebase.google.com/project/nexus-012/authentication/users"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 transition-colors"
              >
                👥 Authentication Users
              </a>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <button
              onClick={runDiagnostics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              🔄 Run Diagnostics Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDiagnostic;