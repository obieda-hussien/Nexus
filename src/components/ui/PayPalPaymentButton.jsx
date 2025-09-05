// PayPal Payment Component for Course Purchases
// Integrates PayPal Smart Payment Buttons with course enrollment system

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Shield, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
        throw new Error('PayPal غير مُعد بشكل صحيح');
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
      toast.success('🎉 تم الدفع بنجاح! مرحباً بك في الكورس');
      
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
      toast.error('حدث خطأ بعد الدفع. يرجى التواصل مع الدعم الفني.');
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">خطأ في PayPal</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={retryInitialization}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">ملخص الدفع</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">سعر الكورس:</span>
              <span className="font-medium">{paymentSummary.originalPrice} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المبلغ بالدولار:</span>
              <span className="font-medium">${paymentSummary.usdAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">رسوم PayPal:</span>
              <span className="font-medium">${paymentSummary.paypalFee}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>الإجمالي:</span>
                <span className="text-blue-600">${paymentSummary.totalUSD}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>الرسوم يدفعها الطالب - لا توجد رسوم على المنصة</span>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Button Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">جاري تحميل PayPal...</span>
            </div>
          </div>
        )}

        <div 
          ref={buttonContainerRef}
          className={`paypal-button-container min-h-[50px] ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        />

        {!paypalReady && !isLoading && !error && (
          <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            تحضير خيارات الدفع...
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-800 mb-1">دفع آمن عبر PayPal</p>
            <ul className="space-y-1">
              <li>• حماية المشتري من PayPal</li>
              <li>• تشفير SSL للبيانات</li>
              <li>• بيئة اختبار آمنة (Sandbox)</li>
              <li>• لا نحتفظ ببيانات البطاقات</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="mt-3 text-center text-xs text-gray-500">
        <p>في حالة واجهت مشاكل في الدفع، تواصل معنا على</p>
        <a 
          href="mailto:support@nexus-edu.com" 
          className="text-blue-600 hover:underline"
        >
          support@nexus-edu.com
        </a>
      </div>
    </div>
  );
};

export default PayPalPaymentButton;