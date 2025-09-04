import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Database, 
  User, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { checkFirestoreConnection } from '../../config/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const FirebaseDiagnostic = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, firestoreConnected } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    firebaseInit: false,
    authStatus: false,
    firestoreConnection: false,
    userProfileExists: false,
    writePermission: false,
    readPermission: false
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
      firestoreConnection: false,
      userProfileExists: false,
      writePermission: false,
      readPermission: false
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
        addTestResult('Authentication', 'error', 'لا يوجد مستخدم مسجل دخول');
      }

      // Test 3: Firestore Connection
      const firestoreConnected = await checkFirestoreConnection();
      if (firestoreConnected) {
        addTestResult('Firestore Connection', 'success', 'الاتصال بـ Firestore يعمل بنجاح');
        setDiagnostics(prev => ({ ...prev, firestoreConnection: true }));
      } else {
        addTestResult('Firestore Connection', 'error', 'فشل في الاتصال بـ Firestore', {
          solution: 'تحقق من إعدادات Firebase وقواعد الأمان'
        });
      }

      if (currentUser) {
        // Test 4: User Profile Exists
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            addTestResult('User Profile', 'success', 'ملف المستخدم موجود في Firestore', {
              data: userDoc.data()
            });
            setDiagnostics(prev => ({ ...prev, userProfileExists: true }));
          } else {
            addTestResult('User Profile', 'warning', 'ملف المستخدم غير موجود في Firestore', {
              solution: 'يمكنك إنشاء ملف شخصي جديد من لوحة التحكم'
            });
          }
        } catch (error) {
          addTestResult('User Profile', 'error', 'خطأ في قراءة ملف المستخدم', {
            error: error.message,
            code: error.code
          });
        }

        // Test 5: Write Permission
        const testDocId = `test_${currentUser.uid}_${Date.now()}`;
        try {
          await setDoc(doc(db, 'test', testDocId), {
            uid: currentUser.uid,
            timestamp: new Date().toISOString(),
            test: 'write_permission'
          });
          addTestResult('Write Permission', 'success', 'صلاحية الكتابة تعمل بنجاح');
          setDiagnostics(prev => ({ ...prev, writePermission: true }));

          // Clean up test document
          try {
            await deleteDoc(doc(db, 'test', testDocId));
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
        } catch (error) {
          addTestResult('Write Permission', 'error', 'فشل في الكتابة إلى Firestore', {
            error: error.message,
            code: error.code,
            solution: 'تحقق من قواعد الأمان في Firestore Console'
          });
        }

        // Test 6: Read Permission
        try {
          const testDoc = await getDoc(doc(db, 'test', 'connection'));
          addTestResult('Read Permission', 'success', 'صلاحية القراءة تعمل بنجاح');
          setDiagnostics(prev => ({ ...prev, readPermission: true }));
        } catch (error) {
          addTestResult('Read Permission', 'error', 'فشل في القراءة من Firestore', {
            error: error.message,
            code: error.code,
            solution: 'تحقق من قواعد الأمان في Firestore Console'
          });
        }
      }

    } catch (error) {
      addTestResult('General Error', 'error', 'خطأ عام في التشخيص', {
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen, currentUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-glass-border"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-6 text-white border-b border-glass-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">تشخيص Firebase</h2>
                <p className="text-gray-300">فحص حالة الاتصال وقواعد البيانات</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="glass-hover bg-neon-blue/20 border border-neon-blue/30 hover:bg-neon-blue/30 px-4 py-2 rounded-lg transition-all duration-200 text-neon-blue hover:text-white flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'جاري الفحص...' : 'إعادة الفحص'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-neon-blue text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-secondary-bg/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Overview */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Wifi className="h-5 w-5 ml-2 text-neon-blue" />
                حالة النظام
              </h3>
              <div className="space-y-3">
                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">تهيئة Firebase</span>
                    {diagnostics.firebaseInit ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">حالة المصادقة</span>
                    {diagnostics.authStatus ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">اتصال Firestore</span>
                    {diagnostics.firestoreConnection ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">ملف المستخدم</span>
                    {diagnostics.userProfileExists ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>
                </div>

                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">صلاحية الكتابة</span>
                    {diagnostics.writePermission ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>

                <div className="glass glass-hover p-3 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">صلاحية القراءة</span>
                    {diagnostics.readPermission ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <a
                  href="https://console.firebase.google.com/project/nexus-012/firestore/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-hover bg-neon-blue/20 border border-neon-blue/30 hover:bg-neon-blue/30 px-4 py-3 rounded-lg transition-all duration-200 text-neon-blue hover:text-white flex items-center justify-between w-full"
                >
                  <span>فتح قواعد Firestore</span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                <a
                  href="https://console.firebase.google.com/project/nexus-012/firestore/data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-hover bg-neon-purple/20 border border-neon-purple/30 hover:bg-neon-purple/30 px-4 py-3 rounded-lg transition-all duration-200 text-neon-purple hover:text-white flex items-center justify-between w-full"
                >
                  <span>عرض بيانات Firestore</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 ml-2 text-neon-purple" />
                نتائج الفحص التفصيلية
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="glass glass-hover p-3 rounded-lg border border-glass-border">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white">{result.test}</h4>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        <p className={`text-sm ${getStatusColor(result.status)} mt-1`}>
                          {result.message}
                        </p>
                        {result.details && (
                          <div className="mt-2 bg-secondary-bg/30 p-2 rounded text-xs text-gray-400">
                            {typeof result.details === 'object' ? (
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            ) : (
                              result.details
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {testResults.length === 0 && !loading && (
                  <div className="text-center text-gray-400 py-8">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>اضغط على "إعادة الفحص" لبدء التشخيص</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FirebaseDiagnostic;