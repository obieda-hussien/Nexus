import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3, Trash2, Youtube, FileText, ExternalLink, ChevronDown, ChevronUp, Move } from 'lucide-react';
import { ref, update, remove } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import MarkdownEditor from './MarkdownEditor';

const EditCourseModal = ({ course, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [courseData, setCourseData] = useState(course);
  const [sections, setSections] = useState(course?.curriculum?.sections || []);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (course) {
      setCourseData(course);
      setSections(course?.curriculum?.sections || []);
    }
  }, [course]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedCourse = {
        ...courseData,
        curriculum: { sections },
        updatedAt: new Date().toISOString()
      };

      await update(ref(db, `courses/${course.id}`), updatedCourse);
      toast.success('تم تحديث الكورس بنجاح');
      onUpdate(updatedCourse);
      onClose();
    } catch (error) {
      toast.error('حدث خطأ في تحديث الكورس');
      console.error(error);
    }
    setIsLoading(false);
  };

  const updateCourseField = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">تعديل الكورس: {course?.title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex space-x-0 space-x-reverse">
            {[
              { id: 'basic', label: 'المعلومات الأساسية' },
              { id: 'curriculum', label: 'المنهج والوحدات' },
              { id: 'settings', label: 'الإعدادات' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'basic' && (
            <BasicInfoTab 
              data={courseData} 
              onChange={updateCourseField} 
            />
          )}
          
          {activeTab === 'curriculum' && (
            <CurriculumTab
              sections={sections}
              setSections={setSections}
              courseId={course?.id}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsTab 
              data={courseData} 
              onChange={updateCourseField} 
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BasicInfoTab = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">المعلومات الأساسية</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            عنوان الكورس *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            التصنيف *
          </label>
          <select
            value={data.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
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
          value={data.shortDescription || ''}
          onChange={(e) => onChange('shortDescription', e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
          maxLength="120"
        />
      </div>

      <div>
        <label className="block text-purple-200 text-sm font-semibold mb-2">
          الوصف التفصيلي *
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows="6"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            المستوى
          </label>
          <select
            value={data.level || 'beginner'}
            onChange={(e) => onChange('level', e.target.value)}
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
            value={data.language || 'ar'}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="ar">العربية</option>
            <option value="en">الإنجليزية</option>
          </select>
        </div>

        <div>
          <label className="block text-purple-200 text-sm font-semibold mb-2">
            الحالة
          </label>
          <select
            value={data.status || 'draft'}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="draft">مسودة</option>
            <option value="pending">في المراجعة</option>
            <option value="published">منشور</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const CurriculumTab = ({ sections, setSections, courseId }) => {
  const [showAddSection, setShowAddSection] = useState(false);
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

    setSections([...sections, newSection]);
    setNewSectionTitle('');
    setShowAddSection(false);
    toast.success('تم إضافة الوحدة بنجاح');
  };

  const updateSection = (sectionId, updates) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الوحدة؟')) return;
    
    setSections(sections.filter(section => section.id !== sectionId));
    toast.success('تم حذف الوحدة');
  };

  const addLesson = (sectionId) => {
    const newLesson = {
      id: Date.now().toString(),
      title: '',
      type: 'article',
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

      {/* Course Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{sections.length}</p>
          <p className="text-purple-200">وحدة</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {sections.reduce((total, section) => total + (section.lessons?.length || 0), 0)}
          </p>
          <p className="text-purple-200">درس</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {sections.reduce((total, section) => 
              total + (section.lessons?.reduce((lessonTotal, lesson) => 
                lessonTotal + (lesson.duration || 0), 0) || 0), 0
            )}
          </p>
          <p className="text-purple-200">دقيقة</p>
        </div>
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
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-purple-200">لم تقم بإضافة أي وحدات بعد</p>
          <p className="text-purple-300 text-sm">ابدأ بإضافة الوحدة الأولى لكورسك</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <EditableSectionCard
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
    </div>
  );
};

const SettingsTab = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">إعدادات الكورس</h3>
      
      {/* Pricing */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">التسعير</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id="isFree"
              checked={data.isFree || false}
              onChange={(e) => onChange('isFree', e.target.checked)}
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
                value={data.price || 0}
                onChange={(e) => onChange('price', Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">إعدادات العرض</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id="isActive"
              checked={data.isActive || false}
              onChange={(e) => onChange('isActive', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-white font-medium">
              كورس نشط ومتاح للتسجيل
            </label>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id="allowPreview"
              checked={data.allowPreview || false}
              onChange={(e) => onChange('allowPreview', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="allowPreview" className="text-white font-medium">
              السماح بمعاينة بعض الدروس مجاناً
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reuse the SectionCard and LessonCard components from CreateCourseTab with some modifications
const EditableSectionCard = ({ 
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
            <EditableLessonCard
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

const EditableLessonCard = ({ lesson, lessonIndex, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!lesson.title);
  const [formData, setFormData] = useState({
    title: lesson.title,
    type: lesson.type || 'article',
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || '',
    duration: lesson.duration || 0,
    isPublished: lesson.isPublished || false
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
      onDelete();
    } else {
      setFormData({
        title: lesson.title,
        type: lesson.type || 'article',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0,
        isPublished: lesson.isPublished || false
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
                placeholder="اكتب محتوى المقال باستخدام Markdown..."
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

          {/* Published Status */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id={`published-${lesson.id}`}
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor={`published-${lesson.id}`} className="text-purple-200 text-sm">
              منشور ومتاح للطلاب
            </label>
          </div>

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
              <div className="flex items-center space-x-2 space-x-reverse text-purple-300 text-sm">
                <span>{getTypeLabel(lesson.type)}</span>
                {lesson.type === 'video' && lesson.duration > 0 && <span>• {lesson.duration} دقيقة</span>}
                {lesson.isPublished ? (
                  <span className="text-green-400">• منشور</span>
                ) : (
                  <span className="text-yellow-400">• مسودة</span>
                )}
              </div>
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

export default EditCourseModal;