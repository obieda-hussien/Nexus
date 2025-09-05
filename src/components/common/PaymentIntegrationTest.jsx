// PayPal & EmailJS Integration Test Component
// This component tests both services with the provided credentials

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Play, Mail, CreditCard, Loader2 } from 'lucide-react';
import PayPalCoursePaymentService from '../../services/PayPalCoursePaymentService';
import EmailJSNotificationService from '../../services/EmailJSNotificationService';
import PayPalPaymentButton from '../ui/PayPalPaymentButton';
import toast from 'react-hot-toast';

const PaymentIntegrationTest = () => {
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [emailjsStatus, setEmailjsStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    checkConfigurations();
  }, []);

  const checkConfigurations = () => {
    // Check PayPal configuration
    const paypalConfig = PayPalCoursePaymentService.getConfigurationStatus();
    setPaypalStatus(paypalConfig);

    // Check EmailJS configuration
    const emailConfig = EmailJSNotificationService.getConfigurationStatus();
    setEmailjsStatus(emailConfig);
  };

  const testEmailService = async () => {
    setIsTestingEmail(true);
    try {
      // Test with a sample email (replace with actual test email)
      const result = await EmailJSNotificationService.sendTestEmail(
        'bodybody15151@gmail.com',
        'مختبر النظام'
      );
      
      setTestResults(prev => ({
        ...prev,
        email: { success: true, message: 'تم إرسال رسالة الاختبار بنجاح!' }
      }));
      
      toast.success('تم إرسال رسالة الاختبار بنجاح!');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        email: { success: false, message: error.message }
      }));
      toast.error(error.message);
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handlePayPalSuccess = (result) => {
    setTestResults(prev => ({
      ...prev,
      paypal: { success: true, message: 'تم اختبار PayPal بنجاح!', result }
    }));
    toast.success('تم اختبار PayPal بنجاح!');
  };

  const handlePayPalError = (error) => {
    setTestResults(prev => ({
      ...prev,
      paypal: { success: false, message: error }
    }));
    toast.error(error);
  };

  // Sample course data for testing
  const testCourse = {
    id: 'test-course-123',
    title: 'كورس اختبار الدفع',
    price: 100
  };

  // Sample user data for testing
  const testUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'مستخدم الاختبار'
  };

  const StatusCard = ({ title, status, icon: Icon, color }) => (
    <div className={`p-4 rounded-lg border ${color.bg} ${color.border}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${color.icon}`} />
        <h3 className={`font-semibold ${color.text}`}>{title}</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>الحالة:</span>
          <span className={`font-medium ${status?.configured ? 'text-green-600' : 'text-red-600'}`}>
            {status?.configured ? 'مُعدّ بشكل صحيح' : 'غير مُعدّ'}
          </span>
        </div>
        {status && Object.entries(status).map(([key, value]) => (
          key !== 'configured' && (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{key}:</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          اختبار تكامل الدفع والإشعارات
        </h1>
        <p className="text-gray-600">
          تحقق من أن PayPal وEmailJS يعملان بشكل صحيح مع البيانات المقدمة
        </p>
      </div>

      {/* Configuration Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <StatusCard
          title="تكوين PayPal"
          status={paypalStatus}
          icon={CreditCard}
          color={{
            bg: paypalStatus?.configured ? 'bg-green-50' : 'bg-red-50',
            border: paypalStatus?.configured ? 'border-green-200' : 'border-red-200',
            icon: paypalStatus?.configured ? 'text-green-600' : 'text-red-600',
            text: paypalStatus?.configured ? 'text-green-800' : 'text-red-800'
          }}
        />

        <StatusCard
          title="تكوين EmailJS"
          status={emailjsStatus}
          icon={Mail}
          color={{
            bg: emailjsStatus?.configured ? 'bg-blue-50' : 'bg-red-50',
            border: emailjsStatus?.configured ? 'border-blue-200' : 'border-red-200',
            icon: emailjsStatus?.configured ? 'text-blue-600' : 'text-red-600',
            text: emailjsStatus?.configured ? 'text-blue-800' : 'text-red-800'
          }}
        />
      </div>

      {/* Test Buttons */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* EmailJS Test */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">اختبار EmailJS</h3>
          <p className="text-gray-600 text-sm mb-4">
            اختبر إرسال رسالة إلكترونية باستخدام الإعدادات المُقدمة
          </p>
          
          <button
            onClick={testEmailService}
            disabled={!emailjsStatus?.configured || isTestingEmail}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTestingEmail ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                اختبار إرسال رسالة
              </>
            )}
          </button>

          {testResults.email && (
            <div className={`mt-4 p-3 rounded-lg ${testResults.email.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {testResults.email.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${testResults.email.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResults.email.message}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PayPal Test */}
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">اختبار PayPal</h3>
          <p className="text-gray-600 text-sm mb-4">
            اختبر عملية دفع تجريبية باستخدام PayPal Sandbox
          </p>

          {paypalStatus?.configured ? (
            <PayPalPaymentButton
              courseData={testCourse}
              userData={testUser}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              className="paypal-test-button"
            />
          ) : (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
              PayPal غير مُعدّ بشكل صحيح
            </div>
          )}

          {testResults.paypal && (
            <div className={`mt-4 p-3 rounded-lg ${testResults.paypal.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {testResults.paypal.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${testResults.paypal.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResults.paypal.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integration Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-800 mb-3">ملخص التكامل</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">بيانات PayPal:</h4>
            <ul className="space-y-1 text-indigo-600">
              <li>• Client ID: AQ7ymS-...</li>
              <li>• البيئة: Sandbox</li>
              <li>• العملة: USD</li>
              <li>• الحماية: SSL + PayPal Protection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-700 mb-2">بيانات EmailJS:</h4>
            <ul className="space-y-1 text-indigo-600">
              <li>• Service ID: service_nexus</li>
              <li>• Template: template_kqq1yn5</li>
              <li>• الحد الشهري: 200 رسالة مجانية</li>
              <li>• بديل: إشعارات المتصفح</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">الخطوات التالية</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✅ <strong>PayPal:</strong> جاهز للاستخدام المباشر في بيئة Sandbox</p>
          <p>✅ <strong>EmailJS:</strong> جاهز لإرسال 200 رسالة شهرياً مجاناً</p>
          <p>🔄 <strong>للإنتاج:</strong> تحويل PayPal إلى Live Environment</p>
          <p>📧 <strong>البريد:</strong> يمكن زيادة الحد الشهري حسب الحاجة</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegrationTest;