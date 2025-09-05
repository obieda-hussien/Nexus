// EmailJS Notification Service - FREE Alternative to SendGrid
// Provides 200 free emails per month with professional templates

import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nexus_edu',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  templates: {
    payoutNotification: import.meta.env.VITE_EMAILJS_PAYOUT_TEMPLATE || 'template_payout_notification',
    coursePayment: import.meta.env.VITE_EMAILJS_COURSE_PAYMENT_TEMPLATE || 'template_course_payment',
    monthlyReport: import.meta.env.VITE_EMAILJS_MONTHLY_TEMPLATE || 'template_monthly_report',
    welcomeInstructor: import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE || 'template_welcome_instructor'
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
        console.warn('EmailJS not configured, skipping email notification');
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'المدرس الكريم',
        instructor_name: instructorData.displayName || 'المدرس',
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
        platform_name: 'منصة نيكسوس التعليمية',
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

      console.log('✅ Payout notification sent successfully via EmailJS:', response);
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
        title: 'تم إرسال الأرباح',
        body: `تم تحويل ${payoutData.amount} ${payoutData.currency || 'EGP'} بنجاح`,
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
        console.warn('EmailJS not configured, using browser notification');
        await this.sendBrowserNotification({
          title: 'بيع جديد!',
          body: `تم شراء كورس ${courseData.title} بواسطة ${studentData.displayName}`,
          icon: '/favicon.ico'
        });
        return { success: false, reason: 'service_not_configured', fallback: 'browser_notification' };
      }

      const instructorShare = paymentData.amount * 0.9; // 90% to instructor
      
      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'المدرس الكريم',
        instructor_name: instructorData.displayName || 'المدرس',
        course_title: courseData.title,
        course_price: paymentData.amount,
        currency: paymentData.currency || 'EGP',
        student_name: studentData.displayName || 'الطالب',
        student_email: studentData.email,
        payment_method: this.getPaymentMethodNameAr(paymentData.paymentMethod || 'paypal'),
        sale_date: new Date().toLocaleDateString('ar-EG'),
        transaction_id: paymentData.transactionId,
        instructor_earnings: instructorShare,
        platform_fee: paymentData.amount * 0.1,
        total_sales: courseData.salesCount + 1,
        platform_name: 'منصة نيكسوس التعليمية',
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

      console.log('✅ Course payment notification sent successfully:', response);
      return { success: true, messageId: response.text };

    } catch (error) {
      console.error('❌ EmailJS course payment notification error:', error);
      
      // Browser notification fallback
      await this.sendBrowserNotification({
        title: 'بيع جديد!',
        body: `تم شراء كورس ${courseData.title} - ربح: ${(paymentData.amount * 0.9).toFixed(2)} ج.م`,
        icon: '/favicon.ico'
      });

      return { success: false, error: error.message, fallback: 'browser_notification_sent' };
    }
  }

  // Send monthly earnings report
  static async sendMonthlyEarningsReport(instructorData, reportData) {
    try {
      if (!this.isConfigured()) {
        console.warn('EmailJS not configured, skipping monthly report');
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'المدرس الكريم',
        instructor_name: instructorData.displayName || 'المدرس',
        report_month: reportData.month,
        report_year: reportData.year,
        total_earnings: reportData.totalEarnings || 0,
        platform_commission: reportData.platformCommission || 0,
        tax_amount: reportData.taxAmount || 0,
        net_earnings: reportData.netEarnings || 0,
        total_withdrawals: reportData.totalWithdrawals || 0,
        available_balance: reportData.availableBalance || 0,
        courses_sold: reportData.coursesSold || 0,
        new_students: reportData.newStudents || 0,
        top_course: reportData.topCourse || 'غير متاح',
        platform_name: 'منصة نيكسوس التعليمية',
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

      console.log('✅ Monthly report sent successfully:', response);
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
        console.warn('EmailJS not configured, skipping welcome email');
        return { success: false, reason: 'service_not_configured' };
      }

      const templateParams = {
        to_email: instructorData.email,
        to_name: instructorData.displayName || 'المدرس الكريم',
        instructor_name: instructorData.displayName || 'المدرس',
        registration_date: new Date().toLocaleDateString('ar-EG'),
        platform_name: 'منصة نيكسوس التعليمية',
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

      console.log('✅ Welcome email sent successfully:', response);
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
          console.log('Notification permission denied');
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

        console.log('✅ Browser notification sent successfully');
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
  static async sendTestEmail(recipientEmail, recipientName = 'المختبر') {
    try {
      if (!this.isConfigured()) {
        throw new Error('EmailJS not configured');
      }

      const templateParams = {
        to_email: recipientEmail,
        to_name: recipientName,
        instructor_name: recipientName,
        test_message: 'هذه رسالة اختبار للتأكد من أن خدمة EmailJS تعمل بشكل صحيح.',
        platform_name: 'منصة نيكسوس التعليمية',
        support_email: 'support@nexus-edu.com',
        test_date: new Date().toLocaleDateString('ar-EG'),
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

      console.log('✅ Test email sent successfully:', response);
      return { 
        success: true, 
        messageId: response.text,
        message: 'تم إرسال رسالة الاختبار بنجاح'
      };

    } catch (error) {
      console.error('❌ Test email error:', error);
      throw new Error(`فشل في إرسال رسالة الاختبار: ${error.message}`);
    }
  }

  // Helper methods
  static getPaymentMethodNameAr(type) {
    const names = {
      paypal: 'PayPal',
      stripe: 'Stripe',
      bank: 'تحويل بنكي',
      vodafone: 'فودافون كاش',
      fawry: 'فوري'
    };
    return names[type] || type;
  }

  static formatAccountDetails(paymentMethod) {
    if (!paymentMethod) return 'غير محدد';
    
    switch (paymentMethod.type) {
      case 'bank':
        return `${paymentMethod.bankName || 'البنك'} - ${paymentMethod.accountNumber || 'رقم الحساب'}`;
      case 'paypal':
        return paymentMethod.paypalEmail || 'PayPal';
      case 'vodafone':
        return paymentMethod.vodafoneCashNumber || 'فودافون كاش';
      default:
        return paymentMethod.type || 'غير محدد';
    }
  }

  static getEstimatedArrival(paymentMethodType) {
    const arrivals = {
      bank: '3-5 أيام عمل',
      paypal: 'فوري',
      vodafone: '24 ساعة',
      fawry: '24-48 ساعة',
      stripe: 'فوري'
    };
    return arrivals[paymentMethodType] || '1-3 أيام عمل';
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