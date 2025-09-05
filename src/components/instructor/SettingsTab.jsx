import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, update } from 'firebase/database';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const SettingsTab = ({ instructorData, onUpdateProfile }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
  });

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
        updatedAt: new Date().toISOString()
      };

      const userRef = ref(db, `users/${currentUser.uid}/instructorData`);
      await update(userRef, updates);

      toast.success('تم حفظ الإعدادات بنجاح!');
      setIsEditing(false);
      
      if (onUpdateProfile) {
        onUpdateProfile(updates);
      }
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات');
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
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">إعدادات الملف الشخصي</h2>
          <div className="flex space-x-3 space-x-reverse">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-purple-200 hover:text-white transition-colors flex items-center space-x-2 space-x-reverse"
                >
                  <X className="w-4 h-4" />
                  <span>إلغاء</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold flex items-center space-x-2 space-x-reverse transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>تعديل</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">المعلومات الشخصية</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              <User className="w-4 h-4 inline ml-1" />
              الاسم الكامل
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.displayName || 'غير محدد'}</p>
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
                placeholder="مثال: أستاذ الفيزياء النووية"
              />
            ) : (
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.specialization || 'غير محدد'}</p>
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
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.phone || 'غير محدد'}</p>
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
              <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.location || 'غير محدد'}</p>
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
              {formData.bio || 'لم يتم إضافة نبذة شخصية بعد'}
            </p>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">إعدادات الإشعارات</h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="إشعارات البريد الإلكتروني"
            description="استقبال الإشعارات عبر البريد الإلكتروني"
            checked={formData.emailNotifications}
            onChange={(checked) => handleInputChange('emailNotifications', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="الإشعارات الفورية"
            description="إشعارات فورية في المتصفح"
            checked={formData.pushNotifications}
            onChange={(checked) => handleInputChange('pushNotifications', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="رسائل الطلاب"
            description="إشعارات عند وصول رسائل من الطلاب"
            checked={formData.studentMessages}
            onChange={(checked) => handleInputChange('studentMessages', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="تحديثات الكورسات"
            description="إشعارات حول تحديثات وتعليقات الكورسات"
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
            label="إظهار الملف الشخصي"
            description="السماح للطلاب برؤية ملفك الشخصي"
            checked={formData.showProfile}
            onChange={(checked) => handleInputChange('showProfile', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="إظهار البريد الإلكتروني"
            description="إظهار بريدك الإلكتروني في الملف الشخصي"
            checked={formData.showEmail}
            onChange={(checked) => handleInputChange('showEmail', checked)}
            disabled={!isEditing}
          />
          
          <NotificationToggle
            label="إظهار رقم الهاتف"
            description="إظهار رقم هاتفك في الملف الشخصي"
            checked={formData.showPhone}
            onChange={(checked) => handleInputChange('showPhone', checked)}
            disabled={!isEditing}
          />
        </div>
      </div>
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

export default SettingsTab;