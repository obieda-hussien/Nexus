import React, { useState, useEffect } from 'react';
import { 
  Database, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkDatabaseConnection } from '../../config/firebase';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebase';

const FirebaseDiagnostic = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    firebaseInit: false,
    authStatus: false,
    databaseConnection: false,
    userProfileExists: false
  });
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      status, // 'success', 'error', 'warning'
      message,
      details,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    setTestResults([]);
    setDiagnostics({
      firebaseInit: false,
      authStatus: false,
      databaseConnection: false,
      userProfileExists: false
    });

    try {
      // Test 1: Firebase Initialization
      addTestResult('Firebase Initialization', 'success', 'Firebase تم تهيئته بنجاح');
      setDiagnostics(prev => ({ ...prev, firebaseInit: true }));

      // Test 2: Authentication Status
      if (currentUser) {
        addTestResult('Authentication', 'success', `مستخدم مسجل دخول: ${currentUser.email}`, {
          uid: currentUser.uid,
          emailVerified: currentUser.emailVerified
        });
        setDiagnostics(prev => ({ ...prev, authStatus: true }));
      } else {
        addTestResult('Authentication', 'error', 'None مستخدم مسجل دخول');
      }

      // Test 3: Database Connection
      const databaseConnected = await checkDatabaseConnection();
      if (databaseConnected) {
        addTestResult('Database Connection', 'success', 'الاتصال بقاعدة البيانات يعمل بنجاح');
        setDiagnostics(prev => ({ ...prev, databaseConnection: true }));
      } else {
        addTestResult('Database Connection', 'error', 'فشل في الاتصال بقاعدة البيانات', {
          solution: 'تحقق من إعدادات Firebase وقواعد الأمان'
        });
      }

      if (currentUser) {
        // Test 4: User Profile Exists
        try {
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            addTestResult('User Profile', 'success', 'ملف User موجود في قاعدة البيانات', {
              data: snapshot.val()
            });
            setDiagnostics(prev => ({ ...prev, userProfileExists: true }));
          } else {
            addTestResult('User Profile', 'warning', 'ملف User غير موجود في قاعدة البيانات', {
              solution: 'يمكنك إنشاء ملف شخصي New من Dashboard'
            });
          }
        } catch (error) {
          addTestResult('User Profile', 'error', 'خطأ في قراءة ملف User', {
            error: error.message,
            code: error.code
          });
        }
      }

    } catch (error) {
      addTestResult('General Error', 'error', 'خطأ عام في التشخيص', {
        error: error.message
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen, currentUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Database className="w-6 h-6" />
            أداة تشخيص Firebase
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Diagnostic Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`bg-gray-800/50 rounded-xl p-4 text-center ${diagnostics.firebaseInit ? 'border border-green-500/30' : 'border border-gray-700/30'}`}>
            <Database className={`w-8 h-8 mx-auto mb-2 ${diagnostics.firebaseInit ? 'text-green-400' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-300">تهيئة Firebase</p>
          </div>
          
          <div className={`bg-gray-800/50 rounded-xl p-4 text-center ${diagnostics.authStatus ? 'border border-green-500/30' : 'border border-gray-700/30'}`}>
            <User className={`w-8 h-8 mx-auto mb-2 ${diagnostics.authStatus ? 'text-green-400' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-300">المصادقة</p>
          </div>
          
          <div className={`bg-gray-800/50 rounded-xl p-4 text-center ${diagnostics.databaseConnection ? 'border border-green-500/30' : 'border border-gray-700/30'}`}>
            <Database className={`w-8 h-8 mx-auto mb-2 ${diagnostics.databaseConnection ? 'text-green-400' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-300">قاعدة البيانات</p>
          </div>
          
          <div className={`bg-gray-800/50 rounded-xl p-4 text-center ${diagnostics.userProfileExists ? 'border border-green-500/30' : 'border border-gray-700/30'}`}>
            <User className={`w-8 h-8 mx-auto mb-2 ${diagnostics.userProfileExists ? 'text-green-400' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-300">ملف User</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">نتائج التشخيص:</h3>
          {testResults.map((result, index) => (
            <div key={index} className="bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${getStatusColor(result.status)}`}>
                      {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{result.message}</p>
                  {result.details && (
                    <div className="mt-2 text-xs text-gray-400">
                      {result.details.solution && (
                        <p className="text-blue-400">الحل: {result.details.solution}</p>
                      )}
                      {result.details.error && (
                        <p className="text-red-400">خطأ: {result.details.error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'جاري التشخيص...' : 'إعادة تشخيص'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDiagnostic;