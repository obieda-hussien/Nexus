import sgMail from '@sendgrid/mail';
import axios from 'axios';

// Email Configuration
const EMAIL_CONFIG = {
  sendgrid: {
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
    fromEmail: import.meta.env.VITE_FROM_EMAIL || 'noreply@nexus-edu.com',
    fromName: import.meta.env.VITE_FROM_NAME || 'Nexus Educational Platform'
  },
  smtp: {
    host: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(import.meta.env.VITE_SMTP_PORT) || 587,
    secure: import.meta.env.VITE_SMTP_SECURE === 'true',
    user: import.meta.env.VITE_SMTP_USER || '',
    pass: import.meta.env.VITE_SMTP_PASS || ''
  },
  templates: {
    withdrawalRequested: 'd-12345678901234567890', // SendGrid template ID
    withdrawalCompleted: 'd-12345678901234567891',
    withdrawalFailed: 'd-12345678901234567892',
    monthlyReport: 'd-12345678901234567893',
    taxReport: 'd-12345678901234567894'
  }
};

// Initialize SendGrid
if (EMAIL_CONFIG.sendgrid.apiKey) {
  sgMail.setApiKey(EMAIL_CONFIG.sendgrid.apiKey);
}

export class EmailNotificationService {
  
  // Send withdrawal request notification
  static async sendWithdrawalRequestNotification(instructorData, withdrawalData) {
    try {
      const emailData = {
        to: instructorData.email,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        templateId: EMAIL_CONFIG.templates.withdrawalRequested,
        dynamicTemplateData: {
          instructorName: instructorData.displayName || 'Instructor',
          withdrawalAmount: withdrawalData.amount,
          currency: withdrawalData.currency || 'EGP',
          paymentMethod: this.getPaymentMethodNameAr(withdrawalData.paymentMethod.type),
          requestDate: new Date().toLocaleDateString('ar-EG'),
          withdrawalId: withdrawalData.id,
          estimatedProcessing: withdrawalData.estimatedProcessing || '3-5 business days',
          fees: withdrawalData.fees,
          netAmount: withdrawalData.netAmount,
          platformFee: withdrawalData.platformFee,
          taxAmount: withdrawalData.taxAmount,
          supportEmail: 'support@nexus-edu.com',
          platformName: 'Nexus Educational Platform'
        }
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(emailData);
      } else {
        await this.sendViaSMTP(emailData);
      }

      console.log('Withdrawal request notification sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending withdrawal request notification:', error);
      throw new Error(`Failure in submitting withdrawal request notification: ${error.message}`);
    }
  }

  // Send withdrawal completion notification
  static async sendWithdrawalCompletedNotification(instructorData, withdrawalData, transactionResult) {
    try {
      const emailData = {
        to: instructorData.email,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        templateId: EMAIL_CONFIG.templates.withdrawalCompleted,
        dynamicTemplateData: {
          instructorName: instructorData.displayName || 'Instructor',
          withdrawalAmount: withdrawalData.amount,
          currency: withdrawalData.currency || 'EGP',
          paymentMethod: this.getPaymentMethodNameAr(withdrawalData.paymentMethod.type),
          completedDate: new Date().toLocaleDateString('ar-EG'),
          withdrawalId: withdrawalData.id,
          transactionId: transactionResult.transactionId,
          netAmount: withdrawalData.netAmount,
          fees: withdrawalData.fees,
          platformFee: withdrawalData.platformFee,
          taxAmount: withdrawalData.taxAmount,
          accountDetails: this.formatAccountDetails(withdrawalData.paymentMethod),
          supportEmail: 'support@nexus-edu.com',
          platformName: 'Nexus Educational Platform'
        }
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(emailData);
      } else {
        await this.sendViaSMTP(emailData);
      }

      console.log('Withdrawal completion notification sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending withdrawal completion notification:', error);
      throw new Error(`Failure in submitting withdrawal completion notification: ${error.message}`);
    }
  }

  // Send withdrawal failure notification
  static async sendWithdrawalFailedNotification(instructorData, withdrawalData, errorMessage) {
    try {
      const emailData = {
        to: instructorData.email,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        templateId: EMAIL_CONFIG.templates.withdrawalFailed,
        dynamicTemplateData: {
          instructorName: instructorData.displayName || 'Instructor',
          withdrawalAmount: withdrawalData.amount,
          currency: withdrawalData.currency || 'EGP',
          paymentMethod: this.getPaymentMethodNameAr(withdrawalData.paymentMethod.type),
          failureDate: new Date().toLocaleDateString('ar-EG'),
          withdrawalId: withdrawalData.id,
          errorMessage: errorMessage || 'Error Not specified',
          refundAmount: withdrawalData.amount, // Amount will be refunded to available balance
          nextSteps: this.getFailureNextSteps(withdrawalData.paymentMethod.type),
          supportEmail: 'support@nexus-edu.com',
          supportPhone: '+20-123-456-7890',
          platformName: 'Nexus Educational Platform'
        }
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(emailData);
      } else {
        await this.sendViaSMTP(emailData);
      }

      console.log('Withdrawal failure notification sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending withdrawal failure notification:', error);
      throw new Error(`Failure in Submit إشعار Failure السحب: ${error.message}`);
    }
  }

  // Send monthly earnings report
  static async sendmonthlyEarningsReport(instructorData, reportData) {
    try {
      const emailData = {
        to: instructorData.email,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        templateId: EMAIL_CONFIG.templates.monthlyReport,
        dynamicTemplateData: {
          instructorName: instructorData.displayName || 'Instructor',
          reportMonth: reportData.month,
          reportYear: reportData.year,
          totalEarnings: reportData.totalEarnings,
          platformCommission: reportData.platformCommission,
          taxAmount: reportData.taxAmount,
          netEarnings: reportData.netEarnings,
          totalWithdrawals: reportData.totalWithdrawals,
          pendingBalance: reportData.pendingBalance,
          availableBalance: reportData.availableBalance,
          coursesSold: reportData.coursesSold,
          newstudents: reportData.newstudents,
          coursesData: reportData.coursesData,
          withdrawalHistory: reportData.withdrawalHistory,
          currency: 'EGP',
          reportDate: new Date().toLocaleDateString('ar-EG'),
          supportEmail: 'support@nexus-edu.com',
          platformName: 'Nexus Educational Platform'
        }
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(emailData);
      } else {
        await this.sendViaSMTP(emailData);
      }

      console.log('monthly earnings report sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending monthly earnings report:', error);
      throw new Error(`Failure in Submit الReport الmonthly: ${error.message}`);
    }
  }

  // Send tax report notification
  static async sendTaxReportNotification(instructorData, taxReportData) {
    try {
      const emailData = {
        to: instructorData.email,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        templateId: EMAIL_CONFIG.templates.taxReport,
        dynamicTemplateData: {
          instructorName: instructorData.displayName || 'Instructor',
          taxYear: taxReportData.year,
          totalGrossIncome: taxReportData.totalGrossIncome,
          totalDeductions: taxReportData.totalDeductions,
          taxableIncome: taxReportData.taxableIncome,
          estimatedTax: taxReportData.estimatedTax,
          quarterlyReports: taxReportData.quarterlyReports,
          coursesIncome: taxReportData.coursesIncome,
          withdrawalsSummary: taxReportData.withdrawalsSummary,
          deductibleExpenses: taxReportData.deductibleExpenses,
          reportGeneratedDate: new Date().toLocaleDateString('ar-EG'),
          downloadLink: taxReportData.downloadLink,
          taxAdvice: this.getTaxAdvice(),
          supportEmail: 'support@nexus-edu.com',
          platformName: 'Nexus Educational Platform'
        },
        attachments: taxReportData.attachments ? [{
          content: taxReportData.attachments.pdfContent,
          filename: `tax-report-${taxReportData.year}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }] : []
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(emailData);
      } else {
        await this.sendViaSMTP(emailData);
      }

      console.log('Tax report notification sent successfully');
      return { success: true };

    } catch (error) {
      console.error('Error sending tax report notification:', error);
      throw new Error(`Failure in Submit Report الضرائب: ${error.message}`);
    }
  }

  // Send via SMTP (fallback method)
  static async sendViaSMTP(emailData) {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: EMAIL_CONFIG.smtp.host,
        port: EMAIL_CONFIG.smtp.port,
        secure: EMAIL_CONFIG.smtp.secure,
        auth: {
          user: EMAIL_CONFIG.smtp.user,
          pass: EMAIL_CONFIG.smtp.pass
        }
      });

      // Convert template data to HTML (basic template)
      const htmlContent = this.generateBasicHtmlTemplate(emailData);

      const mailOptions = {
        from: `"${emailData.from.name}" <${emailData.from.email}>`,
        to: emailData.to,
        subject: this.getEmailSubject(emailData.templateId),
        html: htmlContent,
        attachments: emailData.attachments || []
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent via SMTP successfully');

    } catch (error) {
      console.error('SMTP email sending error:', error);
      throw error;
    }
  }

  // Generate basic HTML template (fallback)
  static generateBasicHtmlTemplate(emailData) {
    const data = emailData.dynamicTemplateData;
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification from Nexus Platform</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; }
          .info-row { margin: 10px 0; padding: 10px; background: #f8f9fa; border-right: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Notification from Nexus Platform</h1>
            <p>مرحباً ${data.instructorName}</p>
          </div>
          <div class="content">
            ${this.generateTemplateContent(emailData.templateId, data)}
          </div>
          <div class="footer">
            <p>للاستفسارات: ${data.supportEmail}</p>
            <p>© 2024 ${data.platformName}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate content based on template type
  static generateTemplateContent(templateId, data) {
    switch (templateId) {
      case EMAIL_CONFIG.templates.withdrawalRequested:
        return `
          <h2>✅ تم استلام طلب السحب</h2>
          <div class="info-row">
            <strong>Withdrawal Amount:</strong> <span class="amount">${data.withdrawalAmount} ${data.currency}</span>
          </div>
          <div class="info-row">
            <strong>Net Amount:</strong> ${data.netAmount} ${data.currency}
          </div>
          <div class="info-row">
            <strong>Payment Method:</strong> ${data.paymentMethod}
          </div>
          <div class="info-row">
            <strong>Request ID:</strong> ${data.withdrawalId}
          </div>
          <div class="info-row">
            <strong>Time المتوقع للProcessing:</strong> ${data.estimatedProcessing}
          </div>
          <p>سيتم Processing طلبك in أقرب وقت ممكن وستصلك Thesis Confirm aboutد إتمام الprocess.</p>
        `;
        
      case EMAIL_CONFIG.templates.withdrawalCompleted:
        return `
          <h2>🎉 تم إتمام process السحب successfully</h2>
          <div class="info-row">
            <strong>Transferred Amount:</strong> <span class="amount">${data.netAmount} ${data.currency}</span>
          </div>
          <div class="info-row">
            <strong>Transaction Number:</strong> ${data.transactionId}
          </div>
          <div class="info-row">
            <strong>Payment Method:</strong> ${data.paymentMethod}
          </div>
          <div class="info-row">
            <strong>تاريخ الإتمام:</strong> ${data.completedDate}
          </div>
          <p>تم تحويل Earnings successfully to حسابك. Thank you لاستخدام Nexus Platform!</p>
        `;
        
      case EMAIL_CONFIG.templates.withdrawalFailed:
        return `
          <h2>❌ Failure in process السحب</h2>
          <div class="info-row">
            <strong>Amount:</strong> ${data.withdrawalAmount} ${data.currency}
          </div>
          <div class="info-row">
            <strong>Failure Reason:</strong> ${data.errorMessage}
          </div>
          <div class="info-row">
            <strong>Request ID:</strong> ${data.withdrawalId}
          </div>
          <p>تم إرجاع Amount to رصيدك الAvailable. يمكنك المحاولة مرة أخرى أو التواصل with Support الفني.</p>
          <p><strong>الخطوات Nextة:</strong> ${data.nextSteps}</p>
        `;
        
      default:
        return '<p>Thesis from Nexus Educational Platform</p>';
    }
  }

  // Helper methods
  static getPaymentMethodNameAr(type) {
    const names = {
      stripe: 'Stripe',
      paypal: 'PayPal',
      fawry: 'instant',
      vodafone: 'Vodafone Cash',
      bank: 'Bank Transfer'
    };
    return names[type] || type;
  }

  static formatAccountDetails(paymentMethod) {
    switch (paymentMethod.type) {
      case 'bank':
        return `${paymentMethod.bankName} - ${paymentMethod.accountNumber}`;
      case 'paypal':
        return paymentMethod.paypalEmail;
      case 'vodafone':
        return paymentMethod.vodafoneCashNumber;
      default:
        return 'Not specified';
    }
  }

  static getFailureNextSteps(paymentMethodType) {
    const steps = {
      bank: 'Verify bank account details and ensure IBAN is correct',
      paypal: 'Verify the email address linked to PayPal',
      vodafone: 'Verify Vodafone Cash number and ensure service is activated',
      fawry: 'Verify instant payment service details',
      stripe: 'Verify credit card details'
    };
    return steps[paymentMethodType] || 'Contact technical support for assistance';
  }

  static getTaxAdvice() {
    return [
      'Keep all income and expense receipts',
      'Consult a qualified tax accountant to review your tax return',
      'Ensure all income from the platform is recorded in your return',
      'Some teaching-related expenses can be deducted as deductible expenses'
    ];
  }

  static getEmailSubject(templateId) {
    const subjects = {
      [EMAIL_CONFIG.templates.withdrawalRequested]: 'Withdrawal request received Earnings - Nexus Platform',
      [EMAIL_CONFIG.templates.withdrawalCompleted]: 'Earnings withdrawal completed successfully - Nexus Platform',
      [EMAIL_CONFIG.templates.withdrawalFailed]: 'Alert: Failure in earnings withdrawal process - Nexus Platform',
      [EMAIL_CONFIG.templates.monthlyReport]: 'Monthly earnings report - Nexus Platform',
      [EMAIL_CONFIG.templates.taxReport]: 'Annual tax report - Nexus Platform'
    };
    return subjects[templateId] || 'Notification from Nexus Platform';
  }

  // Send test email to verify configuration
  static async sendTestEmail(recipientEmail) {
    try {
      const testEmailData = {
        to: recipientEmail,
        from: {
          email: EMAIL_CONFIG.sendgrid.fromEmail,
          name: EMAIL_CONFIG.sendgrid.fromName
        },
        subject: 'Email service test - Nexus Platform',
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; padding: 20px;">
            <h2>✅ تم Setup خدمة Email successfully</h2>
            <p>this Thesis Quiz لConfirm أن خدمة Submit Notifications تعمل correctly صحيح.</p>
            <p>Date: ${new Date().toLocaleDateString('ar-EG')}</p>
            <p>Time: ${new Date().toLocaleTimeString('ar-EG')}</p>
            <br>
            <p>Nexus Educational Platform</p>
          </div>
        `
      };

      if (EMAIL_CONFIG.sendgrid.apiKey) {
        await sgMail.send(testEmailData);
      } else {
        await this.sendViaSMTP(testEmailData);
      }

      return { success: true, message: 'Test email sent successfully' };

    } catch (error) {
      console.error('Test email sending error:', error);
      throw new Error(`Failure in Submit Thesis الQuiz: ${error.message}`);
    }
  }

  // Check email service configuration
  static checkConfiguration() {
    const status = {
      sendgrid: {
        configured: !!EMAIL_CONFIG.sendgrid.apiKey,
        status: EMAIL_CONFIG.sendgrid.apiKey ? 'Ready' : 'Not ready'
      },
      smtp: {
        configured: !!(EMAIL_CONFIG.smtp.user && EMAIL_CONFIG.smtp.pass),
        status: (EMAIL_CONFIG.smtp.user && EMAIL_CONFIG.smtp.pass) ? 'Ready' : 'Not ready'
      }
    };

    return {
      hasEmailService: status.sendgrid.configured || status.smtp.configured,
      services: status,
      recommendation: this.getEmailServiceRecommendation(status)
    };
  }

  static getEmailServiceRecommendation(status) {
    if (status.sendgrid.configured) {
      return 'SendGrid configured correctly - Service ready to use';
    } else if (status.smtp.configured) {
      return 'SMTP configured as backup service - SendGrid recommended for better performance';
    } else {
      return 'No email service configured - Set up SendGrid or SMTP';
    }
  }
}

export default EmailNotificationService;