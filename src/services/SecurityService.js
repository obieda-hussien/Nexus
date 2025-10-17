import { auth, db } from '../config/firebase';
import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  deleteUser 
} from 'firebase/auth';
import { 
  ref, 
  update, 
  push, 
  set,
  query,
  orderByChild,
  equalTo,
  get,
  limitToLast
} from 'firebase/database';
import { 
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Security Service for Nexus Educational Platform
class SecurityService {
  // Password strength validation
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    ].filter(Boolean).length;
    
    const strength = score < 2 ? 'ضعيف' : score < 4 ? 'Intermediate' : 'قوي';
    
    return {
      score,
      strength,
      isValid: score >= 3,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  }

  // Change user password
  static async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Validate new password strength
      const passwordCheck = this.validatePasswordStrength(newPassword);
      if (!passwordCheck.isValid) {
        throw new Error('Password الNewة لا تلبي متطلبات الأمان');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Log security event
      await this.logSecurityEvent('password_changed', {
        user_id: user.uid,
        success: true
      });

      return { success: true, message: 'تم تغيير Password بنجاح' };
    } catch (error) {
      await this.logSecurityEvent('password_change_failed', {
        user_id: auth.currentUser?.uid,
        error: error.message
      });
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Password الحالية غير صحيحة');
      }
      throw new Error('فشل في تغيير Password');
    }
  }

  // Monitor login attempts
  static async logLoginAttempt(email, success, errorCode = null) {
    try {
      const logsRef = ref(db, 'security_logs');
      const newLogRef = push(logsRef);
      await set(newLogRef, {
        event_type: 'login_attempt',
        email: email,
        success: success,
        error_code: errorCode,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      // Check for suspicious activity
      if (!success) {
        await this.checkSuspiciousActivity(email);
      }
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  // Check for suspicious login activity
  static async checkSuspiciousActivity(email) {
    try {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      const q = query(
        collection(db, 'security_logs'),
        where('email', '==', email),
        where('event_type', '==', 'login_attempt'),
        where('success', '==', false),
        where('created_at', '>=', thirtyMinutesAgo.toISOString()),
        orderBy('created_at', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const failedAttempts = querySnapshot.size;

      if (failedAttempts >= 5) {
        await this.logSecurityEvent('suspicious_activity_detected', {
          email: email,
          failed_attempts: failedAttempts,
          time_window: '30_minutes'
        });

        // In a real application, you might want to temporarily lock the account
        // or send an alert to administrators
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  }

  // Log general security events
  static async logSecurityEvent(eventType, eventData) {
    try {
      await addDoc(collection(db, 'security_logs'), {
        event_type: eventType,
        event_data: eventData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: serverTimestamp(),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Update user security settings
  static async updateSecuritySettings(userId, settings) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        security_settings: {
          ...settings,
          updated_at: new Date().toISOString()
        }
      });

      await this.logSecurityEvent('security_settings_updated', {
        user_id: userId,
        settings: Object.keys(settings)
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw new Error('فشل في Update إعدادات الأمان');
    }
  }

  // Data encryption for sensitive information
  static encryptData(data, key = 'nexus_security_key') {
    try {
      // Simple encryption for demo purposes
      // In production, use proper encryption libraries
      const encrypted = btoa(JSON.stringify(data) + key);
      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      return null;
    }
  }

  // Data decryption
  static decryptData(encryptedData, key = 'nexus_security_key') {
    try {
      const decrypted = atob(encryptedData);
      const data = decrypted.replace(key, '');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  // Input sanitization
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate file uploads (for when storage is available)
  static validateFileUpload(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxSize;
    
    return {
      isValid: isValidType && isValidSize,
      errors: {
        invalidType: !isValidType,
        invalidSize: !isValidSize
      }
    };
  }

  // Get client IP (limited in browser environment)
  static async getClientIP() {
    try {
      // This is a simplified approach
      // In production, you might use a service like ipify
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Session security
  static initializeSessionSecurity() {
    // Monitor for tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logSecurityEvent('session_inactive', {
          user_id: auth.currentUser?.uid
        });
      }
    });

    // Monitor for suspicious navigation patterns
    let navigationCount = 0;
    const navigationThreshold = 50; // Threshold for rapid navigation

    window.addEventListener('beforeunload', () => {
      navigationCount++;
      if (navigationCount > navigationThreshold) {
        this.logSecurityEvent('suspicious_navigation', {
          user_id: auth.currentUser?.uid,
          navigation_count: navigationCount
        });
      }
    });
  }

  // Account security status check
  static async getAccountSecurityStatus(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDocs(userRef);
      
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data();
      const securitySettings = userData.security_settings || {};
      
      const securityScore = this.calculateSecurityScore(userData);
      
      return {
        score: securityScore,
        recommendations: this.getSecurityRecommendations(userData),
        lastPasswordChange: securitySettings.last_password_change,
        twoFactorEnabled: securitySettings.two_factor_enabled || false,
        securityQuestionsSet: securitySettings.security_questions_set || false
      };
    } catch (error) {
      console.error('Error getting security status:', error);
      return null;
    }
  }

  // Calculate security score
  static calculateSecurityScore(userData) {
    let score = 0;
    const securitySettings = userData.security_settings || {};
    
    // Password strength (if last changed recently)
    if (securitySettings.last_password_change) {
      const lastChange = new Date(securitySettings.last_password_change);
      const daysSinceChange = (new Date() - lastChange) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 90) score += 25;
    }
    
    // Two-factor authentication
    if (securitySettings.two_factor_enabled) score += 35;
    
    // Security questions
    if (securitySettings.security_questions_set) score += 20;
    
    // Recent activity monitoring
    if (securitySettings.activity_monitoring) score += 20;
    
    return Math.min(score, 100);
  }

  // Get security recommendations
  static getSecurityRecommendations(userData) {
    const recommendations = [];
    const securitySettings = userData.security_settings || {};
    
    if (!securitySettings.two_factor_enabled) {
      recommendations.push({
        type: 'two_factor',
        title: 'تفعيل المصادقة الثنائية',
        description: 'قم بتفعيل المصادقة الثنائية لحماية أفضل لحسابك'
      });
    }
    
    if (!securitySettings.security_questions_set) {
      recommendations.push({
        type: 'security_questions',
        title: 'تعيين أسئلة الأمان',
        description: 'قم بتعيين أسئلة الأمان لاستعادة الحساب في حالة فقدان Password'
      });
    }
    
    if (securitySettings.last_password_change) {
      const lastChange = new Date(securitySettings.last_password_change);
      const daysSinceChange = (new Date() - lastChange) / (1000 * 60 * 60 * 24);
      if (daysSinceChange > 90) {
        recommendations.push({
          type: 'password_update',
          title: 'Update Password',
          description: 'ننصح بتغيير Password كل 90 يوم'
        });
      }
    }
    
    return recommendations;
  }
}

export default SecurityService;