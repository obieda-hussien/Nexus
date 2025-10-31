// free Email Service for Nexus LMS
// Uses EmailJS and native browser APIs for free email notifications

import EmailJSNotificationService from './EmailJSNotificationService';

// free Email Configuration
const FREE_EMAIL_CONFIG = {
  emailjs: {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nexus_free',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_nexus_notifications',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
    enabled: true // EmailJS is now our primary free service
  },
  fallback: {
    supportEmail: 'support@nexus-edu.com',
    enabled: true
  }
};

export class freeEmailService {
  
  // Check if free email service is configured
  static checkConfiguration() {
    const emailjsStatus = EmailJSNotificationService.getConfigurationStatus();

    return {
      hasEmailService: emailjsStatus.configured || FREE_EMAIL_CONFIG.fallback.enabled,
      services: {
        emailjs: {
          configured: emailjsStatus.configured,
          status: emailjsStatus.configured ? 'Ready' : 'Not ready',
          cost: emailjsStatus.cost,
          monthlyLimit: emailjsStatus.monthlyLimit,
          fallback: emailjsStatus.fallbackAvailable
        },
        browserNotifications: {
          configured: true,
          status: 'Always ready',
          cost: 'Completely free'
        }
      },
      recommendation: emailjsStatus.configured 
        ? 'EmailJS configured successfully - reliable free service (200 emails/month)'
        : 'To get email notifications, set up EmailJS (100% free)',
      totalmonthlyCost: '$0 (Completely free)',
      savings: '$15/month (compared to SendGrid)'
    };
  }

  // Send withdrawal request notification
  static async sendWithdrawalRequestNotification(instructorData, withdrawalData) {
    try {
      console.log('🆓 Sending FREE withdrawal notification via EmailJS...');
      
      // Primary: EmailJS (200 free emails/month)
      const emailResult = await EmailJSNotificationService.sendPayoutNotification(
        instructorData, 
        withdrawalData
      );
      
      if (emailResult.success) {
        console.log('✅ FREE withdrawal notification sent successfully via EmailJS');
        return {
          success: true,
          method: 'EmailJS',
          cost: 'FREE',
          messageId: emailResult.messageId
        };
      }
      
      // Fallback: Browser notification (always free)
      console.log('📱 Falling back to browser notification...');
      await this.sendBrowserNotification(instructorData, {
        type: 'withdrawal_requested',
        title: 'New Withdrawal Request',
        message: `Withdrawal request received ${withdrawalData.amount} ${withdrawalData.currency || 'EGP'}`,
        withdrawalData
      });
      
      return {
        success: true,
        method: 'Browser Notification',
        cost: 'FREE',
        fallback: true
      };
      
    } catch (error) {
      console.error('❌ FREE email service error:', error);
      
      // Final fallback: Browser notification
      try {
        await this.sendBrowserNotification(instructorData, {
          type: 'withdrawal_requested',
          title: 'New Withdrawal Request',
          message: `Withdrawal request: ${withdrawalData.amount} ${withdrawalData.currency || 'EGP'}`,
          withdrawalData
        });
        
        return {
          success: true,
          method: 'Browser Notification (Fallback)',
          cost: 'FREE',
          error: error.message
        };
      } catch (fallbackError) {
        console.error('❌ All notification methods failed:', fallbackError);
        return {
          success: false,
          error: 'Failed to submit notification',
          allMethodsFailed: true
        };
      }
    }
  }

  // Send browser notification (always free fallback)
  static async sendBrowserNotification(instructorData, notificationData) {
    try {
      // Use EmailJS service's browser notification method
      return await EmailJSNotificationService.sendBrowserNotification({
        title: notificationData.title,
        body: notificationData.message,
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Browser notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send course payment completed notification
  static async sendCoursePaymentNotification(instructorData, courseData, studentData, paymentData) {
    try {
      console.log('🆓 Sending FREE course payment notification...');
      
      // Primary: EmailJS
      const emailResult = await EmailJSNotificationService.sendCoursePaymentNotification(
        instructorData,
        courseData,
        studentData,
        paymentData
      );
      
      if (emailResult.success) {
        return {
          success: true,
          method: 'EmailJS',
          cost: 'FREE'
        };
      }
      
      // Fallback: Browser notification
      await this.sendBrowserNotification(instructorData, {
        title: 'New Sale!',
        message: `Purchased ${courseData.title} by ${studentData.displayName}`
      });
      
      return {
        success: true,
        method: 'Browser Notification',
        cost: 'FREE',
        fallback: true
      };
      
    } catch (error) {
      console.error('Course payment notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  static async sendTestEmail(recipientEmail) {
    try {
      return await EmailJSNotificationService.sendTestEmail(recipientEmail);
    } catch (error) {
      console.error('Test email error:', error);
      throw error;
    }
  }

  // Get cost analysis
  static getCostAnalysis() {
    return {
      currentService: 'EmailJS (FREE)',
      monthlyCost: '$0',
      emailsPerMonth: 200,
      costPerEmail: '$0',
      previousCost: '$15/month (SendGrid)',
      savings: '$15/month',
      annualSavings: '$180/year',
      features: [
        '200 free emails monthly',
        'Professional templates in Arabic',
        'instant delivery',
        'Submission status tracking',
        'free browser alternative'
      ]
    };
  }
}

export default freeEmailService;