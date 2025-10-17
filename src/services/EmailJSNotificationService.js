// EmailJS Notification Service - FREE Alternative to SendGrid
// Provides 200 free emails per month with professional templates

import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nexus',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'BBqS7PbBcr94CcNso',
  templates: {
    payoutNotification: import.meta.env.VITE_EMAILJS_PAYOUT_TEMPLATE || 'template_kqq1yn5',
    coursePayment: import.meta.env.VITE_EMAILJS_COURSE_PAYMENT_TEMPLATE || 'template_kqq1yn5',
    monthlyReport: import.meta.env.VITE_EMAILJS_MONTHLY_TEMPLATE || 'template_kqq1yn5',
    welcomeInstructor: import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE || 'template_kqq1yn5'
  }
};

// Initialize EmailJS
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

export class EmailJSNotificationService {
  
  // Send instructor payout notification
  static async sendPayoutNotification(instructorData, payoutData) {
    try {
      if (!this.isConfigured()) {
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'Dear Instructor',
        instructor_name: instructorData.displayName || 'Instructor',
        payout_amount: payoutData.amount,
        currency: payoutData.currency || 'EGP',
        payment_method: this.getPaymentMethodNameAr(payoutData.paymentMethod.type),
        payout_date: new Date().toLocaleDateString('ar-EG'),
        transaction_id: payoutData.transactionId || payoutData.id,
        net_amount: payoutData.netAmount || payoutData.amount,
        platform_fee: payoutData.platformFee || (payoutData.amount * 0.10),
        tax_amount: payoutData.taxAmount || (payoutData.amount * 0.05),
        available_balance: instructorData.instructorData?.availableBalance || 0,
        total_earnings: instructorData.instructorData?.totalEarnings || 0,
        account_details: this.formatAccountDetails(payoutData.paymentMethod),
        support_email: 'support@nexus-edu.com',
        platform_name: 'Nexus Educational Platform',
        payout_status: payoutData.status || 'completed',
        estimated_arrival: this.getEstimatedArrival(payoutData.paymentMethod.type),
        year: new Date().getFullYear(),
        month: new Date().toLocaleDateString('ar-EG', { month: 'long' }),
        formatted_date: new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.payoutNotification,
        templateParams
      );

      return { 
        success: true, 
        messageId: response.text,
        service: 'EmailJS',
        cost: 'FREE'
      };

    } catch (error) {
      console.error('❌ EmailJS payout notification error:', error);
      
      // Send browser notification as fallback
      await this.sendBrowserNotification({
        title: 'تم Submit Earnings',
        body: `تم تحويل ${payoutData.amount} ${payoutData.currency || 'EGP'} successfully`,
        icon: '/favicon.ico'
      });

      return { 
        success: false, 
        error: error.message,
        fallback: 'browser_notification_sent'
      };
    }
  }

  // Send course payment notification to instructor
  static async sendCoursePaymentNotification(instructorData, courseData, studentData, paymentData) {
    try {
      if (!this.isConfigured()) {
        await this.sendBrowserNotification({
          title: 'New Sale!',
          body: `Purchased كورس ${courseData.title} by ${studentData.displayName}`,
          icon: '/favicon.ico'
        });
        return { success: false, reason: 'service_not_configured', fallback: 'browser_notification' };
      }

      const instructorShare = paymentData.amount * 0.9; // 90% to instructor
      
      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'Dear Instructor',
        instructor_name: instructorData.displayName || 'Instructor',
        course_title: courseData.title,
        course_price: paymentData.amount,
        currency: paymentData.currency || 'EGP',
        student_name: studentData.displayName || 'الstudent',
        student_email: studentData.email,
        payment_method: this.getPaymentMethodNameAr(paymentData.paymentMethod || 'paypal'),
        sale_date: new Date().toLocaleDateString('ar-EG'),
        transaction_id: paymentData.transactionId,
        instructor_earnings: instructorShare,
        platform_fee: paymentData.amount * 0.1,
        total_sales: courseData.salesCount + 1,
        platform_name: 'Nexus Educational Platform',
        support_email: 'support@nexus-edu.com',
        formatted_date: new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.coursePayment,
        templateParams
      );

      return { success: true, messageId: response.text };

    } catch (error) {
      console.error('❌ EmailJS course payment notification error:', error);
      
      // Browser notification fallback
      await this.sendBrowserNotification({
        title: 'New Sale!',
        body: `Purchased كورس ${courseData.title} - ربح: ${(paymentData.amount * 0.9).toFixed(2)} EGP`,
        icon: '/favicon.ico'
      });

      return { success: false, error: error.message, fallback: 'browser_notification_sent' };
    }
  }

  // Send monthly earnings report
  static async sendmonthlyEarningsReport(instructorData, reportData) {
    try {
      if (!this.isConfigured()) {
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'Dear Instructor',
        instructor_name: instructorData.displayName || 'Instructor',
        report_month: reportData.month,
        report_year: reportData.year,
        total_earnings: reportData.totalEarnings || 0,
        platform_commission: reportData.platformCommission || 0,
        tax_amount: reportData.taxAmount || 0,
        net_earnings: reportData.netEarnings || 0,
        total_withdrawals: reportData.totalWithdrawals || 0,
        available_balance: reportData.availableBalance || 0,
        courses_sold: reportData.coursesSold || 0,
        new_students: reportData.newstudents || 0,
        top_course: reportData.topCourse || 'Not available',
        platform_name: 'Nexus Educational Platform',
        support_email: 'support@nexus-edu.com',
        report_date: new Date().toLocaleDateString('ar-EG'),
        formatted_date: new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.monthlyReport,
        templateParams
      );

      return { success: true, messageId: response.text };

    } catch (error) {
      console.error('❌ EmailJS monthly report error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new instructor
  static async sendWelcomeInstructor(instructorData) {
    try {
      if (!this.isConfigured()) {
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'Dear Instructor',
        instructor_name: instructorData.displayName || 'Instructor',
        registration_date: new Date().toLocaleDateString('ar-EG'),
        platform_name: 'Nexus Educational Platform',
        support_email: 'support@nexus-edu.com',
        dashboard_url: `${window.location.origin}/instructor`,
        guidelines_url: `${window.location.origin}/instructor-guidelines`,
        formatted_date: new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.welcomeInstructor,
        templateParams
      );

      return { success: true, messageId: response.text };

    } catch (error) {
      console.error('❌ EmailJS welcome email error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send browser notification (always free fallback)
  static async sendBrowserNotification(notificationData) {
    try {
      // Request notification permission if not granted
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return { success: false, reason: 'permission_denied' };
        }
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon || '/favicon.ico',
          badge: '/badge-icon.png',
          tag: 'nexus-notification',
          requireInteraction: false,
          silent: false
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return { success: true };
      }

      return { success: false, reason: 'permission_not_granted' };

    } catch (error) {
      console.error('❌ Browser notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if EmailJS is properly configured
  static isConfigured() {
    return !!(EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.publicKey);
  }

  // Get configuration status
  static getConfigurationStatus() {
    return {
      configured: this.isConfigured(),
      serviceId: EMAILJS_CONFIG.serviceId,
      publicKeyPresent: !!EMAILJS_CONFIG.publicKey,
      templatesConfigured: Object.keys(EMAILJS_CONFIG.templates).length > 0,
      monthlyLimit: 200,
      currentUsage: 0, // This would need to be tracked separately
      cost: 'FREE (200 emails/month)',
      fallbackAvailable: 'Browser Notifications'
    };
  }

  // Test email configuration
  static async sendTestEmail(recipientEmail, recipientName = 'الLaboratory') {
    try {
      if (!this.isConfigured()) {
        throw new Error('خدمة EmailJS Not readyّة correctly صحيح. Verify from متغيرات البيئة.');
      }

      // Validate inputs
      if (!recipientEmail || !recipientEmail.includes('@')) {
        throw new Error('بريد إلكتروني غير صحيح');
      }

      // Test template parameters with all required fields
      const templateParams = {
        to_email: recipientEmail,
        to_name: recipientName || 'System Lab',
        instructor_name: recipientName || 'System Lab',
        // Payout notification fields (since we're using that template)
        payout_amount: '0.00',
        currency: 'EGP',
        payment_method: 'Quiz',
        payout_date: new Date().toLocaleDateString('ar-EG'),
        transaction_id: `test_${Date.now()}`,
        net_amount: '0.00',
        platform_fee: '0.00',
        tax_amount: '0.00',
        available_balance: '0.00',
        total_earnings: '0.00',
        account_details: 'حساب Quiz',
        payout_status: 'test',
        estimated_arrival: 'instant',
        // Generic fields
        test_message: 'this Thesis Quiz للEnsure from أن خدمة EmailJS تعمل correctly صحيح.',
        platform_name: 'Nexus Educational Platform',
        support_email: 'support@nexus-edu.com',
        test_date: new Date().toLocaleDateString('ar-EG'),
        year: new Date().getFullYear(),
        month: new Date().toLocaleDateString('ar-EG', { month: 'long' }),
        formatted_date: new Date().toLocaleDateString('ar-EG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      console.log('📧 Sending test email with config:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templates.payoutNotification,
        recipient: recipientEmail
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.payoutNotification,
        templateParams
      );

      return { 
        success: true, 
        messageId: response.text,
        message: 'Test email sent successfully! Verify from صندوق الوارDr.'
      };

    } catch (error) {
      console.error('❌ Test email error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failure in Submit Thesis الQuiz';
      
      if (error.text) {
        if (error.text.includes('Invalid')) {
          errorMessage = 'withرف Service أو القالب غير صحيح';
        } else if (error.text.includes('Forbidden')) {
          errorMessage = 'المفتاح الyear غير مصرح له بالوصول';
        } else if (error.text.includes('Limit')) {
          errorMessage = 'تم تجاوز الحد المسموح from Messages الmonthlyة';
        } else {
          errorMessage = `Error in Service: ${error.text}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Helper methods
  static getPaymentMethodNameAr(type) {
    const names = {
      paypal: 'PayPal',
      stripe: 'Stripe',
      bank: 'Bank Transfer',
      vodafone: 'Vodafone Cash',
      fawry: 'instant'
    };
    return names[type] || type;
  }

  static formatAccountDetails(paymentMethod) {
    if (!paymentMethod) return 'Not specified';
    
    switch (paymentMethod.type) {
      case 'bank':
        return `${paymentMethod.bankName || 'البنك'} - ${paymentMethod.accountNumber || 'رقم Account'}`;
      case 'paypal':
        return paymentMethod.paypalEmail || 'PayPal';
      case 'vodafone':
        return paymentMethod.vodafoneCashNumber || 'Vodafone Cash';
      default:
        return paymentMethod.type || 'Not specified';
    }
  }

  static getEstimatedArrival(paymentMethodType) {
    const arrivals = {
      bank: '3-5 business days',
      paypal: 'instant',
      vodafone: '24 hour',
      fawry: '24-48 hour',
      stripe: 'instant'
    };
    return arrivals[paymentMethodType] || '1-3 business days';
  }

  // Get email usage statistics (mock - would need backend integration)
  static getUsageStatistics() {
    // This would typically come from your backend/EmailJS dashboard
    return {
      monthlyLimit: 200,
      used: 45, // Mock data
      remaining: 155,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      costSavings: 15, // Compared to SendGrid
      successRate: 98.5
    };
  }
}

export default EmailJSNotificationService;