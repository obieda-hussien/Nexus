import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Payment Gateway Configuration - free and Paid Options
const PAYMENT_CONFIG = {
  // FREE OPTIONS (No monthly fees - only transaction fees paid by users)
  bank: {
    name: 'Bank Transfer',
    type: 'manual',
    free: true,
    fees: {
      rate: 0, // No fees
      fixedFee: 0,
      description: 'Completely free - Direct transfer'
    }
  },
  
  // LOW-COST OPTIONS (User pays transaction fees)
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_...',
    fees: {
      international: 0.029, // 2.9% + 30¢
      domestic: 0.025, // 2.5%
      fixedFee: 0.30, // $0.30
      description: 'User fees - No monthly charges'
    }
  },
  paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
    sandbox: import.meta.env.VITE_PAYPAL_SANDBOX === 'true',
    fees: {
      rate: 0.035, // 3.5%
      fixedFee: 0.15, // $0.15
      description: 'User fees - free account'
    }
  },
  fawry: {
    merchantCode: import.meta.env.VITE_FAWRY_MERCHANT_CODE || '',
    securityKey: import.meta.env.VITE_FAWRY_SECURITY_KEY || '',
    baseUrl: import.meta.env.VITE_FAWRY_BASE_URL || 'https://atfawry.fawrystaging.com',
    fees: {
      rate: 0.02, // 2%
      fixedFee: 1.0, // 1 EGP
      description: 'Lowest fees in Egypt - User fees'
    }
  },
  vodafone: {
    merchantId: import.meta.env.VITE_VODAFONE_MERCHANT_ID || '',
    apiKey: import.meta.env.VITE_VODAFONE_API_KEY || '',
    baseUrl: import.meta.env.VITE_VODAFONE_BASE_URL || 'https://api.vodafone.com.eg',
    fees: {
      rate: 0.015, // 1.5%
      maxFee: 20.0, // Max 20 EGP
      description: 'Low fees - User fees'
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
        description = `Stripe fees: ${(config.fees.international * 100)}% + ${config.fees.fixedFee} USD`;
        break;
        
      case 'paypal':
        fee = (amount * config.fees.rate) + config.fees.fixedFee;
        description = `PayPal fees: ${(config.fees.rate * 100)}% + ${config.fees.fixedFee} USD`;
        break;
        
      case 'fawry':
        fee = (amount * config.fees.rate) + config.fees.fixedFee;
        description = `instant fees: ${(config.fees.rate * 100)}% + ${config.fees.fixedFee} EGP`;
        break;
        
      case 'vodafone':
        fee = Math.min((amount * config.fees.rate), config.fees.maxFee);
        description = `Vodafone Cash fees: ${(config.fees.rate * 100)}% (maximum ${config.fees.maxFee} EGP)`;
        break;
        
      default:
        fee = 0;
        description = 'No additional fees';
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
      throw new Error(`Payment processing failed via Stripe: ${error.message}`);
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
            email_subject: "Earnings Payment from Nexus Platform",
            email_message: "Your earnings have been transferred successfully"
          },
          items: [{
            recipient_type: "EMAIL",
            amount: {
              value: paymentData.amount.toFixed(2),
              currency: paymentData.currency || 'USD'
            },
            receiver: paymentData.paypalEmail,
            note: `Earnings Payment - Withdrawal ID: ${paymentData.withdrawalId}`,
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
      throw new Error(`Payment processing failed via PayPal: ${error.response?.data?.message || error.message}`);
    }
  }

  // Fawry Integration (Egyptian Payment Gateway)
  static async processFawryPayment(paymentData) {
    try {
      const requestPayload = {
        merchantCode: PAYMENT_CONFIG.fawry.merchantCode,
        merchantRefNum: paymentData.withdrawalId,
        amount: paymentData.amount,
        description: `Earnings Payment - ${paymentData.instructorName}`,
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
      throw new Error(`Payment processing failed via instant: ${error.response?.data?.message || error.message}`);
    }
  }

  // Vodafone Cash Integration
  static async processVodafoneCashPayment(paymentData) {
    try {
      const requestPayload = {
        merchantId: PAYMENT_CONFIG.vodafone.merchantId,
        amount: paymentData.amount,
        currency: 'EGP',
        description: `Earnings Payment from Nexus Platform`,
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
      throw new Error(`Payment processing failed via Vodafone Cash: ${error.response?.data?.message || error.message}`);
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
        throw new Error(`Payment type not supported: ${paymentMethod.type}`);
    }

    return {
      ...result,
      fees: feeCalculation,
      originalAmount: amount,
      paymentMethod: paymentMethod.type
    };
  }

  // Get supported payment methods with their current fees (free options first)
  static getSupportedPaymentMethods() {
    const methods = Object.keys(PAYMENT_CONFIG).map(method => ({
      type: method,
      name: this.getPaymentMethodName(method),
      fees: PAYMENT_CONFIG[method].fees,
      supported: this.isPaymentMethodConfigured(method),
      description: this.getPaymentMethodDescription(method),
      free: PAYMENT_CONFIG[method].free || false,
      cost: this.getPaymentMethodCost(method)
    }));

    // Sort by free status (free first), then by fees
    return methods.sort((a, b) => {
      if (a.free && !b.free) return -1;
      if (!a.free && b.free) return 1;
      return (a.fees.rate || 0) - (b.fees.rate || 0);
    });
  }

  static getPaymentMethodName(type) {
    const names = {
      bank: '🆓 Bank Transfer (Completely free)',
      vodafone: 'Vodafone Cash (Lowest fees)',
      fawry: 'instant',
      stripe: 'Stripe (International credit cards)',
      paypal: 'PayPal'
    };
    return names[type] || type;
  }

  static getPaymentMethodDescription(type) {
    const descriptions = {
      bank: 'Bank Transfer - Completely free with no fees (3-5 business days)',
      vodafone: 'Lowest market fees - only 1.5% (max 20 EGP)',
      fawry: 'instant payment - low fees 2% + 1 EGP',
      stripe: 'instant payment via international credit cards - 2.9% fees',
      paypal: 'instant payment via PayPal - 3.5% fees'
    };
    return descriptions[type] || '';
  }

  static getPaymentMethodCost(type) {
    const config = PAYMENT_CONFIG[type];
    if (config.free) return 'Completely free';
    
    if (config.fees.rate) {
      const percentage = (config.fees.rate * 100).toFixed(1) + '%';
      if (config.fees.fixedFee) {
        return `${percentage} + ${config.fees.fixedFee} ${type === 'fawry' ? 'EGP' : '$'}`;
      }
      if (config.fees.maxFee) {
        return `${percentage} (maximum ${config.fees.maxFee} EGP)`;
      }
      return percentage;
    }
    
    return 'Variable';
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