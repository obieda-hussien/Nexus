import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, CreditCard, DollarSign, Plus, Trash2, Clock, CheckCircle, AlertCircle, Building, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, update, push, get, remove } from 'firebase/database';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import AdvancedPaymentGateway from './AdvancedPaymentGateway';

const SettingsTab = ({ instructorData, onUpdateProfile }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAdvancedPayment, setShowAdvancedPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'bank',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    iban: '',
    routingNumber: '',
    paypalEmail: '',
    vodafoneCashNumber: ''
  });
  const [formData, setFormData] = useState({
    displayName: instructorData?.displayName || currentUser?.displayName || '',
    specialization: instructorData?.specialization || '',
    bio: instructorData?.bio || '',
    phone: instructorData?.phone || '',
    location: instructorData?.location || '',
    website: instructorData?.website || '',
    linkedin: instructorData?.linkedin || '',
    twitter: instructorData?.twitter || '',
    // Notification preferences
    emailNotifications: instructorData?.preferences?.emailNotifications ?? true,
    pushNotifications: instructorData?.preferences?.pushNotifications ?? true,
    marketingEmails: instructorData?.preferences?.marketingEmails ?? false,
    courseUpdates: instructorData?.preferences?.courseUpdates ?? true,
    studentMessages: instructorData?.preferences?.studentMessages ?? true,
    // Privacy settings
    showProfile: instructorData?.privacy?.showProfile ?? true,
    showEmail: instructorData?.privacy?.showEmail ?? false,
    showPhone: instructorData?.privacy?.showPhone ?? false,
    // Withdrawal settings
    minimumWithdrawal: instructorData?.withdrawalSettings?.minimumWithdrawal ?? 100,
    autoWithdrawal: instructorData?.withdrawalSettings?.autoWithdrawal ?? false,
    withdrawalDay: instructorData?.withdrawalSettings?.withdrawalDay ?? 15
  });

  // Load payment methods and withdrawal history on component mount
  React.useEffect(() => {
    if (currentUser?.uid) {
      loadPaymentMethods();
      loadWithdrawalHistory();
      loadAvailableBalance();
    }
  }, [currentUser]);

  const loadPaymentMethods = async () => {
    try {
      const methodsRef = ref(db, `users/${currentUser.uid}/paymentMethods`);
      const snapshot = await get(methodsRef);
      if (snapshot.exists()) {
        const methods = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data
        }));
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const loadWithdrawalHistory = async () => {
    try {
      const historyRef = ref(db, `users/${currentUser.uid}/withdrawalHistory`);
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const history = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWithdrawalHistory(history);
      }
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
    }
  };

  const loadAvailableBalance = async () => {
    try {
      // Calculate available balance from earnings minus withdrawals
      const earningsRef = ref(db, `users/${currentUser.uid}/earnings`);
      const earningsSnapshot = await get(earningsRef);
      const totalEarnings = earningsSnapshot.exists() ? earningsSnapshot.val().total || 0 : 0;
      
      const withdrawalsRef = ref(db, `users/${currentUser.uid}/withdrawalHistory`);
      const withdrawalsSnapshot = await get(withdrawalsRef);
      let totalWithdrawn = 0;
      
      if (withdrawalsSnapshot.exists()) {
        const withdrawals = Object.values(withdrawalsSnapshot.val());
        totalWithdrawn = withdrawals
          .filter(w => w.status === 'completed' || w.status === 'approved')
          .reduce((sum, w) => sum + (w.amount || 0), 0);
      }
      
      const netEarnings = totalEarnings * 0.85; // After 10% platform fee + 5% tax
      const available = Math.max(0, netEarnings - totalWithdrawn);
      setAvailableBalance(available);
    } catch (error) {
      console.error('Error loading available balance:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updates = {
        displayName: formData.displayName,
        specialization: formData.specialization,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        socialMedia: {
          linkedin: formData.linkedin,
          twitter: formData.twitter
        },
        preferences: {
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          marketingEmails: formData.marketingEmails,
          courseUpdates: formData.courseUpdates,
          studentMessages: formData.studentMessages
        },
        privacy: {
          showProfile: formData.showProfile,
          showEmail: formData.showEmail,
          showPhone: formData.showPhone
        },
        withdrawalSettings: {
          minimumWithdrawal: formData.minimumWithdrawal,
          autoWithdrawal: formData.autoWithdrawal,
          withdrawalDay: formData.withdrawalDay
        },
        updatedAt: new Date().toISOString()
      };

      const userRef = ref(db, `users/${currentUser.uid}/instructorData`);
      await update(userRef, updates);

      toast.success('Settings saved successfully!');
      setIsEditing(false);
      
      if (onUpdateProfile) {
        onUpdateProfile(updates);
      }
    } catch (error) {
      toast.error('An error occurred في Save Settings');
      console.error(error);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const method = {
        ...newPaymentMethod,
        createdAt: new Date().toISOString(),
        isDefault: paymentMethods.length === 0
      };

      const methodsRef = ref(db, `users/${currentUser.uid}/paymentMethods`);
      await push(methodsRef, method);
      
      await loadPaymentMethods();
      setShowAddPaymentMethod(false);
      setNewPaymentMethod({
        type: 'bank',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        iban: '',
        routingNumber: '',
        paypalEmail: '',
        vodafoneCashNumber: ''
      });
      
      toast.success('تم Add طريقة الدفع بنجاح!');
    } catch (error) {
      toast.error('An error occurred في Add طريقة الدفع');
      console.error(error);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (window.confirm('هل أنت متأكد من Delete طريقة الدفع هذه؟')) {
      try {
        const methodRef = ref(db, `users/${currentUser.uid}/paymentMethods/${methodId}`);
        await remove(methodRef);
        await loadPaymentMethods();
        toast.success('تم Delete طريقة الدفع بنجاح!');
      } catch (error) {
        toast.error('An error occurred في Delete طريقة الدفع');
        console.error(error);
      }
    }
  };

  const handleWithdrawalRequest = async (amount) => {
    if (amount < formData.minimumWithdrawal) {
      toast.error(`Minimum للسحب هو ${formData.minimumWithdrawal} EGP`);
      return;
    }

    if (amount > availableBalance) {
      toast.error('المبلغ المطلوب أكبر من الرصيد المتاح');
      return;
    }

    if (paymentMethods.length === 0) {
      toast.error('يجب Add طريقة دفع أولاً');
      return;
    }

    try {
      const defaultMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
      
      const withdrawal = {
        amount: amount,
        status: 'pending',
        paymentMethod: defaultMethod,
        requestedAt: new Date().toISOString(),
        expectedProcessing: 'يتم المعالجة خلال 3-5 business days'
      };

      const withdrawalsRef = ref(db, `users/${currentUser.uid}/withdrawalHistory`);
      await push(withdrawalsRef, withdrawal);
      
      await loadWithdrawalHistory();
      await loadAvailableBalance();
      
      toast.success('تم تOld طلب السحب بنجاح!');
    } catch (error) {
      toast.error('An error occurred في تOld طلب السحب');
      console.error(error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      displayName: instructorData?.displayName || currentUser?.displayName || '',
      specialization: instructorData?.specialization || '',
      bio: instructorData?.bio || '',
      phone: instructorData?.phone || '',
      location: instructorData?.location || '',
      website: instructorData?.website || '',
      linkedin: instructorData?.linkedin || '',
      twitter: instructorData?.twitter || '',
      emailNotifications: instructorData?.preferences?.emailNotifications ?? true,
      pushNotifications: instructorData?.preferences?.pushNotifications ?? true,
      marketingEmails: instructorData?.preferences?.marketingEmails ?? false,
      courseUpdates: instructorData?.preferences?.courseUpdates ?? true,
      studentMessages: instructorData?.preferences?.studentMessages ?? true,
      showProfile: instructorData?.privacy?.showProfile ?? true,
      showEmail: instructorData?.privacy?.showEmail ?? false,
      showPhone: instructorData?.privacy?.showPhone ?? false,
      minimumWithdrawal: instructorData?.withdrawalSettings?.minimumWithdrawal ?? 100,
      autoWithdrawal: instructorData?.withdrawalSettings?.autoWithdrawal ?? false,
      withdrawalDay: instructorData?.withdrawalSettings?.withdrawalDay ?? 15
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">إعدادات Profile</h2>
          <div className="flex space-x-3 space-x-reverse">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-purple-200 hover:text-white transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">المScienceات الشخصية</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              <User className="w-4 h-4 inline ml-1" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.displayName || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              التخصص
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                placeholder="مثال: أستاذ Physics النووية"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.specialization || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              <Phone className="w-4 h-4 inline ml-1" />
              رقم الهاتف
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                placeholder="+20 123 456 7890"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.phone || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              <MapPin className="w-4 h-4 inline ml-1" />
              الموقع
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                placeholder="القاهرة، مصر"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.location || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            نبذة شخصية
          </label>
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows="4"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              placeholder="اكتب نبذة مختصرة عن خبراتك وتخصصك..."
            />
          ) : (
            <p className="text-white bg-white/5 px-4 py-3 rounded-xl min-h-24">
              {formData.bio || 'لم يتم Add نبذة شخصية بعد'}
            </p>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">إعدادات Notifications</h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="إشعارات Email"
            description="استقبال Notifications عبر Email"
            checked={formData.emailNotifications}
            onChange={(checked) => handleInputChange('emailNotifications', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="Notifications الinstantة"
            description="إشعارات instantة في المتصفح"
            checked={formData.pushNotifications}
            onChange={(checked) => handleInputChange('pushNotifications', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="رسائل students"
            description="إشعارات عند وصول رسائل من students"
            checked={formData.studentMessages}
            onChange={(checked) => handleInputChange('studentMessages', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="Updateات Courses"
            description="إشعارات حول Updateات وتعليقات Courses"
            checked={formData.courseUpdates}
            onChange={(checked) => handleInputChange('courseUpdates', checked)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">إعدادات الخصوصية</h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="إظهار Profile"
            description="السماح For students برؤية ملفك الشخصي"
            checked={formData.showProfile}
            onChange={(checked) => handleInputChange('showProfile', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="إظهار Email"
            description="إظهار بريدك الإلكتروني في Profile"
            checked={formData.showEmail}
            onChange={(checked) => handleInputChange('showEmail', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="إظهار رقم الهاتف"
            description="إظهار رقم هاتفك في Profile"
            checked={formData.showPhone}
            onChange={(checked) => handleInputChange('showPhone', checked)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Withdrawal Management */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <DollarSign className="w-5 h-5 ml-2" />
          إدارة السحب وEarnings
        </h3>
        
        {/* Available Balance */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-xl p-4">
            <h4 className="text-green-300 text-sm font-medium">الرصيد المتاح للسحب</h4>
            <p className="text-white font-bold text-2xl">{availableBalance.toLocaleString()} EGP</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 rounded-xl p-4">
            <h4 className="text-blue-300 text-sm font-medium">Minimum للسحب</h4>
            <p className="text-white font-bold text-2xl">{formData.minimumWithdrawal} EGP</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 rounded-xl p-4">
            <h4 className="text-purple-300 text-sm font-medium">طلبات السحب الSuspendedة</h4>
            <p className="text-white font-bold text-2xl">
              {withdrawalHistory.filter(w => w.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Quick Withdrawal */}
        {availableBalance >= formData.minimumWithdrawal && paymentMethods.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-3">سحب سريع</h4>
            <div className="flex gap-3">
              <button
                onClick={() => handleWithdrawalRequest(Math.floor(availableBalance * 0.25))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                25% ({Math.floor(availableBalance * 0.25)} EGP)
              </button>
              <button
                onClick={() => handleWithdrawalRequest(Math.floor(availableBalance * 0.5))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                50% ({Math.floor(availableBalance * 0.5)} EGP)
              </button>
              <button
                onClick={() => handleWithdrawalRequest(Math.floor(availableBalance * 0.75))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                75% ({Math.floor(availableBalance * 0.75)} EGP)
              </button>
              <button
                onClick={() => handleWithdrawalRequest(availableBalance)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                All ({availableBalance.toLocaleString()} EGP)
              </button>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">طرق الدفع</h4>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-4 h-4" />
              <span>Add طريقة دفع</span>
            </button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="bg-white/5 rounded-lg p-6 text-center">
              <CreditCard className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-200">لم تتم Add أي طريقة دفع بعد</p>
              <p className="text-purple-300 text-sm">أضف طريقة دفع لتتمكن من سحب Earnings</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  onDelete={handleDeletePaymentMethod}
                />
              ))}
            </div>
          )}
        </div>

        {/* Advanced Payment Gateway */}
        <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-400/50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold text-lg flex items-center">
                <Zap className="w-5 h-5 ml-2 text-yellow-400" />
                نظام الدفع المتطور
              </h4>
              <p className="text-purple-200 text-sm mt-1">
                بوابات دفع حقيقية • تقارير ضريبية تلقائية • إشعارات Email
              </p>
              <div className="flex items-center space-x-4 space-x-reverse mt-3 text-xs">
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">✓ Stripe & PayPal</span>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">✓ instant وVodafone Cash</span>
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">✓ تقارير PDF & Excel</span>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedPayment(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              <span>Open النظام المتطور</span>
            </button>
          </div>
        </div>

        {/* Withdrawal Settings */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">إعدادات السحب</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">
                Minimum للسحب (EGP)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={formData.minimumWithdrawal}
                  onChange={(e) => handleInputChange('minimumWithdrawal', parseInt(e.target.value) || 100)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                />
              ) : (
                <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.minimumWithdrawal} EGP</p>
              )}
            </div>

            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">
                يوم السحب التلقائي
              </label>
              {isEditing ? (
                <select
                  value={formData.withdrawalDay}
                  onChange={(e) => handleInputChange('withdrawalDay', parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                >
                  {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>يوم {day}</option>
                  ))}
                </select>
              ) : (
                <p className="text-white bg-white/5 px-4 py-3 rounded-xl">يوم {formData.withdrawalDay}</p>
              )}
            </div>
          </div>
          
          <NotificationToggle
            label="السحب التلقائي"
            description="سحب Earnings تلقائياً في تاريخ محدد كل شهر"
            checked={formData.autoWithdrawal}
            onChange={(checked) => handleInputChange('autoWithdrawal', checked)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">سجل عمليات السحب</h3>
        
        {withdrawalHistory.length === 0 ? (
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-purple-200">لا توجد عمليات سحب بعد</p>
            <p className="text-purple-300 text-sm">ستظهر هنا جميع طلبات السحب السابقة والحالية</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawalHistory.slice(0, 10).map((withdrawal) => (
              <WithdrawalHistoryItem key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-white/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Add طريقة دفع</h3>
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-2">نوع الدفع</label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="bank">حساب بنكي</option>
                  <option value="paypal">PayPal</option>
                  <option value="vodafone">Vodafone Cash</option>
                </select>
              </div>

              {newPaymentMethod.type === 'bank' && (
                <>
                  <div>
                    <label className="block text-purple-200 text-sm font-semibold mb-2">اسم البنك</label>
                    <input
                      type="text"
                      value={newPaymentMethod.bankName}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                      placeholder="البنك الأهلي المصري"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-semibold mb-2">رقم الحساب</label>
                    <input
                      type="text"
                      value={newPaymentMethod.accountNumber}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountNumber: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-semibold mb-2">اسم صاحب الحساب</label>
                    <input
                      type="text"
                      value={newPaymentMethod.accountHolderName}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountHolderName: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                      placeholder="Ahmed Mohamed Ali"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-semibold mb-2">IBAN (اختياري)</label>
                    <input
                      type="text"
                      value={newPaymentMethod.iban}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, iban: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                      placeholder="EG123456789012345678901234"
                    />
                  </div>
                </>
              )}

              {newPaymentMethod.type === 'paypal' && (
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">بريد PayPal الإلكتروني</label>
                  <input
                    type="email"
                    value={newPaymentMethod.paypalEmail}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, paypalEmail: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {newPaymentMethod.type === 'vodafone' && (
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">رقم Vodafone Cash</label>
                  <input
                    type="tel"
                    value={newPaymentMethod.vodafoneCashNumber}
                    onChange={(e) => setNewPaymentMethod({...newPaymentMethod, vodafoneCashNumber: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                    placeholder="01234567890"
                  />
                </div>
              )}

              <div className="flex space-x-3 space-x-reverse pt-4">
                <button
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Payment Gateway Modal */}
      {showAdvancedPayment && (
        <AdvancedPaymentGateway
          instructorData={instructorData}
          onClose={() => setShowAdvancedPayment(false)}
        />
      )}
    </div>
  );
};

const NotificationToggle = ({ label, description, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
    <div>
      <h4 className="text-white font-medium">{label}</h4>
      <p className="text-purple-200 text-sm">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`
        relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer 
        ${checked ? 'peer-checked:bg-blue-600' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
      `}></div>
    </label>
  </div>
);

const PaymentMethodCard = ({ method, onDelete }) => {
  const getMethodIcon = () => {
    switch (method.type) {
      case 'bank':
        return <Building className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      case 'vodafone':
        return <Phone className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodDetails = () => {
    switch (method.type) {
      case 'bank':
        return (
          <div>
            <p className="text-white font-medium">{method.bankName}</p>
            <p className="text-purple-200 text-sm">حساب: ****{method.accountNumber?.slice(-4)}</p>
            <p className="text-purple-300 text-xs">{method.accountHolderName}</p>
          </div>
        );
      case 'paypal':
        return (
          <div>
            <p className="text-white font-medium">PayPal</p>
            <p className="text-purple-200 text-sm">{method.paypalEmail}</p>
          </div>
        );
      case 'vodafone':
        return (
          <div>
            <p className="text-white font-medium">Vodafone Cash</p>
            <p className="text-purple-200 text-sm">{method.vodafoneCashNumber}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
          {getMethodIcon()}
        </div>
        {getMethodDetails()}
        {method.isDefault && (
          <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">افتراضي</span>
        )}
      </div>
      <button
        onClick={() => onDelete(method.id)}
        className="text-red-400 hover:text-red-300 p-2"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const WithdrawalHistoryItem = ({ withdrawal }) => {
  const getStatusIcon = () => {
    switch (withdrawal.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusText = () => {
    switch (withdrawal.status) {
      case 'pending':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'فشل';
      case 'approved':
        return 'معتمد';
      default:
        return 'Not specified';
    }
  };

  const getStatusColor = () => {
    switch (withdrawal.status) {
      case 'pending':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'approved':
        return 'text-blue-400';
      default:
        return 'text-purple-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div className="flex items-center space-x-3 space-x-reverse">
        {getStatusIcon()}
        <div>
          <p className="text-white font-medium">{withdrawal.amount?.toLocaleString()} EGP</p>
          <p className="text-purple-200 text-sm">
            {new Date(withdrawal.requestedAt).toLocaleDateString('ar-EG')}
          </p>
          {withdrawal.expectedProcessing && (
            <p className="text-purple-300 text-xs">{withdrawal.expectedProcessing}</p>
          )}
        </div>
      </div>
      <div className="text-left">
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {withdrawal.paymentMethod && (
          <p className="text-purple-300 text-xs">
            {withdrawal.paymentMethod.type === 'bank' ? withdrawal.paymentMethod.bankName : 
             withdrawal.paymentMethod.type === 'paypal' ? 'PayPal' : 'Vodafone Cash'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;