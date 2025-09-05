import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  Send, 
  Settings,
  TrendingUp,
  FileText,
  Mail,
  Calculator,
  Building,
  Smartphone,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, set, update, push } from 'firebase/database';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import PaymentGatewayService from '../../services/paymentGateways';
import EmailNotificationService from '../../services/emailNotifications';
import TaxReportingService from '../../services/taxReporting';

const AdvancedPaymentGateway = ({ instructorData, onClose }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [emailConfig, setEmailConfig] = useState(null);
  const [taxSettings, setTaxSettings] = useState(null);
  const [withdrawalRequest, setWithdrawalRequest] = useState({
    amount: '',
    paymentMethod: null,
    currency: 'EGP'
  });

  useEffect(() => {
    loadPaymentConfiguration();
  }, []);

  const loadPaymentConfiguration = async () => {
    try {
      setIsLoading(true);
      
      // Load supported payment gateways
      const gateways = PaymentGatewayService.getSupportedPaymentMethods();
      setPaymentGateways(gateways);
      
      // Check email service configuration
      const emailStatus = EmailNotificationService.checkConfiguration();
      setEmailConfig(emailStatus);
      
      // Load tax settings
      const taxConfig = {
        enabled: true,
        autoGenerate: true,
        currency: 'EGP',
        taxYear: new Date().getFullYear()
      };
      setTaxSettings(taxConfig);
      
    } catch (error) {
      console.error('Error loading payment configuration:', error);
      toast.error('فشل في تحميل إعدادات الدفع');
    } finally {
      setIsLoading(false);
    }
  };

  const processAdvancedWithdrawal = async () => {
    if (!withdrawalRequest.amount || !withdrawalRequest.paymentMethod) {
      toast.error('يرجى إدخال المبلغ واختيار طريقة الدفع');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('جاري معالجة طلب السحب...');

      // Calculate fees
      const feeCalculation = PaymentGatewayService.calculateFees(
        parseFloat(withdrawalRequest.amount),
        withdrawalRequest.paymentMethod.type
      );

      // Create withdrawal request
      const withdrawalData = {
        id: `withdrawal_${Date.now()}`,
        amount: parseFloat(withdrawalRequest.amount),
        netAmount: feeCalculation.netAmount,
        fees: feeCalculation,
        paymentMethod: withdrawalRequest.paymentMethod,
        currency: withdrawalRequest.currency,
        status: 'processing',
        requestedAt: Date.now(),
        instructorId: currentUser.uid,
        platformFee: parseFloat(withdrawalRequest.amount) * 0.10,
        taxAmount: parseFloat(withdrawalRequest.amount) * 0.05,
        estimatedProcessing: getEstimatedProcessingTime(withdrawalRequest.paymentMethod.type)
      };

      // Send email notification for withdrawal request
      if (emailConfig?.hasEmailService) {
        try {
          await EmailNotificationService.sendWithdrawalRequestNotification(
            instructorData,
            withdrawalData
          );
          console.log('Withdrawal request notification sent');
        } catch (emailError) {
          console.warn('Email notification failed:', emailError);
        }
      }

      // Process payment through gateway
      let paymentResult;
      try {
        paymentResult = await PaymentGatewayService.processPayment({
          paymentMethod: withdrawalRequest.paymentMethod,
          amount: parseFloat(withdrawalRequest.amount),
          instructorData,
          withdrawalId: withdrawalData.id
        });

        withdrawalData.transactionId = paymentResult.transactionId;
        withdrawalData.status = paymentResult.success ? 'completed' : 'failed';
        
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        withdrawalData.status = 'failed';
        withdrawalData.errorMessage = paymentError.message;
        paymentResult = { success: false, error: paymentError.message };
      }

      // Save withdrawal record
      const withdrawalRef = ref(db, `users/${currentUser.uid}/withdrawalHistory/${withdrawalData.id}`);
      await set(withdrawalRef, withdrawalData);

      // Send completion or failure notification
      if (emailConfig?.hasEmailService) {
        try {
          if (paymentResult.success) {
            await EmailNotificationService.sendWithdrawalCompletedNotification(
              instructorData,
              withdrawalData,
              paymentResult
            );
          } else {
            await EmailNotificationService.sendWithdrawalFailedNotification(
              instructorData,
              withdrawalData,
              paymentResult.error
            );
          }
        } catch (emailError) {
          console.warn('Completion/failure email notification failed:', emailError);
        }
      }

      toast.dismiss();
      
      if (paymentResult.success) {
        toast.success('تم معالجة طلب السحب بنجاح');
        
        // Generate and send monthly report if it's a significant withdrawal
        if (parseFloat(withdrawalRequest.amount) > 1000) {
          generateAndSendTaxUpdate(withdrawalData);
        }
        
      } else {
        toast.error(`فشل في معالجة الدفع: ${paymentResult.error}`);
      }

      // Reset form
      setWithdrawalRequest({ amount: '', paymentMethod: null, currency: 'EGP' });

    } catch (error) {
      console.error('Advanced withdrawal processing error:', error);
      toast.dismiss();
      toast.error(`فشل في معالجة طلب السحب: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndSendTaxUpdate = async (withdrawalData) => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthlySummary = await TaxReportingService.generateMonthlySummary(
        currentUser.uid,
        currentYear,
        currentMonth
      );

      if (emailConfig?.hasEmailService) {
        // This would send a tax update notification
        console.log('Tax update generated for withdrawal:', withdrawalData.id);
      }
    } catch (error) {
      console.warn('Tax update generation failed:', error);
    }
  };

  const generateTaxReport = async (format = 'pdf') => {
    try {
      setIsLoading(true);
      toast.loading('جاري إنتاج التقرير الضريبي...');

      const taxReport = await TaxReportingService.generateAnnualTaxReport(
        currentUser.uid,
        taxSettings.taxYear
      );

      const reportBlob = await TaxReportingService.exportTaxData(
        currentUser.uid,
        taxSettings.taxYear,
        format
      );

      // Download the report
      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-report-${taxSettings.taxYear}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Send email notification with report
      if (emailConfig?.hasEmailService) {
        try {
          await EmailNotificationService.sendTaxReportNotification(instructorData, {
            ...taxReport,
            downloadLink: `تم تحميل التقرير محلياً`,
            attachments: {
              pdfContent: reportBlob
            }
          });
        } catch (emailError) {
          console.warn('Tax report email failed:', emailError);
        }
      }

      toast.dismiss();
      toast.success('تم إنتاج التقرير الضريبي بنجاح');

    } catch (error) {
      console.error('Tax report generation error:', error);
      toast.dismiss();
      toast.error(`فشل في إنتاج التقرير: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailService = async () => {
    try {
      setIsLoading(true);
      toast.loading('جاري اختبار خدمة البريد الإلكتروني...');

      await EmailNotificationService.sendTestEmail(instructorData.email || currentUser.email);
      
      toast.dismiss();
      toast.success('تم إرسال رسالة الاختبار بنجاح');
    } catch (error) {
      console.error('Email test error:', error);
      toast.dismiss();
      toast.error(`فشل في اختبار البريد الإلكتروني: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstimatedProcessingTime = (paymentMethodType) => {
    const times = {
      stripe: 'فوري',
      paypal: 'فوري',
      fawry: '1-2 أيام عمل',
      vodafone: 'فوري',
      bank: '3-5 أيام عمل'
    };
    return times[paymentMethodType] || '1-3 أيام عمل';
  };

  const getPaymentMethodIcon = (type) => {
    const icons = {
      stripe: <CreditCard className="w-5 h-5" />,
      paypal: <Globe className="w-5 h-5" />,
      fawry: <Smartphone className="w-5 h-5" />,
      vodafone: <Smartphone className="w-5 h-5" />,
      bank: <Building className="w-5 h-5" />
    };
    return icons[type] || <CreditCard className="w-5 h-5" />;
  };

  if (isLoading && !paymentGateways.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="mr-3 text-gray-700">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <TrendingUp className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">نظام الدفع المتطور</h2>
                <p className="text-purple-100">بوابات دفع حقيقية • تقارير ضريبية • إشعارات تلقائية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:text-purple-600 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 space-x-reverse mt-4 bg-white bg-opacity-20 rounded-lg p-1">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
              { id: 'withdrawal', label: 'سحب متطور', icon: DollarSign },
              { id: 'tax', label: 'التقارير الضريبية', icon: FileText },
              { id: 'email', label: 'الإشعارات', icon: Mail },
              { id: 'settings', label: 'الإعدادات', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white hover:bg-opacity-30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">نظرة عامة على النظام المتطور</h3>
              
              {/* Gateway Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 ml-2" />
                    بوابات الدفع المتاحة
                  </h4>
                  <div className="space-y-2">
                    {paymentGateways.map(gateway => (
                      <div key={gateway.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getPaymentMethodIcon(gateway.type)}
                          <span className="text-sm">{gateway.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          gateway.supported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {gateway.supported ? 'متاح' : 'غير مُعد'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Mail className="w-5 h-5 ml-2" />
                    حالة خدمة الإشعارات
                  </h4>
                  <div className="space-y-2">
                    {emailConfig && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SendGrid</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            emailConfig.services.sendgrid.configured 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {emailConfig.services.sendgrid.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMTP</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            emailConfig.services.smtp.configured 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {emailConfig.services.smtp.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {emailConfig.recommendation}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">المزايا الجديدة</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-gray-800">دفع فوري</h5>
                    <p className="text-sm text-gray-600">معالجة مباشرة عبر بوابات دفع حقيقية</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <h5 className="font-medium text-gray-800">تقارير ضريبية</h5>
                    <p className="text-sm text-gray-600">تقارير تلقائية متوافقة مع القانون المصري</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <h5 className="font-medium text-gray-800">إشعارات فورية</h5>
                    <p className="text-sm text-gray-600">إشعارات تلقائية لجميع العمليات المالية</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">سحب متطور مع معالجة فورية</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">طلب سحب جديد</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المبلغ ({withdrawalRequest.currency})
                      </label>
                      <input
                        type="number"
                        value={withdrawalRequest.amount}
                        onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        placeholder="أدخل المبلغ"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        طريقة الدفع
                      </label>
                      <div className="space-y-2">
                        {paymentGateways.filter(g => g.supported).map(gateway => {
                          const feeInfo = withdrawalRequest.amount ? 
                            PaymentGatewayService.calculateFees(parseFloat(withdrawalRequest.amount), gateway.type) : 
                            null;
                          
                          return (
                            <label
                              key={gateway.type}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                withdrawalRequest.paymentMethod?.type === gateway.type
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={gateway.type}
                                checked={withdrawalRequest.paymentMethod?.type === gateway.type}
                                onChange={() => setWithdrawalRequest(prev => ({ 
                                  ...prev, 
                                  paymentMethod: { type: gateway.type, name: gateway.name }
                                }))}
                                className="ml-3"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  {getPaymentMethodIcon(gateway.type)}
                                  <span className="font-medium">{gateway.name}</span>
                                </div>
                                <p className="text-sm text-gray-600">{gateway.description}</p>
                                {feeInfo && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {feeInfo.description} • صافي: {feeInfo.netAmount} {withdrawalRequest.currency}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={processAdvancedWithdrawal}
                      disabled={isLoading || !withdrawalRequest.amount || !withdrawalRequest.paymentMethod}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'جاري المعالجة...' : 'معالجة السحب'}
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">مزايا النظام المتطور</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">معالجة فورية</p>
                        <p className="text-sm text-gray-600">دفع مباشر عبر بوابات حقيقية</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">رسوم شفافة</p>
                        <p className="text-sm text-gray-600">عرض واضح لجميع الرسوم والخصومات</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">إشعارات تلقائية</p>
                        <p className="text-sm text-gray-600">تنبيهات فورية لحالة العمليات</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">توثيق كامل</p>
                        <p className="text-sm text-gray-600">سجل مفصل لجميع المعاملات</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">التقارير الضريبية التلقائية</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">إنتاج التقارير</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السنة الضريبية
                      </label>
                      <select
                        value={taxSettings?.taxYear || new Date().getFullYear()}
                        onChange={(e) => setTaxSettings(prev => ({ ...prev, taxYear: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      >
                        {[2024, 2023, 2022].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-700">نسق التقرير</h5>
                      
                      <button
                        onClick={() => generateTaxReport('pdf')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل PDF</span>
                      </button>
                      
                      <button
                        onClick={() => generateTaxReport('excel')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل Excel</span>
                      </button>
                    </div>

                    {emailConfig?.hasEmailService && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            checked={taxSettings?.emailReport ?? true}
                            onChange={(e) => setTaxSettings(prev => ({ ...prev, emailReport: e.target.checked }))}
                            className="text-purple-600"
                          />
                          <span className="text-sm text-gray-700">إرسال التقرير بالبريد الإلكتروني</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">معلومات ضريبية</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">معدلات الضرائب المصرية</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• 0% حتى 8,000 ج.م</p>
                        <p>• 2.5% من 8,000 إلى 30,000 ج.م</p>
                        <p>• 10% من 30,000 إلى 45,000 ج.م</p>
                        <p>• 15% من 45,000 إلى 60,000 ج.م</p>
                        <p>• 20% من 60,000 إلى 200,000 ج.م</p>
                        <p>• 22.5% من 200,000 إلى 400,000 ج.م</p>
                        <p>• 25% أكثر من 400,000 ج.م</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">الخصومات المسموحة</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• خصم نمطي: 9,000 ج.م</p>
                        <p>• مصروفات العمل: حتى 20%</p>
                        <p>• عمولة المنصة: 10%</p>
                        <p>• ضرائب أخرى: 5%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">إشعارات البريد الإلكتروني</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">اختبار الخدمة</h4>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      تأكد من أن خدمة البريد الإلكتروني تعمل بشكل صحيح عن طريق إرسال رسالة اختبار.
                    </p>
                    
                    <button
                      onClick={testEmailService}
                      disabled={isLoading || !emailConfig?.hasEmailService}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال رسالة اختبار</span>
                    </button>

                    {!emailConfig?.hasEmailService && (
                      <div className="flex items-start space-x-2 space-x-reverse bg-yellow-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">خدمة البريد غير مُعدة</p>
                          <p className="text-xs text-yellow-600">قم بإعداد SendGrid أو SMTP في الإعدادات</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">أنواع الإشعارات</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">طلب السحب</p>
                        <p className="text-sm text-gray-600">تأكيد استلام طلب السحب</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">إتمام السحب</p>
                        <p className="text-sm text-gray-600">تأكيد نجاح عملية التحويل</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Mail className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">فشل السحب</p>
                        <p className="text-sm text-gray-600">إشعار بفشل العملية والخطوات التالية</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Mail className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">التقارير الشهرية</p>
                        <p className="text-sm text-gray-600">ملخص شهري للأرباح والضرائب</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <Mail className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">التقارير الضريبية</p>
                        <p className="text-sm text-gray-600">تقارير سنوية وربع سنوية</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">إعدادات النظام المتطور</h3>
              
              <div className="space-y-6">
                {/* Cost Analysis */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Calculator className="w-5 h-5 ml-2" />
                    تحليل التكاليف والرسوم
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">رسوم بوابات الدفع</h5>
                      <div className="space-y-2 text-sm">
                        {paymentGateways.map(gateway => (
                          <div key={gateway.type} className="flex justify-between">
                            <span>{gateway.name}:</span>
                            <span className="font-medium">
                              {gateway.fees.rate ? `${(gateway.fees.rate * 100).toFixed(1)}%` : 'متغيرة'}
                              {gateway.fees.fixedFee && ` + ${gateway.fees.fixedFee}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">رسوم الخدمات الإضافية</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>SendGrid (إشعارات):</span>
                          <span className="font-medium">$14.95/شهر</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تقارير PDF:</span>
                          <span className="font-medium">مجاناً</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تقارير Excel:</span>
                          <span className="font-medium">مجاناً</span>
                        </div>
                        <div className="flex justify-between">
                          <span>API Calls:</span>
                          <span className="font-medium">وفقاً للاستخدام</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Requirements */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">متطلبات التكوين</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">متغيرات البيئة المطلوبة</h5>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono">
                        <div># Payment Gateways</div>
                        <div>VITE_STRIPE_PUBLIC_KEY=pk_...</div>
                        <div>VITE_STRIPE_SECRET_KEY=sk_...</div>
                        <div>VITE_PAYPAL_CLIENT_ID=...</div>
                        <div>VITE_PAYPAL_CLIENT_SECRET=...</div>
                        <div>VITE_FAWRY_MERCHANT_CODE=...</div>
                        <div>VITE_VODAFONE_MERCHANT_ID=...</div>
                        <div className="mt-2"># Email Service</div>
                        <div>VITE_SENDGRID_API_KEY=SG....</div>
                        <div>VITE_FROM_EMAIL=noreply@...</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">الخطوات التالية</h5>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2 space-x-reverse">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <div>
                            <p className="font-medium text-gray-800">إعداد حسابات بوابات الدفع</p>
                            <p className="text-sm text-gray-600">Stripe, PayPal, Fawry, Vodafone Cash</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 space-x-reverse">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <div>
                            <p className="font-medium text-gray-800">إعداد خدمة البريد الإلكتروني</p>
                            <p className="text-sm text-gray-600">SendGrid للإشعارات الاحترافية</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 space-x-reverse">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                          <div>
                            <p className="font-medium text-gray-800">اختبار النظام</p>
                            <p className="text-sm text-gray-600">تجربة جميع العمليات في البيئة التجريبية</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2 space-x-reverse">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                          <div>
                            <p className="font-medium text-gray-800">التشغيل المباشر</p>
                            <p className="text-sm text-gray-600">تفعيل النظام للمدرسين</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedPaymentGateway;