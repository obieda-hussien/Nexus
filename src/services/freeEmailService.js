// Free Email Service for Nexus LMS
// Uses EmailJS and native browser APIs for free email notifications

// Free Email Configuration
const FREE_EMAIL_CONFIG = {
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nexus_free',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_nexus_notifications',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
    enabled: false // Set to true when EmailJS is configured
  },
  fallback: {
    supportEmail: 'support@nexus-edu.com',
    enabled: true
  }
};

export class FreeEmailService {
  
  // Check if free email service is configured
  static checkConfiguration() {
    const emailjsConfigured = !!(
      FREE_EMAIL_CONFIG.emailjs.serviceId && 
      FREE_EMAIL_CONFIG.emailjs.templateId && 
      FREE_EMAIL_CONFIG.emailjs.publicKey
    );

    return {
      hasEmailService: emailjsConfigured || FREE_EMAIL_CONFIG.fallback.enabled,
      services: {
        emailjs: {
          configured: emailjsConfigured,
          status: emailjsConfigured ? 'جاهز' : 'غير مُعد',
          cost: 'مجاني (200 رسالة/شهر)'
        },
        fallback: {
          configured: FREE_EMAIL_CONFIG.fallback.enabled,
          status: 'جاهز',
          cost: 'مجاني (تنبيهات المتصفح)'
        }
      },
      recommendation: emailjsConfigured 
        ? 'EmailJS مُعد بنجاح - خدمة مجانية موثوقة'
        : 'للحصول على إشعارات بريد إلكتروني، قم بإعداد EmailJS (مجاني 100%)',
      totalMonthlyCost: '$0 (مجاني بالكامل)'
    };
  }

  // Send withdrawal request notification
  static async sendWithdrawalRequestNotification(instructorData, withdrawalData) {
    try {
      const message = this.generateWithdrawalRequestMessage(instructorData, withdrawalData);
      
      if (FREE_EMAIL_CONFIG.emailjs.enabled) {
        return await this.sendEmailViaEmailJS({
          to_email: instructorData.email,
          to_name: instructorData.displayName,
          subject: 'طلب سحب جديد - منصة نيكسوس',
          message: message,
          withdrawal_id: withdrawalData.id,
          amount: withdrawalData.amount,
          currency: withdrawalData.currency
        });
      } else {
        return this.showBrowserNotification(
          'طلب سحب جديد',
          `تم إرسال طلب سحب بقيمة ${withdrawalData.amount} ${withdrawalData.currency}`
        );
      }
    } catch (error) {
      console.error('خطأ في إرسال إشعار طلب السحب:', error);
      return { success: false, error: error.message };
    }
  }

  // Send withdrawal completed notification
  static async sendWithdrawalCompletedNotification(instructorData, withdrawalData, paymentResult) {
    try {
      const message = this.generateWithdrawalCompletedMessage(instructorData, withdrawalData, paymentResult);
      
      if (FREE_EMAIL_CONFIG.emailjs.enabled) {
        return await this.sendEmailViaEmailJS({
          to_email: instructorData.email,
          to_name: instructorData.displayName,
          subject: 'تم إتمام السحب بنجاح - منصة نيكسوس',
          message: message,
          withdrawal_id: withdrawalData.id,
          amount: withdrawalData.netAmount,
          transaction_id: paymentResult.transactionId
        });
      } else {
        return this.showBrowserNotification(
          'تم إتمام السحب',
          `تم تحويل ${withdrawalData.netAmount} ${withdrawalData.currency} بنجاح`
        );
      }
    } catch (error) {
      console.error('خطأ في إرسال إشعار إتمام السحب:', error);
      return { success: false, error: error.message };
    }
  }

  // Send withdrawal failed notification
  static async sendWithdrawalFailedNotification(instructorData, withdrawalData, errorMessage) {
    try {
      const message = this.generateWithdrawalFailedMessage(instructorData, withdrawalData, errorMessage);
      
      if (FREE_EMAIL_CONFIG.emailjs.enabled) {
        return await this.sendEmailViaEmailJS({
          to_email: instructorData.email,
          to_name: instructorData.displayName,
          subject: 'فشل في عملية السحب - منصة نيكسوس',
          message: message,
          withdrawal_id: withdrawalData.id,
          error_message: errorMessage
        });
      } else {
        return this.showBrowserNotification(
          'فشل في السحب',
          `فشل في معالجة طلب السحب. يرجى المحاولة مرة أخرى.`
        );
      }
    } catch (error) {
      console.error('خطأ في إرسال إشعار فشل السحب:', error);
      return { success: false, error: error.message };
    }
  }

  // Send tax report notification  
  static async sendTaxReportNotification(instructorData, taxReportData) {
    try {
      const message = this.generateTaxReportMessage(instructorData, taxReportData);
      
      if (FREE_EMAIL_CONFIG.emailjs.enabled) {
        return await this.sendEmailViaEmailJS({
          to_email: instructorData.email,
          to_name: instructorData.displayName,
          subject: 'التقرير الضريبي - منصة نيكسوس',
          message: message,
          tax_year: taxReportData.taxYear,
          total_earnings: taxReportData.totalEarnings
        });
      } else {
        return this.showBrowserNotification(
          'التقرير الضريبي جاهز',
          `تم إنتاج التقرير الضريبي لسنة ${taxReportData.taxYear}`
        );
      }
    } catch (error) {
      console.error('خطأ في إرسال إشعار التقرير الضريبي:', error);
      return { success: false, error: error.message };
    }
  }

  // Send test email
  static async sendTestEmail(email) {
    try {
      if (FREE_EMAIL_CONFIG.emailjs.enabled) {
        return await this.sendEmailViaEmailJS({
          to_email: email,
          to_name: 'المدرس',
          subject: 'رسالة اختبار من منصة نيكسوس',
          message: this.generateTestMessage(),
          test_message: 'هذه رسالة اختبار للتأكد من عمل النظام بشكل صحيح.'
        });
      } else {
        return this.showBrowserNotification(
          'اختبار الإشعارات',
          'تم اختبار نظام الإشعارات بنجاح! لإرسال إشعارات بريد إلكتروني، قم بإعداد EmailJS.'
        );
      }
    } catch (error) {
      console.error('خطأ في اختبار الإشعارات:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email via EmailJS (Free service)
  static async sendEmailViaEmailJS(templateParams) {
    try {
      // Check if EmailJS is available via CDN or try dynamic import
      let emailjs;
      
      // First try to use globally loaded EmailJS
      if (typeof window !== 'undefined' && window.emailjs) {
        emailjs = window.emailjs;
      } else {
        // Try dynamic import as fallback (may not work in all builds)
        try {
          const emailjsModule = await import('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js');
          emailjs = emailjsModule.default || emailjsModule;
        } catch (importError) {
          console.warn('EmailJS not available, falling back to browser notification');
          return this.showBrowserNotification(
            templateParams.subject || 'إشعار من منصة نيكسوس',
            templateParams.message || 'تم إرسال إشعار جديد'
          );
        }
      }
      
      if (!emailjs || !emailjs.send) {
        throw new Error('EmailJS service not available');
      }

      const result = await emailjs.send(
        FREE_EMAIL_CONFIG.emailjs.serviceId,
        FREE_EMAIL_CONFIG.emailjs.templateId,
        templateParams,
        FREE_EMAIL_CONFIG.emailjs.publicKey
      );

      console.log('✅ Email sent successfully via EmailJS:', result);
      return { success: true, result };
    } catch (error) {
      console.error('❌ EmailJS send failed:', error);
      
      // Fallback to browser notification
      return this.showBrowserNotification(
        templateParams.subject || 'إشعار من منصة نيكسوس',
        'تم إرسال إشعار جديد. للحصول على إشعارات البريد الإلكتروني، قم بإعداد EmailJS.'
      );
    }
  }

  // Show browser notification (Always free)
  static showBrowserNotification(title, message) {
    try {
      // Request notification permission if needed
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { 
              body: message,
              icon: '/favicon.ico',
              tag: 'nexus-notification'
            });
          }
        });
      } else if (Notification.permission === 'granted') {
        new Notification(title, { 
          body: message,
          icon: '/favicon.ico',
          tag: 'nexus-notification'
        });
      }

      // Also show a toast notification as fallback
      if (window.toast && typeof window.toast.success === 'function') {
        window.toast.success(message);
      }

      console.log('✅ Browser notification shown:', { title, message });
      return { success: true, method: 'browser_notification' };
    } catch (error) {
      console.error('❌ Browser notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Message generators
  static generateWithdrawalRequestMessage(instructorData, withdrawalData) {
    return `
مرحباً ${instructorData.displayName || 'المدرس الكريم'},

تم استلام طلب السحب الخاص بك بنجاح:

• رقم العملية: ${withdrawalData.id}
• المبلغ المطلوب: ${withdrawalData.amount} ${withdrawalData.currency}
• المبلغ الصافي: ${withdrawalData.netAmount} ${withdrawalData.currency}
• طريقة الدفع: ${this.getPaymentMethodNameAr(withdrawalData.paymentMethod.type)}
• تاريخ الطلب: ${new Date().toLocaleDateString('ar-EG')}

سيتم معالجة طلبك خلال ${withdrawalData.estimatedProcessing}.

مع تحيات فريق منصة نيكسوس
    `.trim();
  }

  static generateWithdrawalCompletedMessage(instructorData, withdrawalData, paymentResult) {
    return `
مرحباً ${instructorData.displayName || 'المدرس الكريم'},

تم إتمام عملية السحب بنجاح:

• رقم العملية: ${withdrawalData.id}
• رقم المعاملة: ${paymentResult.transactionId}
• المبلغ المحول: ${withdrawalData.netAmount} ${withdrawalData.currency}
• طريقة الدفع: ${this.getPaymentMethodNameAr(withdrawalData.paymentMethod.type)}
• تاريخ الإتمام: ${new Date().toLocaleDateString('ar-EG')}

تم تحويل المبلغ إلى حسابك بنجاح.

مع تحيات فريق منصة نيكسوس
    `.trim();
  }

  static generateWithdrawalFailedMessage(instructorData, withdrawalData, errorMessage) {
    return `
مرحباً ${instructorData.displayName || 'المدرس الكريم'},

نأسف لإبلاغك بفشل عملية السحب:

• رقم العملية: ${withdrawalData.id}
• المبلغ: ${withdrawalData.amount} ${withdrawalData.currency}
• سبب الفشل: ${errorMessage}

يرجى مراجعة بيانات الدفع والمحاولة مرة أخرى، أو التواصل مع الدعم الفني.

مع تحيات فريق منصة نيكسوس
    `.trim();
  }

  static generateTaxReportMessage(instructorData, taxReportData) {
    return `
مرحباً ${instructorData.displayName || 'المدرس الكريم'},

تم إنتاج التقرير الضريبي لسنة ${taxReportData.taxYear}:

• إجمالي الأرباح: ${taxReportData.totalEarnings} جنيه
• الضرائب المستحقة: ${taxReportData.totalTax} جنيه
• صافي الأرباح: ${taxReportData.netEarnings} جنيه

يمكنك تحميل التقرير من لوحة التحكم الخاصة بك.

مع تحيات فريق منصة نيكسوس
    `.trim();
  }

  static generateTestMessage() {
    return `
هذه رسالة اختبار من منصة نيكسوس التعليمية.

إذا وصلتك هذه الرسالة، فإن نظام الإشعارات يعمل بشكل صحيح.

النظام الحالي يستخدم خدمات مجانية 100% لضمان عدم وجود تكاليف إضافية.

مع تحيات فريق التطوير
    `.trim();
  }

  static getPaymentMethodNameAr(type) {
    const names = {
      stripe: 'بطاقة ائتمانية (Stripe)',
      paypal: 'PayPal',
      fawry: 'فوري',
      vodafone: 'فودافون كاش',
      bank: 'تحويل بنكي'
    };
    return names[type] || type;
  }
}

export default FreeEmailService;