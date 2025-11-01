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

  const { signin, signup, signInWithGoogle, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signInWithGoogle();
      setSuccess('تسجيل الدخول بنجاح!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Google Sign In error:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await signin(email, password);
        setSuccess('Login successful!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else if (authMode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
        setSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset link sent to your email');
      }
    } catch (error) {
      console.error('Auth error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('This email is not registered');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already in use');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError('An error occurred. Please try again');
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-glass-border"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-6 text-white border-b border-glass-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {authMode === 'login' && 'Login'}
              {authMode === 'register' && 'Create New Account'}
              {authMode === 'reset' && 'Reset Password'}
            </h2>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="text-white hover:text-neon-blue text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-secondary-bg/50">
          {/* Display Name (Register only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-glass-bg border border-glass-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-glass-bg border border-glass-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password (Login and Register) */}
          {authMode !== 'reset' && (
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-glass-bg border border-glass-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-neon-blue transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Register only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-glass-bg border border-glass-border rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-400/30 p-3 rounded-lg backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 text-green-400 bg-green-900/20 border border-green-400/30 p-3 rounded-lg backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          {authMode === 'login' && (
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-secondary-bg/50 text-gray-400">أو</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-600 rounded-lg bg-white hover:bg-gray-50 text-gray-900 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>تسجيل الدخول باستخدام Google</span>
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white py-3 rounded-lg font-bold hover:from-neon-blue/80 hover:to-neon-purple/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                {authMode === 'login' && 'Login'}
                {authMode === 'register' && 'Create Account'}
                {authMode === 'reset' && 'Send Reset Link'}
              </>
            )}
          </button>

          {/* Mode Switch Links */}
          <div className="text-center space-y-2">
            {authMode === 'login' && (
              <>
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      resetForm();
                    }}
                    className="text-neon-blue hover:text-neon-blue/80 font-bold transition-colors duration-200"
                  >
                    Create New Account
                  </button>
                </p>
                <p className="text-gray-400">
                  Forgot password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset');
                      resetForm();
                    }}
                    className="text-neon-blue hover:text-neon-blue/80 font-bold transition-colors duration-200"
                  >
                    Reset
                  </button>
                </p>
              </>
            )}
            {authMode === 'register' && (
              <p className="text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                  className="text-neon-blue hover:text-neon-blue/80 font-bold transition-colors duration-200"
                >
                  Login
                </button>
              </p>
            )}
            {authMode === 'reset' && (
              <p className="text-gray-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetForm();
                  }}
                  className="text-neon-blue hover:text-neon-blue/80 font-bold transition-colors duration-200"
                >
                  Login
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