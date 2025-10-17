// PayPal Payment Component for Course Purchases
// Integrates PayPal Smart Payment Buttons with course enrollment system

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Shield, Clock, CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';
import PayPalCoursePaymentService from '../../services/PayPalCoursePaymentService';
import toast from 'react-hot-toast';

const PayPalPaymentButton = ({ 
  courseData, 
  userData, 
  onSuccess, 
  onError,
  disabled = false,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const paypalRef = useRef(null);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    initializePayPalButton();
  }, [courseData, userData]);

  const initializePayPalButton = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check PayPal configuration
      if (!PayPalCoursePaymentService.isConfigured()) {
        throw new Error('PayPal Not ready correctly صحيح');
      }

      // Get payment summary
      const summary = PayPalCoursePaymentService.getCoursePaymentSummary(courseData.price);
      setPaymentSummary(summary);

      // Clear existing button
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }

      // Create PayPal button
      const buttonContainer = `paypal-button-${courseData.id}`;
      if (buttonContainerRef.current) {
        buttonContainerRef.current.id = buttonContainer;
      }

      await PayPalCoursePaymentService.createPaymentButton(
        buttonContainer,
        courseData,
        userData,
        handlePaymentSuccess,
        handlePaymentError
      );

      setPaypalReady(true);
      console.log('✅ PayPal button initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize PayPal button:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (result) => {
    try {
      toast.success('🎉 Payment successful! Welcome to the course');
      
      // Call parent success handler
      if (onSuccess) {
        onSuccess({
          transactionId: result.transactionId,
          enrollmentCreated: true,
          paymentMethod: 'paypal',
          amount: paymentSummary?.originalPrice || courseData.price,
          courseId: courseData.id
        });
      }

    } catch (error) {
      console.error('❌ Error in success handler:', error);
      toast.error('An error occurred بعد الدفع. Please التواصل with Support الفني.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    console.error('❌ PayPal payment error:', errorMessage);
    toast.error(errorMessage);
    
    if (onError) {
      onError(errorMessage);
    }
  };

  const retryInitialization = () => {
    setError(null);
    initializePayPalButton();
  };

  if (error) {
    return (
      <div className={`paypal-payment-container ${className}`}>
        <div className="glass border border-red-500/30 bg-red-500/10 rounded-xl p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-semibold text-red-400 text-lg">Error in PayPal</h3>
          </div>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={retryInitialization}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`paypal-payment-container ${className}`}>
      {/* Payment Summary */}
      {paymentSummary && (
        <div className="glass border border-neon-blue/30 bg-neon-blue/5 rounded-xl p-6 mb-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neon-blue/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-neon-blue" />
            </div>
            <h3 className="font-semibold text-white text-lg">Summary الدفع</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-text-secondary">سعر الكورس:</span>
              <span className="text-white font-medium">{paymentSummary.originalPrice} EGP</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-secondary">Amount بالUSD:</span>
              <span className="text-white font-medium">${paymentSummary.usdAmount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-text-secondary">PayPal fees:</span>
              <span className="text-yellow-400 font-medium">${paymentSummary.paypalFee}</span>
            </div>
            <div className="border-t border-glass-border pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-neon-blue font-bold text-lg">${paymentSummary.totalUSD}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 glass rounded-lg border border-neon-blue/20">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-neon-blue">الرسوم paid by student - لا توجد رسوم on platform</span>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Button Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 glass backdrop-blur-xl flex items-center justify-center z-10 rounded-xl border border-glass-border">
            <div className="flex items-center gap-3 text-neon-blue">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">جاري تحميل PayPal...</span>
            </div>
          </div>
        )}

        <div 
          ref={buttonContainerRef}
          className={`paypal-button-container min-h-[50px] rounded-xl overflow-hidden ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        />

        {!paypalReady && !isLoading && !error && (
          <div className="flex items-center justify-center py-6 text-text-secondary">
            <Clock className="w-5 h-5 mr-3" />
            تحضير خيارات الدفع...
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 glass rounded-xl p-6 border border-glass-border backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-neon-green/20 rounded-lg mt-1">
            <CheckCircle className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">دفع آfrom عبر PayPal</h4>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                حماية المشتري from PayPal
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                تشinر SSL للبيانات
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                بيئة Quiz automatic (Sandbox)
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                لا نحتفظ ببيانات البطاقات
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="mt-4 text-center">
        <p className="text-text-secondary text-sm mb-2">in حالة واجهت مشاall in الدفع، تواصل withنا on</p>
        <a 
          href="mailto:support@nexus-edu.com" 
          className="inline-flex items-center gap-2 text-neon-blue hover:text-neon-purple transition-colors font-medium"
        >
          <Mail className="w-4 h-4" />
          support@nexus-edu.com
        </a>
      </div>
    </div>
  );
};

export default PayPalPaymentButton;