// PayPal Course Payment Service
// Handles PayPal payments for course purchases with secure backend integration

import { loadScript } from '@paypal/paypal-js';
import { ref, set, get, push, update } from 'firebase/database';
import { db } from '../config/firebase';

// PayPal Configuration
const PAYPAL_CONFIG = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  sandbox: import.meta.env.VITE_PAYPAL_SANDBOX === 'true',
  currency: 'USD', // PayPal works best with USD for international payments
  environment: import.meta.env.VITE_PAYPAL_SANDBOX === 'true' ? 'sandbox' : 'production'
};

class PayPalCoursePaymentService {
  static paypalInstance = null;

  // Initialize PayPal SDK
  static async initializePayPal() {
    if (this.paypalInstance) {
      return this.paypalInstance;
    }

    try {
      this.paypalInstance = await loadScript({
        'client-id': PAYPAL_CONFIG.clientId,
        currency: PAYPAL_CONFIG.currency,
        intent: 'capture'
      });

      console.log('✅ PayPal SDK loaded successfully');
      return this.paypalInstance;
    } catch (error) {
      console.error('❌ Failed to load PayPal SDK:', error);
      throw new Error('فشل في تحميل خدمة PayPal. يرجى المحاولة مرة أخرى.');
    }
  }

  // Create PayPal payment button
  static async createPaymentButton(containerId, courseData, userData, onSuccess, onError) {
    try {
      const paypal = await this.initializePayPal();

      if (!paypal || !paypal.Buttons) {
        throw new Error('PayPal SDK not loaded properly');
      }

      // Convert EGP to USD (approximate rate for demo)
      const usdAmount = this.convertEGPtoUSD(courseData.price);

      return paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45
        },

        // Create order on PayPal
        createOrder: async (data, actions) => {
          try {
            console.log('Creating PayPal order...');
            
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: PAYPAL_CONFIG.currency,
                  value: usdAmount.toFixed(2)
                },
                description: `Course: ${courseData.title}`,
                custom_id: `course_${courseData.id}_user_${userData.uid}`,
                invoice_id: `inv_${Date.now()}`
              }],
              application_context: {
                brand_name: 'Nexus Educational Platform',
                locale: 'en-US',
                user_action: 'PAY_NOW',
                shipping_preference: 'NO_SHIPPING'
              }
            });
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            throw error;
          }
        },

        // Handle approval
        onApprove: async (data, actions) => {
          try {
            console.log('PayPal payment approved, processing...');
            
            // Show loading state
            const loadingToast = this.showLoadingToast('جاري معالجة الدفع عبر PayPal...');

            // Capture payment on backend (mock implementation for frontend demo)
            const captureResult = await this.capturePayment(data.orderID, {
              courseId: courseData.id,
              userId: userData.uid,
              amount: usdAmount,
              currency: PAYPAL_CONFIG.currency,
              courseTitle: courseData.title,
              userEmail: userData.email,
              originalAmountEGP: courseData.price
            });

            // Hide loading toast
            loadingToast.close();

            if (captureResult.success) {
              // Create enrollment record
              await this.createEnrollment(captureResult.transactionData);
              
              // Update instructor earnings
              await this.updateInstructorEarnings(captureResult.transactionData);
              
              console.log('✅ PayPal payment completed successfully');
              onSuccess(captureResult);
            } else {
              throw new Error(captureResult.error || 'Payment capture failed');
            }
            
          } catch (error) {
            console.error('Error processing PayPal payment:', error);
            onError(error.message || 'فشل في معالجة الدفع');
          }
        },

        // Handle errors
        onError: (err) => {
          console.error('PayPal error:', err);
          onError('حدث خطأ في عملية الدفع عبر PayPal. يرجى المحاولة مرة أخرى.');
        },

        // Handle cancellation
        onCancel: (data) => {
          console.log('PayPal payment cancelled:', data);
          this.showWarningToast('تم إلغاء عملية الدفع');
        }

      }).render(`#${containerId}`);

    } catch (error) {
      console.error('Error creating PayPal button:', error);
      throw new Error('فشل في إنشاء زر الدفع. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
    }
  }

  // Capture payment via backend (mock implementation)
  static async capturePayment(orderID, paymentData) {
    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll simulate a successful capture
      
      console.log('Capturing PayPal payment:', orderID);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful capture response
      const transactionData = {
        id: `txn_${Date.now()}`,
        paypalOrderId: orderID,
        courseId: paymentData.courseId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        originalAmountEGP: paymentData.originalAmountEGP,
        status: 'completed',
        paymentMethod: 'paypal',
        courseTitle: paymentData.courseTitle,
        userEmail: paymentData.userEmail,
        createdAt: new Date().toISOString(),
        capturedAt: new Date().toISOString()
      };

      // Store transaction in Firebase
      const transactionRef = push(ref(db, 'transactions'));
      await set(transactionRef, transactionData);

      return {
        success: true,
        transactionId: transactionData.id,
        transactionData
      };

    } catch (error) {
      console.error('Payment capture error:', error);
      return {
        success: false,
        error: error.message || 'فشل في تأكيد الدفع'
      };
    }
  }

  // Create enrollment after successful payment
  static async createEnrollment(transactionData) {
    try {
      const enrollmentRef = push(ref(db, 'enrollments'));
      const enrollmentId = enrollmentRef.key;

      const enrollment = {
        id: enrollmentId,
        userId: transactionData.userId,
        courseId: transactionData.courseId,
        transactionId: transactionData.id,
        paymentMethod: 'paypal',
        paymentStatus: 'paid',
        amount: transactionData.originalAmountEGP,
        amountUSD: transactionData.amount,
        currency: 'EGP',
        enrolledAt: new Date().toISOString(),
        status: 'active',
        progress: 0,
        lastAccessedAt: new Date().toISOString()
      };

      await set(enrollmentRef, enrollment);

      // Update user enrolled courses
      const userRef = ref(db, `users/${transactionData.userId}/enrolledCourses/${transactionData.courseId}`);
      await set(userRef, {
        enrollmentId,
        enrolledAt: enrollment.enrolledAt,
        paymentMethod: 'paypal',
        transactionId: transactionData.id
      });

      console.log('✅ Enrollment created successfully:', enrollmentId);
      return { success: true, enrollmentId };

    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw new Error('فشل في تسجيل الاشتراك في الكورس');
    }
  }

  // Update instructor earnings
  static async updateInstructorEarnings(transactionData) {
    try {
      // Get course details to find instructor
      const courseRef = ref(db, `courses/${transactionData.courseId}`);
      const courseSnapshot = await get(courseRef);

      if (!courseSnapshot.exists()) {
        throw new Error('Course not found');
      }

      const course = courseSnapshot.val();
      const instructorId = course.instructorId;

      // Calculate instructor share (70% after PayPal fees)
      const paypalFee = transactionData.amount * 0.034; // PayPal fee ~3.4%
      const platformCommission = 0.10; // 10% platform commission
      const netAmount = transactionData.originalAmountEGP; // Use original EGP amount
      const instructorShare = netAmount * (1 - platformCommission);

      // Update instructor earnings
      const userRef = ref(db, `users/${instructorId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const user = userSnapshot.val();
        const currentEarnings = user.instructorData?.totalEarnings || 0;
        const currentAvailable = user.instructorData?.availableBalance || 0;

        await update(userRef, {
          'instructorData/totalEarnings': currentEarnings + instructorShare,
          'instructorData/availableBalance': currentAvailable + instructorShare,
          'instructorData/lastEarningDate': new Date().toISOString()
        });

        // Update course sales data
        await update(courseRef, {
          totalRevenue: (course.totalRevenue || 0) + netAmount,
          salesCount: (course.salesCount || 0) + 1,
          lastSaleDate: new Date().toISOString()
        });

        console.log('✅ Instructor earnings updated:', instructorShare);
      }

    } catch (error) {
      console.error('Error updating instructor earnings:', error);
      // Don't throw here as enrollment is already created
    }
  }

  // Convert EGP to USD (mock exchange rate)
  static convertEGPtoUSD(egpAmount) {
    // Mock exchange rate: 1 USD = 31 EGP (approximate)
    const exchangeRate = 31;
    return egpAmount / exchangeRate;
  }

  // Check if PayPal is configured
  static isConfigured() {
    return !!(PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId !== '');
  }

  // Get PayPal configuration status
  static getConfigurationStatus() {
    return {
      configured: this.isConfigured(),
      environment: PAYPAL_CONFIG.environment,
      currency: PAYPAL_CONFIG.currency,
      clientIdPresent: !!PAYPAL_CONFIG.clientId
    };
  }

  // Utility methods for toast notifications
  static showLoadingToast(message) {
    // This would integrate with your existing toast system
    // For now, return a mock object
    console.log('Loading:', message);
    return {
      close: () => console.log('Loading finished')
    };
  }

  static showWarningToast(message) {
    console.log('Warning:', message);
  }

  // Get course purchase summary with PayPal fees
  static getCoursePaymentSummary(coursePrice) {
    const usdAmount = this.convertEGPtoUSD(coursePrice);
    const paypalFee = usdAmount * 0.034; // PayPal international fee
    const totalUSD = usdAmount + paypalFee;

    return {
      originalPrice: coursePrice,
      currency: 'EGP',
      usdAmount: usdAmount.toFixed(2),
      paypalFee: paypalFee.toFixed(2),
      totalUSD: totalUSD.toFixed(2),
      exchangeRate: 31, // Mock rate
      feeDescription: 'رسوم PayPal (3.4%) - يدفعها الطالب'
    };
  }
}

export default PayPalCoursePaymentService;