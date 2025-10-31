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
import freeEmailService from '../../services/freeEmailService';
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
      const emailStatus = freeEmailService.checkConfiguration();
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
      toast.error('Failed to load payment settings');
    } finally {
      setIsLoading(false);
    }
  };

  const processAdvancedWithdrawal = async () => {
    if (!withdrawalRequest.amount || !withdrawalRequest.paymentMethod) {
      toast.error('Please enter amount and select payment method');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Processing withdrawal request...');

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
          await freeEmailService.sendWithdrawalRequestNotification(
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
            await freeEmailService.sendWithdrawalCompletedNotification(
              instructorData,
              withdrawalData,
              paymentResult
            );
          } else {
            await freeEmailService.sendWithdrawalFailedNotification(
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
        toast.success('Withdrawal request processed successfully');
        
        // Generate and send monthly report if it's a significant withdrawal
        if (parseFloat(withdrawalRequest.amount) > 1000) {
          generateAndSendTaxUpdate(withdrawalData);
        }
        
      } else {
        toast.error(`Payment processing failed: ${paymentResult.error}`);
      }

      // Reset form
      setWithdrawalRequest({ amount: '', paymentMethod: null, currency: 'EGP' });

    } catch (error) {
      console.error('Advanced withdrawal processing error:', error);
      toast.dismiss();
      toast.error(`Withdrawal request processing failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndSendTaxUpdate = async (withdrawalData) => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthlySummary = await TaxReportingService.generatemonthlySummary(
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
      toast.loading('Generating tax report...');

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
          await freeEmailService.sendTaxReportNotification(instructorData, {
            ...taxReport,
            downloadLink: `Report downloaded locally`,
            attachments: {
              pdfContent: reportBlob
            }
          });
        } catch (emailError) {
          console.warn('Tax report email failed:', emailError);
        }
      }

      toast.dismiss();
      toast.success('Tax report generated successfully');

    } catch (error) {
      console.error('Tax report generation error:', error);
      toast.dismiss();
      
      // Show detailed error message for Firebase indexing issues
      if (error.message && error.message.includes('Database needs indexing')) {
        toast.error(
          'Database configuration error: Firebase needs field indexing. Check FIREBASE_SETUP.md for solutions',
          {
            duration: 8000,
            style: {
              background: '#ef4444',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px'
            }
          }
        );
      } else {
        toast.error(`Report generation failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailService = async () => {
    try {
      setIsLoading(true);
      toast.loading('Testing email service...');

      await freeEmailService.sendTestEmail(instructorData.email || currentUser.email);
      
      toast.dismiss();
      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Email test error:', error);
      toast.dismiss();
      toast.error(`Email test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getEstimatedProcessingTime = (paymentMethodType) => {
    const times = {
      stripe: 'instant',
      paypal: 'instant',
      fawry: '1-2 business days',
      vodafone: 'instant',
      bank: '3-5 business days'
    };
    return times[paymentMethodType] || '1-3 business days';
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
            <span className="ml-4 text-white font-medium">Loading...</span>
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
            <div className="flex items-center space-x-3">
              <div className="p-3 glass rounded-xl border border-glass-border">
                <TrendingUp className="w-8 h-8 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Advanced Payment System
                </h2>
                <p className="text-text-secondary text-sm">
                  Real payment gateways • Tax reports • Automatic Notifications
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
          <div className="flex space-x-1 mt-6 glass rounded-lg p-1 border border-glass-border">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'withdrawal', label: 'Advanced Withdrawal', icon: DollarSign },
              { id: 'tax', label: 'Tax Reports', icon: FileText },
              { id: 'email', label: 'Notifications', icon: Mail },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
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
                  Overview of Advanced System
                </h3>
                <p className="text-text-secondary">Comprehensive management of payments and earnings with free services</p>
              </div>
              
              {/* Gateway Status Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6 border border-glass-border backdrop-blur-xl hover:bg-opacity-20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <CreditCard className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-lg">Available Payment Gateways</h4>
                  </div>
                  <div className="space-y-3">
                    {paymentGateways.map(gateway => (
                      <div key={gateway.type} className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                        <div className="flex items-center space-x-2">
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
                          {gateway.supported ? 'Available ✓' : 'Not ready ✗'}
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
                    <h4 className="font-semibold text-white text-lg">Notification Service Status</h4>
                  </div>
                  <div className="space-y-3">
                    {emailConfig && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-neon-purple" />
                            <span className="text-white font-medium">EmailJS (free)</span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                            emailConfig.services?.emailjs?.configured 
                              ? 'bg-neon-green/20 text-neon-green border-neon-green/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {emailConfig.services?.emailjs?.status || 'Not ready'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary-bg/50 rounded-lg border border-glass-border">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-neon-green" />
                            <span className="text-white font-medium">Transaction Notifications</span>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-medium border bg-neon-green/20 text-neon-green border-neon-green/30">
                            Ready ✓
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-blue-400 leading-relaxed">
                            💡 {emailConfig.recommendation || 'The system works with free services with the ability to upgrade'}
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
                  <h4 className="font-semibold text-white text-xl mb-2">New Features</h4>
                  <div className="w-24 h-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-blue/50 transition-colors">
                      <CreditCard className="w-8 h-8 text-neon-blue" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">Instant Payment</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">Direct processing through real payment gateways with transparent fees</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-green/50 transition-colors">
                      <FileText className="w-8 h-8 text-neon-green" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">Tax Reports</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">Automatic reports compliant with Egyptian law and taxes</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 border border-glass-border group-hover:border-neon-purple/50 transition-colors">
                      <Mail className="w-8 h-8 text-neon-purple" />
                    </div>
                    <h5 className="font-semibold text-white mb-2">Instant Notifications</h5>
                    <p className="text-text-secondary text-sm leading-relaxed">Free automatic notifications for all financial transactions and transfers</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdrawal' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
                  Advanced withdrawal with instant processing
                </h3>
                <p className="text-text-secondary">Manage withdrawal requests with transparent fees and automatic processing</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <DollarSign className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">New Withdrawal Request</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Amount ({withdrawalRequest.currency})
                      </label>
                      <input
                        type="number"
                        value={withdrawalRequest.amount}
                        onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 glass border border-glass-border rounded-xl focus:ring-2 focus:ring-neon-blue focus:border-neon-blue bg-secondary-bg/50 text-white placeholder-text-secondary transition-all duration-300"
                        placeholder="Enter Amount"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Payment Method
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
                                className="mr-3 text-neon-blue focus:ring-neon-blue"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className="text-neon-blue">
                                    {getPaymentMethodIcon(gateway.type)}
                                  </div>
                                  <span className="font-semibold text-white">{gateway.name}</span>
                                </div>
                                <p className="text-sm text-text-secondary mb-2">{gateway.description}</p>
                                {feeInfo && (
                                  <div className="bg-secondary-bg/30 p-2 rounded-lg">
                                    <p className="text-xs text-neon-green">
                                      {feeInfo.description} • Net Amount: {feeInfo.netAmount} {withdrawalRequest.currency}
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
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Process Withdrawal
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
                    <h4 className="font-semibold text-white text-xl">Advanced System Features</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-green/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-4 h-4 text-neon-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Instant processing</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Direct payment through real gateways with real-time status tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-blue/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Calculator className="w-4 h-4 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Transparent Fees</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Clear view of all fees and deductions before confirmation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-purple/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <Mail className="w-4 h-4 text-neon-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Automatic Notifications</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Instant free notifications for transaction status via Email and in-app</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-yellow-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Complete Documentation</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Detailed log and permanent reference for all transactions and transfers</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      🎉 90% free system
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      The only cost is the transaction fees paid by the end user only
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
                  Automatic Tax Reports
                </h3>
                <p className="text-text-secondary">Reports compliant with Egyptian law and local taxes</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <FileText className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">Generate Reports</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-3">
                        Tax Year
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
                      <h5 className="font-medium text-text-secondary">Report Format</h5>
                      
                      <button
                        onClick={() => generateTaxReport('pdf')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download PDF</span>
                      </button>
                      
                      <button
                        onClick={() => generateTaxReport('excel')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        <span>Download Excel</span>
                      </button>
                    </div>

                    {emailConfig?.hasEmailService && (
                      <div className="pt-4 border-t border-glass-border">
                        <label className="flex items-center space-x-2 glass p-3 rounded-lg border border-glass-border cursor-pointer hover:bg-white/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={taxSettings?.emailReport ?? true}
                            onChange={(e) => setTaxSettings(prev => ({ ...prev, emailReport: e.target.checked }))}
                            className="text-neon-blue focus:ring-neon-blue"
                          />
                          <span className="text-sm text-white font-medium">Email the Report</span>
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
                    <h4 className="font-semibold text-white text-xl">Tax Information</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                        Egyptian Tax Rates
                      </h5>
                      <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
                        <div className="flex justify-between"><span>0% up to 8,000 EGP</span><span className="text-neon-green">Exempt</span></div>
                        <div className="flex justify-between"><span>2.5% from 8,000 to 30,000 EGP</span><span className="text-yellow-400">Low</span></div>
                        <div className="flex justify-between"><span>10% from 30,000 to 45,000 EGP</span><span className="text-orange-400">Intermediate</span></div>
                        <div className="flex justify-between"><span>15% from 45,000 to 60,000 EGP</span><span className="text-red-400">High</span></div>
                        <div className="flex justify-between"><span>20% from 60,000 to 200,000 EGP</span><span className="text-red-400">High</span></div>
                        <div className="flex justify-between"><span>22.5% from 200,000 to 400,000 EGP</span><span className="text-red-500">Very High</span></div>
                        <div className="flex justify-between"><span>25% over 400,000 EGP</span><span className="text-red-600">Highest</span></div>
                      </div>
                    </div>
                    
                    <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30">
                      <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                        Allowed Deductions
                      </h5>
                      <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
                        <div className="flex justify-between"><span>Standard Deduction:</span><span className="text-neon-green">9,000 EGP</span></div>
                        <div className="flex justify-between"><span>Business Expenses:</span><span className="text-neon-green">Up to 20%</span></div>
                        <div className="flex justify-between"><span>Platform Commission:</span><span className="text-neon-blue">10%</span></div>
                        <div className="flex justify-between"><span>Other Taxes:</span><span className="text-yellow-400">5%</span></div>
                      </div>
                    </div>

                    <div className="p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                      <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                        <CheckCircle className="w-4 h-4" />
                        💡 Completely Free Reports
                      </div>
                      <div className="text-sm text-text-secondary leading-relaxed">
                        Producing and exporting reports is completely free without any additional fees or subscriptions
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
                  Email Notifications
                </h3>
                <p className="text-text-secondary">Free notification service with a reliable backup system</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-purple/20 rounded-full">
                      <Mail className="w-6 h-6 text-neon-purple" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">Test Service</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 glass rounded-lg border border-glass-border bg-secondary-bg/30">
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        Ensure that the email service is working correctly by sending a test email to your address.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neon-green">
                        <CheckCircle className="w-4 h-4" />
                        <span>200 free emails monthly with EmailJS</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={testEmailService}
                      disabled={isLoading || !emailConfig?.hasEmailService}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white py-4 px-6 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-neon-purple/25 font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Test Email
                        </>
                      )}
                    </button>

                    {!emailConfig?.hasEmailService && (
                      <div className="flex items-start space-x-3 glass p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                        <div className="p-2 bg-yellow-500/20 rounded-full">
                          <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-yellow-400 mb-1">Email Service Not Ready</p>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            In-app notifications will be used as a free alternative. You can set up EmailJS to get 200 free emails monthly
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
                    <h4 className="font-semibold text-white text-xl">Notification Types</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-blue/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="w-5 h-5 text-neon-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Withdrawal Request</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Confirm receipt of withdrawal request with amount and fee details</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-green/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Withdrawal Completion</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Confirm successful transfer with transaction ID</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-red-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Withdrawal Failure</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Notification of process failure with reason and next steps</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-neon-purple/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-5 h-5 text-neon-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Monthly Reports</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Comprehensive monthly summary of earnings, taxes, and statistics</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group">
                      <div className="p-2 bg-yellow-400/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Tax Reports</p>
                        <p className="text-sm text-text-secondary leading-relaxed">Annual and quarterly reports ready for submission</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      📧 Free Notification System
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      In-app notifications are always free, and EmailJS provides 200 free emails monthly
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
                  Advanced System Settings
                </h3>
                <p className="text-text-secondary">System configuration and financial analysis of free services</p>
              </div>
              
              <div className="space-y-8">
                {/* Cost Analysis - Enhanced Design */}
                <div className="glass rounded-xl p-8 border border-neon-green/30 bg-neon-green/5 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-green/20 rounded-full">
                      <Calculator className="w-6 h-6 text-neon-green" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">💰 Cost Analysis - Free Solutions</h4>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-neon-green mb-2">$0</div>
                      <div className="text-text-secondary text-sm mb-1">Monthly Operating Cost</div>
                      <div className="text-xs text-neon-green font-medium">100% free</div>
                    </div>
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">3.4%</div>
                      <div className="text-text-secondary text-sm mb-1">PayPal Fees</div>
                      <div className="text-xs text-yellow-400 font-medium">Paid by student</div>
                    </div>
                    <div className="text-center p-6 glass rounded-xl border border-glass-border bg-secondary-bg/50 hover:scale-105 transition-transform duration-300">
                      <div className="text-3xl font-bold text-purple-400 mb-2">200</div>
                      <div className="text-text-secondary text-sm mb-1">Free Emails Monthly</div>
                      <div className="text-xs text-purple-400 font-medium">EmailJS</div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                        100% Free Services
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">Bank Transfer:</span>
                          <span className="font-semibold text-neon-green">Completely free ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">In-app Notifications:</span>
                          <span className="font-semibold text-neon-green">Completely free ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">PDF/Excel Reports:</span>
                          <span className="font-semibold text-neon-green">Completely free ✓</span>
                        </div>
                        <div className="flex justify-between items-center p-3 glass rounded-lg border border-glass-border">
                          <span className="text-text-secondary">Basic System:</span>
                          <span className="font-semibold text-neon-green">Completely free ✓</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-yellow-400" />
                        Payment Gateway Fees (on User)
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
                              {gateway.fees?.rate ? `${(gateway.fees.rate * 100).toFixed(1)}%` : 'Variable'}
                              {gateway.fees?.fixedFee && ` + ${gateway.fees.fixedFee}`}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-glass-border pt-3 mt-3">
                          <div className="flex justify-between items-center p-3 glass rounded-lg border border-neon-green/30 bg-neon-green/10">
                            <span className="font-semibold text-white">Monthly Platform Cost:</span>
                            <span className="text-neon-green font-bold">0 EGP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                    <div className="flex items-center gap-2 text-neon-green font-medium mb-2">
                      <CheckCircle className="w-4 h-4" />
                      💡 Annual savings: $180+ compared to paid services
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      The system relies on 90% free solutions - Fees are only on transactions paid by the end user
                    </div>
                  </div>
                </div>

                {/* Configuration Requirements */}
                <div className="glass rounded-xl p-8 border border-glass-border backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-neon-blue/20 rounded-full">
                      <Settings className="w-6 h-6 text-neon-blue" />
                    </div>
                    <h4 className="font-semibold text-white text-xl">Configuration Requirements</h4>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-purple rounded-full"></div>
                        Environment Variables (Optional for free solutions)
                      </h5>
                      <div className="glass rounded-lg p-4 border border-glass-border bg-secondary-bg/30 font-mono text-xs">
                        <div className="text-neon-green mb-2"># Free Email Service (Optional)</div>
                        <div className="text-purple-400">VITE_EMAILJS_SERVICE_ID=<span className="text-white">your_service_id</span></div>
                        <div className="text-purple-400">VITE_EMAILJS_TEMPLATE_ID=<span className="text-white">your_template_id</span></div>
                        <div className="text-purple-400">VITE_EMAILJS_PUBLIC_KEY=<span className="text-white">your_public_key</span></div>
                        <div className="text-neon-green mt-3 mb-2"># Payment Gateways (for fees on user)</div>
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
                        Next Steps (Free Solutions Available)
                      </h5>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">✓</div>
                          <div>
                            <p className="font-semibold text-white mb-1">Basic System Ready</p>
                            <p className="text-sm text-text-secondary leading-relaxed">Bank Transfer and free notifications are working now without setup</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">1</div>
                          <div>
                            <p className="font-semibold text-white mb-1">Setup EmailJS (Optional - Free)</p>
                            <p className="text-sm text-text-secondary leading-relaxed">200 free emails monthly for professional notifications</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">2</div>
                          <div>
                            <p className="font-semibold text-white mb-1">Setup Payment Gateways (Optional)</p>
                            <p className="text-sm text-text-secondary leading-relaxed">Fees are on end users only, no fixed fees</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 group">
                          <div className="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform duration-300">✓</div>
                          <div>
                            <p className="font-semibold text-white mb-1">Live Operation</p>
                            <p className="text-sm text-text-secondary leading-relaxed">System is ready to use now without any operating costs</p>
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
