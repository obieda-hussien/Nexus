import React, { useState } from 'react';
import { Plus, ChevronRight, BookOpen, Edit3, Trash2, Move, Youtube, ExternalLink, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import MarkdownEditor from './MarkdownEditor';

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
      // Validate authentication
      if (!currentUser) {
        toast.error('يجب تسجيل الدخول أولاً لإنشاء كورس');
        console.error('❌ No authenticated user found');
        return;
      }

      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category) {
        toast.error('يرجى ملء جميع الحقول المطلوبة');
        console.error('❌ Missing required fields:', {
          title: !!courseData.title,
          description: !!courseData.description,
          category: !!courseData.category
        });
        return;
      }

      // Log the data being submitted for debugging
      console.log('🚀 Creating course with data:', {
        title: courseData.title,
        category: courseData.category,
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName,
        sectionsCount: courseData.curriculum?.sections?.length || 0
      });

      const courseRef = push(ref(db, 'courses'));
      
      const courseDataToSave = {
        ...courseData,
        id: courseRef.key,
        instructorId: currentUser.uid,
        instructorName: currentUser.displayName || 'مدرس',
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
      };

      console.log('💾 Saving to Firebase with ID:', courseRef.key);
      
      await set(courseRef, courseDataToSave);

      console.log('✅ Course created successfully with ID:', courseRef.key);
      toast.success('تم إنشاء الكورس بنجاح!');
      onCourseCreated();
    } catch (error) {
      console.error('❌ Error creating course:', error);
      
      // Provide more specific error messages
      let errorMessage = 'حدث خطأ في إنشاء الكورس';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'ليس لديك الصلاحية لإنشاء كورس. تحقق من إعدادات قاعدة البيانات';
        console.error('💡 Troubleshooting: Check Firebase Realtime Database security rules');
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'خطأ في الشبكة. تحقق من اتصالك بالإنترنت';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'يجب إعادة تسجيل الدخول للمتابعة';
      } else if (error.message) {
        errorMessage = `خطأ: ${error.message}`;
      }
      
      toast.error(errorMessage);
      console.error('📋 Error details:', {
        code: error.code,
        message: error.message,
        authUser: !!currentUser,
        userId: currentUser?.uid
      });
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

// Enhanced Curriculum Step with proper module and lesson management
const CurriculumStep = ({ curriculum, onChange, onNext, onBack }) => {
  const [sections, setSections] = useState(curriculum?.sections || []);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const addSection = () => {
    if (!newSectionTitle.trim()) {
      toast.error('يرجى إدخال عنوان الوحدة');
      return;
    }

    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle,
      order: sections.length + 1,
      lessons: [],
      isExpanded: true
    };

    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    onChange({ sections: updatedSections });
    setNewSectionTitle('');
    setShowAddSection(false);
    toast.success('تم إضافة الوحدة بنجاح');
  };

  const updateSection = (sectionId, updates) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    setSections(updatedSections);
    onChange({ sections: updatedSections });
  };

  const deleteSection = (sectionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return;
    
    const updatedSections = sections.filter(section => section.id !== sectionId);
    setSections(updatedSections);
    onChange({ sections: updatedSections });
    toast.success('تم حذف الوحدة');
  };

  const addLesson = (sectionId) => {
    const newLesson = {
      id: Date.now().toString(),
      title: '',
      type: 'article', // article, video, quiz
      content: '',
      videoUrl: '',
      duration: 0,
      order: 0,
      isPublished: false
    };

    updateSection(sectionId, {
      lessons: [...(sections.find(s => s.id === sectionId)?.lessons || []), newLesson]
    });
  };

  const updateLesson = (sectionId, lessonId, updates) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedLessons = section.lessons.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    );

    updateSection(sectionId, { lessons: updatedLessons });
  };

  const deleteLesson = (sectionId, lessonId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedLessons = section.lessons.filter(lesson => lesson.id !== lessonId);
    updateSection(sectionId, { lessons: updatedLessons });
    toast.success('تم حذف الدرس');
  };

  const toggleSectionExpansion = (sectionId) => {
    updateSection(sectionId, {
      isExpanded: !sections.find(s => s.id === sectionId)?.isExpanded
    });
  };

  const handleNext = () => {
    if (sections.length === 0) {
      toast.error('يرجى إضافة وحدة واحدة على الأقل');
      return;
    }

    const hasEmptyLessons = sections.some(section => 
      section.lessons.some(lesson => !lesson.title.trim())
    );

    if (hasEmptyLessons) {
      toast.error('يرجى إكمال جميع عناوين الدروس');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">منهج الكورس</h3>
        <button
          onClick={() => setShowAddSection(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وحدة</span>
        </button>
      </div>

      {/* Add Section Form */}
      {showAddSection && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex space-x-3 space-x-reverse">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="عنوان الوحدة الجديدة"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              onKeyPress={(e) => e.key === 'Enter' && addSection()}
            />
            <button
              onClick={addSection}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              إضافة
            </button>
            <button
              onClick={() => {
                setShowAddSection(false);
                setNewSectionTitle('');
              }}
              className="text-purple-200 hover:text-white px-4 py-2"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-200">لم تقم بإضافة أي وحدات بعد</p>
          <p className="text-purple-300 text-sm">ابدأ بإضافة الوحدة الأولى لكورسك</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <SectionCard
              key={section.id}
              section={section}
              sectionIndex={sectionIndex}
              onUpdate={(updates) => updateSection(section.id, updates)}
              onDelete={() => deleteSection(section.id)}
              onToggleExpansion={() => toggleSectionExpansion(section.id)}
              onAddLesson={() => addLesson(section.id)}
              onUpdateLesson={(lessonId, updates) => updateLesson(section.id, lessonId, updates)}
              onDeleteLesson={(lessonId) => deleteLesson(section.id, lessonId)}
            />
          ))}
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
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          التالي: التسعير
        </button>
      </div>
    </div>
  );
};

// Section Card Component
const SectionCard = ({ 
  section, 
  sectionIndex, 
  onUpdate, 
  onDelete, 
  onToggleExpansion, 
  onAddLesson, 
  onUpdateLesson, 
  onDeleteLesson 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);

  const handleTitleSave = () => {
    if (!editTitle.trim()) {
      toast.error('عنوان الوحدة مطلوب');
      return;
    }
    onUpdate({ title: editTitle });
    setIsEditing(false);
    toast.success('تم تحديث عنوان الوحدة');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse flex-1">
          <button
            onClick={onToggleExpansion}
            className="text-purple-200 hover:text-white"
          >
            {section.isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
            {sectionIndex + 1}
          </div>

          {isEditing ? (
            <div className="flex space-x-2 space-x-reverse flex-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
              />
              <button
                onClick={handleTitleSave}
                className="text-green-400 hover:text-green-300"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(section.title);
                }}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          ) : (
            <h4 className="text-white font-semibold flex-1">{section.title}</h4>
          )}
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-purple-200 text-sm">
            {section.lessons?.length || 0} درس
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-purple-200 hover:text-white p-1"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      {section.isExpanded && (
        <div className="space-y-3">
          {/* Lessons */}
          {section.lessons?.map((lesson, lessonIndex) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              lessonIndex={lessonIndex}
              onUpdate={(updates) => onUpdateLesson(lesson.id, updates)}
              onDelete={() => onDeleteLesson(lesson.id)}
            />
          ))}

          {/* Add Lesson Button */}
          <button
            onClick={onAddLesson}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-purple-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة درس جديد</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Lesson Card Component  
const LessonCard = ({ lesson, lessonIndex, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!lesson.title); // Auto-edit for new lessons
  const [formData, setFormData] = useState({
    title: lesson.title,
    type: lesson.type || 'article',
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || '',
    duration: lesson.duration || 0
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('عنوان الدرس مطلوب');
      return;
    }

    if (formData.type === 'video' && !formData.videoUrl.trim()) {
      toast.error('رابط الفيديو مطلوب');
      return;
    }

    onUpdate(formData);
    setIsEditing(false);
    toast.success('تم حفظ الدرس');
  };

  const handleCancel = () => {
    if (!lesson.title) {
      onDelete(); // Delete if it's a new lesson that was cancelled
    } else {
      setFormData({
        title: lesson.title,
        type: lesson.type || 'article',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0
      });
      setIsEditing(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Youtube className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'فيديو';
      case 'article':
        return 'مقال';
      default:
        return 'مقال';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      {isEditing ? (
        <div className="space-y-3">
          {/* Lesson Title */}
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="عنوان الدرس"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />

          {/* Lesson Type */}
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="article">مقال</option>
            <option value="video">فيديو</option>
          </select>

          {/* Content based on type */}
          {formData.type === 'article' ? (
            <div>
              <label className="block text-purple-200 text-sm font-semibold mb-2">
                محتوى المقال (يدعم Markdown)
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="اكتب محتوى المقال باستخدام Markdown...

مثال:
# عنوان رئيسي
## عنوان فرعي

هذا **نص مهم** وهذا *نص مائل*.

- النقطة الأولى
- النقطة الثانية

> هذا اقتباس مهم

```javascript
console.log('مرحباً بالعالم');
```

[رابط مفيد](https://example.com)"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="رابط الفيديو (YouTube أو رابط مباشر)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              />
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="مدة الفيديو (بالدقائق)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Save/Cancel Buttons */}
          <div className="flex space-x-2 space-x-reverse justify-end">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
            >
              حفظ
            </button>
            <button
              onClick={handleCancel}
              className="text-purple-200 hover:text-white px-3 py-1"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-purple-300">
              {lessonIndex + 1}.
            </div>
            <div className="text-purple-200">
              {getTypeIcon(lesson.type)}
            </div>
            <div>
              <h5 className="text-white font-medium">{lesson.title}</h5>
              <p className="text-purple-300 text-sm">
                {getTypeLabel(lesson.type)}
                {lesson.type === 'video' && lesson.duration > 0 && ` • ${lesson.duration} دقيقة`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            {lesson.videoUrl && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200 hover:text-white p-1"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-purple-200 hover:text-white p-1"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
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