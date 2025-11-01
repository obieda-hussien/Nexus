import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Star,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ref, set, push, update } from 'firebase/database';
import { db } from '../config/firebase';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const InstructorApplicationPage = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Check if this is a standalone page or modal
  const isStandalonePage = !isOpen && !onClose;
  
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    
    // Professional Information
    profession: '',
    experience: '',
    qualifications: '',
    expertise: [],
    languages: [],
    
    // Teaching Information
    teachingExperience: '',
    subjects: '',
    teachingStyle: '',
    availability: '',
    
    // Documents
    cv: '',
    certificates: '',
    portfolio: '',
    
    // Additional
    motivation: '',
    expectations: '',
    references: ''
  });
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || currentUser.email || '',
        phone: userProfile.phone || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        country: userProfile.country || '',
        bio: userProfile.bio || ''
      }));
    }
  }, [currentUser, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, value, action = 'add') => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      
      if (action === 'add') {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else if (action === 'remove') {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
      
      return prev;
    });
  };

  const handleFileUpload = (field, file) => {
    // In a real app, you'd upload the file to a storage service
    // For demo purposes, we'll just store the filename
    setFormData(prev => ({
      ...prev,
      [field]: file.name
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.profession && formData.experience && formData.qualifications;
      case 3:
        return formData.teachingExperience && formData.subjects && formData.motivation;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);

    try {
      // Save to Firebase
      const applicationsRef = ref(db, 'instructorApplications');
      const newApplicationRef = push(applicationsRef);
      
      await set(newApplicationRef, {
        ...formData,
        userId: currentUser.uid,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        id: newApplicationRef.key
      });

      toast.success('تم إرسال طلب الانضمام بنجاح! سيتم مراجعته قريباً.');
      
      // Close modal or redirect
      if (isStandalonePage) {
        navigate('/');
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <GraduationCap className="w-16 h-16 mx-auto text-neon-blue mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">المعلومات الشخصية</h3>
        <p className="text-gray-400">لنبدأ بمعلوماتك الأساسية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            الاسم الأول *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            placeholder="أدخل اسمك الأول"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            اسم العائلة *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            placeholder="أدخل اسم العائلة"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            البريد الإلكتروني *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            رقم الهاتف *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            placeholder="+20 123 456 7890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            تاريخ الميلاد
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            المدينة
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
            placeholder="القاهرة"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          العنوان
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
          placeholder="شارع المثال، الرقم، الحي"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          نبذة شخصية
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent"
          placeholder="اكتب نبذة مختصرة عنك وخبراتك..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Award className="w-16 h-16 mx-auto text-neon-purple mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">الخبرة المهنية</h3>
        <p className="text-gray-400">أخبرنا عن خبراتك ومؤهلاتك</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          التخصص المهني *
        </label>
        <input
          type="text"
          name="profession"
          value={formData.profession}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent"
          placeholder="مطور برمجيات، مهندس، طبيب، إلخ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          سنوات الخبرة *
        </label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent"
        >
          <option value="">اختر سنوات الخبرة</option>
          <option value="1-2">1-2 سنة</option>
          <option value="3-5">3-5 سنوات</option>
          <option value="6-10">6-10 سنوات</option>
          <option value="10+">أكثر من 10 سنوات</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          المؤهلات العلمية *
        </label>
        <textarea
          name="qualifications"
          value={formData.qualifications}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent"
          placeholder="البكالوريوس في الهندسة، ماجستير في علوم الحاسوب، شهادات مهنية..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Star className="w-4 h-4 inline mr-2" />
          مجالات الخبرة
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['البرمجة', 'التصميم', 'التسويق', 'إدارة الأعمال', 'اللغات', 'العلوم', 'الطب', 'الهندسة', 'الفنون'].map((skill) => (
            <label key={skill} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.expertise.includes(skill)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleArrayChange('expertise', skill, 'add');
                  } else {
                    handleArrayChange('expertise', skill, 'remove');
                  }
                }}
                className="rounded border-gray-600 bg-gray-800 text-neon-purple focus:ring-neon-purple"
              />
              <span className="text-sm text-gray-300">{skill}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BookOpen className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">الخبرة التدريسية</h3>
        <p className="text-gray-400">أخبرنا عن خبرتك في التدريس</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Users className="w-4 h-4 inline mr-2" />
          خبرة التدريس *
        </label>
        <textarea
          name="teachingExperience"
          value={formData.teachingExperience}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
          placeholder="قم بوصف خبرتك في التدريس، الدورات التي درستها، عدد الطلاب..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <BookOpen className="w-4 h-4 inline mr-2" />
          المواد التي تريد تدريسها *
        </label>
        <input
          type="text"
          name="subjects"
          value={formData.subjects}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
          placeholder="JavaScript, React, Python, التصميم الجرافيكي..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <TrendingUp className="w-4 h-4 inline mr-2" />
          أسلوب التدريس المفضل
        </label>
        <textarea
          name="teachingStyle"
          value={formData.teachingStyle}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
          placeholder="كيف تفضل تدريس الطلاب؟ (مشاريع عملية، شرائح، تطبيقات عملية...)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          التوفر
        </label>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
        >
          <option value="">اختر أوقات التوفر</option>
          <option value="weekdays-morning">أيام الأسبوع - الصباح</option>
          <option value="weekdays-evening">أيام الأسبوع - المساء</option>
          <option value="weekends">عطلة نهاية الأسبوع</option>
          <option value="flexible">مرن</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          لماذا تريد الانضمام كمدرب؟ *
        </label>
        <textarea
          name="motivation"
          value={formData.motivation}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
          placeholder="ما الذي يحفزك لتعليم الآخرين؟"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Star className="w-4 h-4 inline mr-2" />
          ما تتوقعه من منصة Nexus
        </label>
        <textarea
          name="expectations"
          value={formData.expectations}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-400 focus:border-transparent"
          placeholder="ما الذي تتوقعه من المنصة؟"
        />
      </div>
    </div>
  );

  const renderApplicationContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <GraduationCap className="w-20 h-20 mx-auto text-neon-blue mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">انضم كمدرب في Nexus</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          شارك خبراتك وعلم الآخرين من خلال منصتنا التعليمية المتقدمة
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">الخطوة {step} من 3</span>
          <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}% مكتمل</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-neon-blue to-neon-purple h-3 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>السابق</span>
            </Button>
          )}
        </div>
        
        <div className="space-x-3">
          {isStandalonePage && (
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              إلغاء
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              variant="gradient"
              onClick={handleNext}
              disabled={!validateStep(step)}
              className="flex items-center space-x-2"
            >
              <span>التالي</span>
              <ArrowLeft size={16} className="rotate-180" />
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={handleSubmit}
              disabled={submitting || !validateStep(step)}
              className="flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>إرسال الطلب</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Standalone page mode
  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {renderApplicationContent()}
          </div>
        </div>
      </div>
    );
  }

  // Modal mode
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-secondary-bg rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white">انضم كمدرب</h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">الخطوة {step} من 3</span>
                <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}% مكتمل</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="min-h-[400px] max-h-[60vh] overflow-y-auto">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                {step > 1 && (
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    <span>السابق</span>
                  </Button>
                )}
              </div>
              
              <div className="space-x-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  إلغاء
                </Button>
                
                {step < 3 ? (
                  <Button
                    variant="gradient"
                    onClick={handleNext}
                    disabled={!validateStep(step)}
                    className="flex items-center space-x-2"
                  >
                    <span>التالي</span>
                    <ArrowLeft size={16} className="rotate-180" />
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    onClick={handleSubmit}
                    disabled={submitting || !validateStep(step)}
                    className="flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>إرسال الطلب</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstructorApplicationPage;