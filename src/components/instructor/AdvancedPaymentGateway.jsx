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
import FreeEmailService from '../../services/freeEmailService';
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
      const emailStatus = FreeEmailService.checkConfiguration();
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
          await FreeEmailService.sendWithdrawalRequestNotification(
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
            await FreeEmailService.sendWithdrawalCompletedNotification(
              instructorData,
              withdrawalData,
              paymentResult
            );
          } else {
            await FreeEmailService.sendWithdrawalFailedNotification(
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
          await FreeEmailService.sendTaxReportNotification(instructorData, {
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

      await FreeEmailService.sendTestEmail(instructorData.email || currentUser.email);
      
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="glass rounded-xl p-8 max-w-md w-full mx-4 border border-glass-border backdrop-blur-xl bg-primary-bg/80">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin"></div>
            <span className="mr-4 text-white font-medium">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl"></div>
      </div>

      <div className="glass rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-glass-border backdrop-blur-xl bg-primary-bg/80">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 backdrop-blur-xl border-b border-glass-border text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 glass rounded-xl border border-glass-border">
                <TrendingUp className="w-8 h-8 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  نظام الدفع المتطور
                </h2>
                <p className="text-text-secondary text-sm">
                  بوابات دفع حقيقية • تقارير ضريبية • إشعارات تلقائية
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 hover:text-neon-blue p-3 rounded-lg transition-all duration-300 glass border border-glass-border"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 space-x-reverse mt-6 glass rounded-lg p-1 border border-glass-border">
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
                className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/25'
                    : 'text-text-secondary hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-primary-bg/90">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  نظرة عامة على النظام المتطور
                </h3>
                <p className="text-text-secondary">إدارة شاملة للمدفوعات والأرباح مع خدمات مجانية</p>
              </div>
              
              {/* Gateway Status Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-glass-border backdrop-blur-xl hover:bg-opacity-20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <CreditCard className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-lg">بوابات الدفع المتاحة</h4>
                  </div>
                  <div className="space-y-3">
                    {paymentGateways.map(gateway => (
                      <div key={gateway.type} className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="text-neon-blue">
                            {getPaymentMethodIcon(gateway.type)}
                          </div>
                          <span className="text-white font-medium">{gateway.name}</span>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                          gateway.supported 
                            ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {gateway.supported ? 'متاح ✓' : 'غير مُعد ✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-6 border border-glass-border backdrop-blur-xl hover:bg-opacity-20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-neon-purple/20 rounded-full">
                      <Mail className="w-6 h-6 text-neon-purple" />
                    </div>
                    <h4 className="font-semibold text-white text-lg">حالة خدمة الإشعارات</h4>
                  </div>
                  <div className="space-y-3">
                    {emailConfig && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-neon-purple" />
                            <span className="text-white font-medium">EmailJS (مجاني)</span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                            emailConfig.services?.emailjs?.configured 
                              ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {emailConfig.services?.emailjs?.status || 'غير مُعد'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-neon-green" />
                            <span className="text-white font-medium">إشعارات المتصفح</span>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-medium border bg-neon-green/20 text-neon-green border-neon-green/30">
                            جاهز ✓
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-blue-400 leading-relaxed">
                            💡 {emailConfig.recommendation || 'النظام يعمل بخدمات مجانية مع إمكانية الترقية'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Features Overview */}
              <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl bg-gradient-to-r from-neon-blue/5 to-neon-purple/5">
                <div className="text-center mb-6">
                  <h4 className="font-semibold text-white text-xl mb-2">المزايا الجديدة</h4>
                  <div className="w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-blue/50 transition-colors">
                      <CreditCard className="w-8 h-8 text-neon-blue" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">دفع فوري</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">معالجة مباشرة عبر بوابات دفع حقيقية مع رسوم شفافة</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-green/50 transition-colors">
                      <FileText className="w-8 h-8 text-neon-green" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">تقارير ضريبية</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">تقارير تلقائية متوافقة مع القانون المصري والضرائب</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-purple/50 transition-colors">
                      <Mail className="w-8 h-8 text-neon-purple" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">إشعارات فورية</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">إشعارات تلقائية مجانية لجميع العمليات المالية والتحويلات</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  سحب متطور مع معالجة فورية
                </h3>
                <p className="text-text-secondary">إدارة طلبات السحب مع رسوم شفافة ومعالجة آمنة</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <DollarSign className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">طلب سحب جديد</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        المبلغ ({withdrawalRequest.currency})
                      </label>
                      <input
                        type="number"
                        value={withdrawalRequest.amount}
                        onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 glass border border-glass-border rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-neon-blue bg-secondary-bg/50 text-white placeholder-text-secondary transition-all duration-300"
                        placeholder="أدخل المبلغ"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        طريقة الدفع
                      </label>
                      <div className="space-y-3">
                        {paymentGateways.filter(g => g.supported).map(gateway => {
                          const feeInfo = withdrawalRequest.amount ? 
                            PaymentGatewayService.calculateFees(parseFloat(withdrawalRequest.amount), gateway.type) : 
                            null;
                          
                          return (
                            <label
                              key={gateway.type}
                              className={`flex items-center p-4 glass border rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                                withdrawalRequest.paymentMethod?.type === gateway.type
                                  ? 'border-neon-blue bg-neon-blue/10 shadow-lg shadow-neon-blue/20' 
                                  : 'border-glass-border hover:border-neon-blue/50'
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
                                className="ml-3 text-neon-blue focus:ring-neon-blue"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                  <div className="text-neon-blue">
                                    {getPaymentMethodIcon(gateway.type)}
                                  </div>
                                  <span className="font-semibold text-white">{gateway.name}</span>
                                </div>
                                <p className="text-sm text-text-secondary mb-2">{gateway.description}</p>
                                {feeInfo && (
                                  <div className="bg-secondary-bg/30 p-2 rounded-lg">
                                    <p className="text-xs text-neon-green">
                                      {feeInfo.description} • صافي المبلغ: {feeInfo.netAmount} {withdrawalRequest.currency}
                                    </p>
                                  </div>
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
                      className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white py-4 px-6 rounded-xl font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-neon-blue/25 flex items-center justify-center gap-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          معالجة السحب
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl bg-gradient-to-br from-neon-green/5 to-neon-blue/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <CheckCircle className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">مزايا النظام المتطور</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-green/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-4 h-4 text-neon-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">معالجة فورية</p>
                        <p className="text-sm text-text-secondary leading-relaxed">دفع مباشر عبر بوابات حقيقية مع تتبع لحظي للحالة</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-blue/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Calculator className="w-4 h-4 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">رسوم شفافة</p>
                        <p className="text-sm text-text-secondary leading-relaxed">عرض واضح لجميع الرسوم والخصومات قبل التأكيد</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-purple/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-4 h-4 text-neon-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">إشعارات تلقائية</p>
                        <p className="text-sm text-text-secondary leading-relaxed">تنبيهات فورية مجانية لحالة العمليات عبر البريد والمتصفح</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-yellow-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">توثيق كامل</p>
                        <p className="text-sm text-text-secondary leading-relaxed">سجل مفصل ومرجع دائم لجميع المعاملات والتحويلات</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      🎉 نظام مجاني بنسبة 90%
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      التكلفة الوحيدة هي رسوم المعاملات التي يدفعها المستخدم النهائي فقط
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  التقارير الضريبية التلقائية
                </h3>
                <p className="text-text-secondary">تقارير متوافقة مع القانون المصري والضرائب المحلية</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <FileText className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">إنتاج التقارير</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        السنة الضريبية
                      </label>
                      <select
                        value={taxSettings?.taxYear || new Date().getFullYear()}
                        onChange={(e) => setTaxSettings(prev => ({ ...prev, taxYear: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 glass border border-glass-border rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-neon-blue bg-secondary-bg/50 text-white transition-all duration-300"
                      >
                        {[2024, 2023, 2022].map(year => (
                          <option key={year} value={year} className="bg-secondary-bg text-white">{year}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-text-secondary">نسق التقرير</h5>
                      
                      <button
                        onClick={() => generateTaxReport('pdf')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل PDF</span>
                      </button>
                      
                      <button
                        onClick={() => generateTaxReport('excel')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل Excel</span>
                      </button>
                    </div>

                    {emailConfig?.hasEmailService && (
                      <div className="pt-4 border-t border-glass-border">
                        <label className="flex items-center space-x-2 space-x-reverse glass p-3 rounded-lg border border-glass-border cursor-pointer hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={taxSettings?.emailReport ?? true}
                            onChange={(e) => setTaxSettings(prev => ({ ...prev, emailReport: e.target.checked }))}
                            className="text-neon-blue focus:ring-neon-blue"
                          />
                          <span className="text-sm text-white font-medium">إرسال التقرير بالبريد الإلكتروني</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl bg-gradient-to-br from-neon-blue/5 to-neon-purple/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-purple/20 rounded-full">
                      <Calculator className="w-6 h-6 text-neon-purple" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">معلومات ضريبية</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                        معدلات الضرائب المصرية
                      </h5>
                      <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
                        <div className="flex justify-between"><span>0% حتى 8,000 ج.م</span><span className="text-neon-green">معفي</span></div>
                        <div className="flex justify-between"><span>2.5% من 8,000 إلى 30,000 ج.م</span><span className="text-yellow-400">منخفض</span></div>
                        <div className="flex justify-between"><span>10% من 30,000 إلى 45,000 ج.م</span><span className="text-orange-400">متوسط</span></div>
                        <div className="flex justify-between"><span>15% من 45,000 إلى 60,000 ج.م</span><span className="text-red-400">عالي</span></div>
                        <div className="flex justify-between"><span>20% من 60,000 إلى 200,000 ج.م</span><span className="text-red-400">عالي</span></div>
                        <div className="flex justify-between"><span>22.5% من 200,000 إلى 400,000 ج.م</span><span className="text-red-500">عالي جداً</span></div>
                        <div className="flex justify-between"><span>25% أكثر من 400,000 ج.م</span><span className="text-red-600">الأعلى</span></div>
                      </div>
                    </div>
                    
                    <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                        الخصومات المسموحة
                      </h5>
                      <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
                        <div className="flex justify-between"><span>خصم نمطي:</span><span className="text-neon-green">9,000 ج.م</span></div>
                        <div className="flex justify-between"><span>مصروفات العمل:</span><span className="text-neon-green">حتى 20%</span></div>
                        <div className="flex justify-between"><span>عمولة المنصة:</span><span className="text-neon-blue">10%</span></div>
                        <div className="flex justify-between"><span>ضرائب أخرى:</span><span className="text-yellow-400">5%</span></div>
                      </div>
                    </div>

                    <div className="p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                      <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                        <CheckCircle className="w-4 h-4" />
                        💡 تقارير مجانية بالكامل
                      </div>
                      <div className="text-sm text-text-secondary leading-relaxed">
                        إنتاج وتصدير التقارير مجاني تماماً بدون أي رسوم إضافية أو اشتراكات
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  إشعارات البريد الإلكتروني
                </h3>
                <p className="text-text-secondary">خدمة إشعارات مجانية مع نظام احتياطي موثوق</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-purple/20 rounded-full">
                      <Mail className="w-6 h-6 text-neon-purple" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">اختبار الخدمة</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 glass rounded-lg border border-glass-border bg-secondary-bg/30">
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        تأكد من أن خدمة البريد الإلكتروني تعمل بشكل صحيح عن طريق إرسال رسالة اختبار إلى عنوانك.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neon-green">
                        <CheckCircle className="w-4 h-4" />
                        <span>200 رسالة مجانية شهرياً مع EmailJS</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={testEmailService}
                      disabled={isLoading || !emailConfig?.hasEmailService}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-neon-purple to-neon-blue text-white py-4 px-6 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-neon-purple/25 font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          إرسال رسالة اختبار
                        </>
                      )}
                    </button>

                    {!emailConfig?.hasEmailService && (
                      <div className="flex items-start space-x-3 space-x-reverse glass p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                        <div className="p-2 bg-yellow-500/20 rounded-full">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-yellow-400 mb-1">خدمة البريد غير مُعدة</p>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            سيتم استخدام إشعارات المتصفح كبديل مجاني. يمكنك إعداد EmailJS للحصول على 200 رسالة مجانية شهرياً
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl bg-gradient-to-br from-neon-green/5 to-neon-purple/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <CheckCircle className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">أنواع الإشعارات</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-blue/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="w-5 h-5 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">طلب السحب</p>
                        <p className="text-sm text-text-secondary leading-relaxed">تأكيد استلام طلب السحب مع تفاصيل المبلغ والرسوم</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-green/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">إتمام السحب</p>
                        <p className="text-sm text-text-secondary leading-relaxed">تأكيد نجاح عملية التحويل مع معرف المعاملة</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-red-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">فشل السحب</p>
                        <p className="text-sm text-text-secondary leading-relaxed">إشعار بفشل العملية مع السبب والخطوات التالية</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-neon-purple/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-neon-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">التقارير الشهرية</p>
                        <p className="text-sm text-text-secondary leading-relaxed">ملخص شهري شامل للأرباح والضرائب والإحصائيات</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse group">
                      <div className="p-2 bg-yellow-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">التقارير الضريبية</p>
                        <p className="text-sm text-text-secondary leading-relaxed">تقارير سنوية وربع سنوية جاهزة للتقديم</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      📧 نظام إشعارات مجاني
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      إشعارات المتصفح مجانية دائماً، وEmailJS يوفر 200 رسالة مجانية شهرياً
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  إعدادات النظام المتطور
                </h3>
                <p className="text-text-secondary">تكوين النظام والتحليل المالي للخدمات المجانية</p>
              </div>
              
              <div className="space-y-8">
                {/* Cost Analysis - Enhanced Design */}
                <div className="glass rounded-xl p-8 border border-neon-green/30 bg-neon-green/5 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <Calculator className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">💰 تحليل التكاليف - الحلول المجانية</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-neon-green mb-2">$0</div>
                      <div className="text-text-secondary text-sm mb-1">تكلفة التشغيل الشهرية</div>
                      <div className="text-xs text-neon-green font-medium">100% مجاني</div>
                    </div>
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">3.4%</div>
                      <div className="text-text-secondary text-sm mb-1">رسوم PayPal</div>
                      <div className="text-xs text-yellow-400 font-medium">يدفعها الطالب</div>
                    </div>
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-purple-400 mb-2">200</div>
                      <div className="text-text-secondary text-sm mb-1">رسالة مجانية شهرياً</div>
                      <div className="text-xs text-purple-400 font-medium">EmailJS</div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                        الخدمات المجانية 100%
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">تحويل بنكي:</span>
                          <span className="font-semibold text-neon-green">مجاني تماماً ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">إشعارات المتصفح:</span>
                          <span className="font-semibold text-neon-green">مجاني تماماً ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">تقارير PDF/Excel:</span>
                          <span className="font-semibold text-neon-green">مجاني تماماً ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">النظام الأساسي:</span>
                          <span className="font-semibold text-neon-green">مجاني تماماً ✓</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-yellow-400" />
                        رسوم بوابات الدفع (على المستخدم)
                      </h5>
                      <div className="space-y-3">
                        {paymentGateways.filter(g => g.type !== 'bank').map(gateway => (
                          <div key={gateway.type} className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                            <div className="flex items-center gap-2">
                              <div className="text-neon-blue">
                                {getPaymentMethodIcon(gateway.type)}
                              </div>
                              <span className="text-text-secondary">{gateway.name}:</span>
                            </div>
                            <span className="font-semibold text-white">
                              {gateway.fees?.rate ? `${(gateway.fees.rate * 100).toFixed(1)}%` : 'متغيرة'}
                              {gateway.fees?.fixedFee && ` + ${gateway.fees.fixedFee}`}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-glass-border pt-3 mt-3">
                          <div className="flex justify-between items-center p-3 glass rounded-lg border border-neon-green/30 bg-neon-green/10">
                            <span className="font-semibold text-white">تكلفة المنصة الشهرية:</span>
                            <span className="text-neon-green font-bold">0 جنيه</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      💡 توفير سنوي: $180+ مقارنة بالخدمات المدفوعة
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      النظام يعتمد على الحلول المجانية بنسبة 90% - الرسوم فقط على المعاملات التي يدفعها المستخدم النهائي
                    </div>
                  </div>
                </div>

                {/* Configuration Requirements */}
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <Settings className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">متطلبات التكوين</h4>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                        متغيرات البيئة (اختيارية للحلول المجانية)
                      </h5>
                      <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30 font-mono text-xs">
                        <div className="text-neon-green mb-2"># Free Email Service (اختياري)</div>
                        <div className="text-purple-400">VITE_EMAILJS_SERVICE_ID=<span className="text-white">your_service_id</span></div>
                        <div className="text-purple-400">VITE_EMAILJS_TEMPLATE_ID=<span className="text-white">your_template_id</span></div>
                        <div className="text-purple-400">VITE_EMAILJS_PUBLIC_KEY=<span className="text-white">your_public_key</span></div>
                        <div className="text-neon-green mt-3 mb-2"># Payment Gateways (للرسوم على المستخدم)</div>
                        <div className="text-purple-400">VITE_STRIPE_PUBLIC_KEY=<span className="text-white">pk_...</span></div>
                        <div className="text-purple-400">VITE_PAYPAL_CLIENT_ID=<span className="text-white">...</span></div>
                        <div className="text-purple-400">VITE_FAWRY_MERCHANT_CODE=<span className="text-white">...</span></div>
                        <div className="text-purple-400">VITE_VODAFONE_MERCHANT_ID=<span className="text-white">...</span></div>
                        <div className="text-yellow-400 mt-3"># Bank transfer works without any keys!</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                        الخطوات التالية (حلول مجانية متاحة)
                      </h5>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 space-x-reverse group">
                          <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">✓</div>
                          <div>
                            <p className="font-semibold text-white mb-1">النظام الأساسي جاهز</p>
                            <p className="text-sm text-text-secondary leading-relaxed">تحويل بنكي وإشعارات مجانية تعمل الآن بدون إعداد</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 space-x-reverse group">
                          <div className="w-8 h-8 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">1</div>
                          <div>
                            <p className="font-semibold text-white mb-1">إعداد EmailJS (اختياري - مجاني)</p>
                            <p className="text-sm text-text-secondary leading-relaxed">200 رسالة شهرياً مجاناً للإشعارات الاحترافية</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 space-x-reverse group">
                          <div className="w-8 h-8 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">2</div>
                          <div>
                            <p className="font-semibold text-white mb-1">إعداد بوابات دفع (اختياري)</p>
                            <p className="text-sm text-text-secondary leading-relaxed">الرسوم على المستخدمين النهائيين فقط، لا توجد رسوم ثابتة</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 space-x-reverse group">
                          <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">✓</div>
                          <div>
                            <p className="font-semibold text-white mb-1">التشغيل المباشر</p>
                            <p className="text-sm text-text-secondary leading-relaxed">النظام جاهز للاستخدام الآن دون أي تكاليف تشغيل</p>
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