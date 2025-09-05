import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Payment Gateway Configuration
const PAYMENT_CONFIG = {
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_...',
    fees: {
      international: 0.029, // 2.9% + 30¢
      domestic: 0.025, // 2.5%
      fixedFee: 0.30 // $0.30
    }
  },
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
    sandbox: import.meta.env.VITE_PAYPAL_SANDBOX === 'true',
    fees: {
      rate: 0.035, // 3.5%
      fixedFee: 0.15 // $0.15
    }
  },
  fawry: {
    merchantCode: import.meta.env.VITE_FAWRY_MERCHANT_CODE || '',
    securityKey: import.meta.env.VITE_FAWRY_SECURITY_KEY || '',
    baseUrl: import.meta.env.VITE_FAWRY_BASE_URL || 'https://atfawry.fawrystaging.com',
    fees: {
      rate: 0.02, // 2%
      fixedFee: 1.0 // 1 EGP
    }
  },
  vodafone: {
    merchantId: import.meta.env.VITE_VODAFONE_MERCHANT_ID || '',
    apiKey: import.meta.env.VITE_VODAFONE_API_KEY || '',
    baseUrl: import.meta.env.VITE_VODAFONE_BASE_URL || 'https://api.vodafone.com.eg',
    fees: {
      rate: 0.015, // 1.5%
      maxFee: 20.0 // Max 20 EGP
    }
  }
};

// Initialize Stripe
let stripeInstance = null;
const initializeStripe = async () => {
  if (!stripeInstance) {
    stripeInstance = await loadStripe(PAYMENT_CONFIG.stripe.publicKey);
  }
  return stripeInstance;
};

// Payment Gateway Service
export class PaymentGatewayService {
  
  // Calculate fees for different payment methods
  static calculateFees(amount, method, currency = 'EGP') {
    const config = PAYMENT_CONFIG[method];
    if (!config) throw new Error(`Unsupported payment method: ${method}`);

    let fee = 0;
    let description = '';

    switch (method) {
      case 'stripe':
        fee = (amount * config.fees.international) + config.fees.fixedFee;
        description = `رسوم Stripe: ${(config.fees.international * 100)}% + ${config.fees.fixedFee} دولار`;
        break;
        
      case 'paypal':
        fee = (amount * config.fees.rate) + config.fees.fixedFee;
        description = `رسوم PayPal: ${(config.fees.rate * 100)}% + ${config.fees.fixedFee} دولار`;
        break;
        
      case 'fawry':
        fee = (amount * config.fees.rate) + config.fees.fixedFee;
        description = `رسوم فوري: ${(config.fees.rate * 100)}% + ${config.fees.fixedFee} جنيه`;
        break;
        
      case 'vodafone':
        fee = Math.min((amount * config.fees.rate), config.fees.maxFee);
        description = `رسوم فودافون كاش: ${(config.fees.rate * 100)}% (حد أقصى ${config.fees.maxFee} جنيه)`;
        break;
        
      default:
        fee = 0;
        description = 'بدون رسوم إضافية';
    }

    return {
      fee: Math.round(fee * 100) / 100,
      netAmount: Math.round((amount - fee) * 100) / 100,
      description
    };
  }

  // Stripe Integration
  static async processStripePayment(paymentData) {
    try {
      const stripe = await initializeStripe();
      
      // Create payment intent on backend
      const response = await axios.post('/api/payments/stripe/create-intent', {
        amount: Math.round(paymentData.amount * 100), // Amount in cents
        currency: paymentData.currency || 'usd',
        payment_method_types: ['card'],
        metadata: {
          instructor_id: paymentData.instructorId,
          withdrawal_id: paymentData.withdrawalId
        }
      });

      const { client_secret } = response.data;

      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: paymentData.cardElement,
          billing_details: {
            name: paymentData.accountHolderName,
            email: paymentData.email
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return {
        success: true,
        transactionId: result.paymentIntent.id,
        status: result.paymentIntent.status,
        amount: result.paymentIntent.amount / 100,
        currency: result.paymentIntent.currency
      };

    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error(`فشل في معالجة الدفع عبر Stripe: ${error.message}`);
    }
  }

  // PayPal Integration
  static async processPayPalPayment(paymentData) {
    try {
      // Get PayPal access token
      const authResponse = await axios.post('https://api.paypal.com/v1/oauth2/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          auth: {
            username: PAYMENT_CONFIG.paypal.clientId,
            password: PAYMENT_CONFIG.paypal.clientSecret
          }
        }
      );

      const accessToken = authResponse.data.access_token;

      // Create payout
      const payoutResponse = await axios.post(
        `${PAYMENT_CONFIG.paypal.sandbox ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com'}/v1/payments/payouts`,
        {
          sender_batch_header: {
            sender_batch_id: `batch_${Date.now()}`,
            email_subject: "دفع أرباح من منصة نيكسوس",
            email_message: "تم تحويل أرباحك بنجاح"
          },
          items: [{
            recipient_type: "EMAIL",
            amount: {
              value: paymentData.amount.toFixed(2),
              currency: paymentData.currency || 'USD'
            },
            receiver: paymentData.paypalEmail,
            note: `دفع أرباح - معرف السحب: ${paymentData.withdrawalId}`,
            sender_item_id: paymentData.withdrawalId
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return {
        success: true,
        transactionId: payoutResponse.data.batch_header.payout_batch_id,
        status: 'pending',
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD'
      };

    } catch (error) {
      console.error('PayPal payment error:', error);
      throw new Error(`فشل في معالجة الدفع عبر PayPal: ${error.response?.data?.message || error.message}`);
    }
  }

  // Fawry Integration (Egyptian Payment Gateway)
  static async processFawryPayment(paymentData) {
    try {
      const requestPayload = {
        merchantCode: PAYMENT_CONFIG.fawry.merchantCode,
        merchantRefNum: paymentData.withdrawalId,
        amount: paymentData.amount,
        description: `دفع أرباح - ${paymentData.instructorName}`,
        customerMobile: paymentData.phone,
        customerEmail: paymentData.email,
        customerName: paymentData.accountHolderName
      };

      // Generate signature (this would typically be done on backend)
      const signature = this.generateFawrySignature(requestPayload);
      requestPayload.signature = signature;

      const response = await axios.post(
        `${PAYMENT_CONFIG.fawry.baseUrl}/api/v1/payments`,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.referenceNumber,
        status: response.data.status,
        amount: paymentData.amount,
        currency: 'EGP'
      };

    } catch (error) {
      console.error('Fawry payment error:', error);
      throw new Error(`فشل في معالجة الدفع عبر فوري: ${error.response?.data?.message || error.message}`);
    }
  }

  // Vodafone Cash Integration
  static async processVodafoneCashPayment(paymentData) {
    try {
      const requestPayload = {
        merchantId: PAYMENT_CONFIG.vodafone.merchantId,
        amount: paymentData.amount,
        currency: 'EGP',
        description: `دفع أرباح من منصة نيكسوس`,
        customerPhone: paymentData.vodafoneCashNumber,
        customerName: paymentData.accountHolderName,
        referenceId: paymentData.withdrawalId
      };

      const response = await axios.post(
        `${PAYMENT_CONFIG.vodafone.baseUrl}/wallet/api/v1/transfers`,
        requestPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PAYMENT_CONFIG.vodafone.apiKey}`
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        amount: paymentData.amount,
        currency: 'EGP'
      };

    } catch (error) {
      console.error('Vodafone Cash payment error:', error);
      throw new Error(`فشل في معالجة الدفع عبر فودافون كاش: ${error.response?.data?.message || error.message}`);
    }
  }

  // Bank Transfer Processing (requires manual verification)
  static async processBankTransfer(paymentData) {
    // For bank transfers, we create a pending transaction that requires manual verification
    return {
      success: true,
      transactionId: `bank_${Date.now()}`,
      status: 'pending_verification',
      amount: paymentData.amount,
      currency: 'EGP',
      requiresManualVerification: true,
      estimatedProcessingDays: '3-5',
      bankDetails: {
        bankName: paymentData.bankName,
        accountNumber: paymentData.accountNumber,
        iban: paymentData.iban,
        accountHolderName: paymentData.accountHolderName
      }
    };
  }

  // Generate Fawry signature (should be done on backend for security)
  static generateFawrySignature(data) {
    // This is a simplified version - actual implementation should be on backend
    const CryptoJS = require('crypto-js');
    const concatenatedString = `${data.merchantCode}${data.merchantRefNum}${data.amount}${PAYMENT_CONFIG.fawry.securityKey}`;
    return CryptoJS.SHA256(concatenatedString).toString();
  }

  // Main payment processing method
  static async processPayment(withdrawalRequest) {
    const { paymentMethod, amount, instructorData, withdrawalId } = withdrawalRequest;
    
    // Calculate fees
    const feeCalculation = this.calculateFees(amount, paymentMethod.type);
    
    const paymentData = {
      amount: feeCalculation.netAmount,
      currency: paymentMethod.type === 'paypal' ? 'USD' : 'EGP',
      instructorId: instructorData.uid,
      instructorName: instructorData.displayName,
      email: instructorData.email,
      withdrawalId,
      ...paymentMethod
    };

    let result;
    
    switch (paymentMethod.type) {
      case 'stripe':
        result = await this.processStripePayment(paymentData);
        break;
        
      case 'paypal':
        result = await this.processPayPalPayment(paymentData);
        break;
        
      case 'fawry':
        result = await this.processFawryPayment(paymentData);
        break;
        
      case 'vodafone':
        result = await this.processVodafoneCashPayment(paymentData);
        break;
        
      case 'bank':
        result = await this.processBankTransfer(paymentData);
        break;
        
      default:
        throw new Error(`نوع الدفع غير مدعوم: ${paymentMethod.type}`);
    }

    return {
      ...result,
      fees: feeCalculation,
      originalAmount: amount,
      paymentMethod: paymentMethod.type
    };
  }

  // Get supported payment methods with their current fees
  static getSupportedPaymentMethods() {
    return Object.keys(PAYMENT_CONFIG).map(method => ({
      type: method,
      name: this.getPaymentMethodName(method),
      fees: PAYMENT_CONFIG[method].fees,
      supported: this.isPaymentMethodConfigured(method),
      description: this.getPaymentMethodDescription(method)
    }));
  }

  static getPaymentMethodName(type) {
    const names = {
      stripe: 'Stripe (بطاقات ائتمان دولية)',
      paypal: 'PayPal',
      fawry: 'فوري',
      vodafone: 'فودافون كاش',
      bank: 'تحويل بنكي'
    };
    return names[type] || type;
  }

  static getPaymentMethodDescription(type) {
    const descriptions = {
      stripe: 'دفع فوري عبر بطاقات الائتمان الدولية',
      paypal: 'دفع فوري عبر PayPal',
      fawry: 'دفع عبر محافظ فوري الرقمية',
      vodafone: 'دفع عبر محفظة فودافون كاش',
      bank: 'تحويل بنكي تقليدي (يتطلب 3-5 أيام عمل)'
    };
    return descriptions[type] || '';
  }

  static isPaymentMethodConfigured(type) {
    const config = PAYMENT_CONFIG[type];
    if (!config) return false;

    switch (type) {
      case 'stripe':
        return !!(config.publicKey && config.secretKey);
      case 'paypal':
        return !!(config.clientId && config.clientSecret);
      case 'fawry':
        return !!(config.merchantCode && config.securityKey);
      case 'vodafone':
        return !!(config.merchantId && config.apiKey);
      case 'bank':
        return true; // Bank transfers are always available
      default:
        return false;
    }
  }
}

export default PaymentGatewayService;