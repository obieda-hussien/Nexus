import React, { useState } from 'react';
import { Plus, ChevronRight, BookOpen } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateCourseTab = ({ onCourseCreated, onCancel }) => {
  const [step, setStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    level: 'beginner',
    language: 'ar',
    price: 0,
    isFree: true,
    thumbnail: '',
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
    curriculum: {}
  });

  const { currentUser } = useAuth();

  const handleSubmit = async () => {
    try {
      const courseRef = push(ref(db, 'courses'));
      
      await set(courseRef, {
        ...courseData,
        id: courseRef.key,
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName,
        instructorAvatar: currentUser.photoURL || '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentsCount: 0,
        rating: 0,
        reviewsCount: 0,
        salesCount: 0,
        totalRevenue: 0,
        isActive: false
      });

      toast.success('تم إنشاء الكورس بنجاح!');
      onCourseCreated();
    } catch (error) {
      toast.error('حدث خطأ في إنشاء الكورس');
      console.error(error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">إنشاء كورس جديد</h2>
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-purple-200 hover:text-white transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <CourseCreationSteps currentStep={step} />

      {/* Step Content */}
      <div className="mt-8">
        {step === 1 && (
          <BasicInfoStep 
            data={courseData}
            onChange={setCourseData}
            onNext={() => setStep(2)}
          />
        )}
        
        {step === 2 && (
          <CurriculumStep
            curriculum={courseData.curriculum}
            onChange={(curriculum) => setCourseData(prev => ({...prev, curriculum}))}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        
        {step === 3 && (
          <PricingStep
            data={courseData}
            onChange={setCourseData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        
        {step === 4 && (
          <ReviewStep
            data={courseData}
            onSubmit={handleSubmit}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
};

const CourseCreationSteps = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'المعلومات الأساسية' },
    { id: 2, title: 'المنهج' },
    { id: 3, title: 'التسعير' },
    { id: 4, title: 'المراجعة والنشر' }
  ];

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${currentStep >= step.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-600 text-gray-300'
              }
            `}>
              {step.id}
            </div>
            <span className={`mr-3 ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight className="text-gray-400 w-5 h-5" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Basic Info Step Component
const BasicInfoStep = ({ data, onChange, onNext }) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
    onChange({...formData, [field]: value});
  };

  const handleNext = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            عنوان الكورس *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
            placeholder="مثال: أساسيات الفيزياء الحديثة"
          />
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            التصنيف *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="">اختر التصنيف</option>
            <option value="physics">الفيزياء</option>
            <option value="math">الرياضيات</option>
            <option value="chemistry">الكيمياء</option>
            <option value="biology">الأحياء</option>
            <option value="programming">البرمجة</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-purple-200 text-sm font-semibold mb-2">
          وصف مختصر *
        </label>
        <input
          type="text"
          value={formData.shortDescription}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          placeholder="وصف قصير يلخص محتوى الكورس في سطر واحد"
          maxLength="120"
        />
      </div>

      <div>
        <label className="block text-purple-200 text-sm font-semibold mb-2">
          الوصف التفصيلي *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows="6"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          placeholder="اكتب وصفاً مفصلاً عن الكورس، ما سيتعلمه الطلاب، والفوائد المتوقعة..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            المستوى
          </label>
          <select
            value={formData.level}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="beginner">مبتدئ</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">متقدم</option>
          </select>
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            اللغة
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="ar">العربية</option>
            <option value="en">الإنجليزية</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          التالي: المنهج
        </button>
      </div>
    </div>
  );
};

// Simplified Curriculum Step for initial implementation
const CurriculumStep = ({ curriculum, onChange, onNext, onBack }) => {
  const [sections, setSections] = useState([]);

  const addSection = () => {
    const newSection = {
      id: Date.now().toString(),
      title: '',
      order: sections.length + 1,
      lessons: []
    };
    setSections([...sections, newSection]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">منهج الكورس</h3>
        <button
          onClick={addSection}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وحدة</span>
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-200">لم تقم بإضافة أي وحدات بعد</p>
          <p className="text-purple-300 text-sm">ابدأ بإضافة الوحدة الأولى لكورسك</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-purple-200 hover:text-white transition-colors"
        >
          السابق
        </button>
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          التالي: التسعير
        </button>
      </div>
    </div>
  );
};

// Pricing Step
const PricingStep = ({ data, onChange, onNext, onBack }) => {
  const handlePriceChange = (field, value) => {
    onChange(prev => ({...prev, [field]: value}));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">تسعير الكورس</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="isFree"
            checked={data.isFree}
            onChange={(e) => handlePriceChange('isFree', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isFree" className="text-white font-medium">
            كورس مجاني
          </label>
        </div>

        {!data.isFree && (
          <div>
            <label className="block text-purple-200 text-sm font-semibold mb-2">
              السعر (بالجنيه المصري)
            </label>
            <input
              type="number"
              value={data.price}
              onChange={(e) => handlePriceChange('price', Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              placeholder="مثال: 500"
              min="0"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-purple-200 hover:text-white transition-colors"
        >
          السابق
        </button>
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          التالي: المراجعة
        </button>
      </div>
    </div>
  );
};

// Review Step
const ReviewStep = ({ data, onSubmit, onBack }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">مراجعة معلومات الكورس</h3>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <h4 className="text-purple-200 text-sm">عنوان الكورس</h4>
          <p className="text-white font-medium">{data.title}</p>
        </div>
        
        <div>
          <h4 className="text-purple-200 text-sm">التصنيف</h4>
          <p className="text-white">{data.category}</p>
        </div>
        
        <div>
          <h4 className="text-purple-200 text-sm">المستوى</h4>
          <p className="text-white">
            {data.level === 'beginner' ? 'مبتدئ' : 
             data.level === 'intermediate' ? 'متوسط' : 'متقدم'}
          </p>
        </div>
        
        <div>
          <h4 className="text-purple-200 text-sm">السعر</h4>
          <p className="text-white">
            {data.isFree ? 'مجاني' : `${data.price} جنيه`}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-purple-200 hover:text-white transition-colors"
        >
          السابق
        </button>
        <button
          onClick={onSubmit}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          إنشاء الكورس
        </button>
      </div>
    </div>
  );
};

export default CreateCourseTab;