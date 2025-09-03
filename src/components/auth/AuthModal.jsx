import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signin, signup, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await signin(email, password);
        setSuccess('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else if (authMode === 'register') {
        if (password !== confirmPassword) {
          setError('كلمات المرور غير متطابقة');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
        setSuccess('تم إنشاء الحساب بنجاح!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      }
    } catch (error) {
      console.error('Auth error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('هذا البريد الإلكتروني غير مسجل');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة');
          break;
        case 'auth/email-already-in-use':
          setError('هذا البريد الإلكتروني مستخدم بالفعل');
          break;
        case 'auth/weak-password':
          setError('كلمة المرور ضعيفة جداً');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صحيح');
          break;
        default:
          setError('حدث خطأ. يرجى المحاولة مرة أخرى');
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-400 to-secondary-400 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {authMode === 'login' && 'تسجيل الدخول'}
              {authMode === 'register' && 'إنشاء حساب جديد'}
              {authMode === 'reset' && 'إعادة تعيين كلمة المرور'}
            </h2>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Display Name (Register only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-900"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-900"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
          </div>

          {/* Password (Login and Register) */}
          {authMode !== 'reset' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-900"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Register only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-900"
                  placeholder="أعد كتابة كلمة المرور"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-400 to-secondary-400 text-white py-3 rounded-lg font-bold hover:from-primary-500 hover:to-secondary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري المعالجة...</span>
              </div>
            ) : (
              <>
                {authMode === 'login' && 'تسجيل الدخول'}
                {authMode === 'register' && 'إنشاء الحساب'}
                {authMode === 'reset' && 'إرسال رابط الإعادة'}
              </>
            )}
          </button>

          {/* Mode Switch Links */}
          <div className="text-center space-y-2">
            {authMode === 'login' && (
              <>
                <p className="text-gray-600">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      resetForm();
                    }}
                    className="text-primary-400 hover:text-primary-500 font-bold"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
                <p className="text-gray-600">
                  نسيت كلمة المرور؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset');
                      resetForm();
                    }}
                    className="text-primary-400 hover:text-primary-500 font-bold"
                  >
                    إعادة تعيين
                  </button>
                </p>
              </>
            )}
            {authMode === 'register' && (
              <p className="text-gray-600">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                  className="text-primary-400 hover:text-primary-500 font-bold"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
            {authMode === 'reset' && (
              <p className="text-gray-600">
                تذكرت كلمة المرور؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                  className="text-primary-400 hover:text-primary-500 font-bold"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthModal;