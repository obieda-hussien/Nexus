import React, { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Edit3, Trash2, Youtube, FileText, ExternalLink, ChevronDown, ChevronUp, Move, HelpCircle } from 'lucide-react';
import { ref, update, remove } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import MarkdownEditor from './MarkdownEditor';
import QuizEditor from './QuizEditor';
import QuizAnalytics from './QuizAnalytics';
import Modal from '../ui/Modal';
import ErrorBoundary from '../ui/ErrorBoundary';

const EditCourseModal = ({ course, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [courseData, setCourseData] = useState(course);
  const [sections, setSections] = useState(course?.curriculum?.sections || []);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  // Reset state when course changes or modal opens
  useEffect(() => {
    if (isOpen && course) {
      setCourseData(course);
      setSections(course?.curriculum?.sections || []);
      setActiveTab('basic');
      setIsLoading(false);
    }
  }, [course, isOpen]);

  const handleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const updatedCourse = {
        ...courseData,
        curriculum: { sections },
        updatedAt: new Date().toISOString()
      };

      await update(ref(db, `courses/${course.id}`), updatedCourse);
      toast.success('Course updated successfully');
      onUpdate(updatedCourse);
      onClose();
    } catch (error) {
      toast.error('An error occurred in Update Course');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourseField = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit الكورس: ${course?.title || ''}`}
      size="2xl"
      className="bg-gray-900 text-white"
    >
      {/* Tabs */}
      <div className="border-b border-gray-600 bg-gray-800">
        <div className="flex space-x-0 space-x-reverse">
          {[
            { id: 'basic', label: 'Basic Information' },
            { id: 'curriculum', label: 'Curriculum والوحدات' },
            { id: 'analytics', label: 'Analytics الQuiz' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6 overflow-y-auto bg-gray-800">
          <ErrorBoundary>
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
            
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                course={course}
                sections={sections}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab 
                data={courseData} 
                onChange={updateCourseField} 
              />
            )}
          </ErrorBoundary>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-6 flex justify-between bg-gray-800">
          <button
            onClick={onClose}
            type="button"
            disabled={isLoading}
            className="px-6 py-3 text-gray-300 hover:text-white transition-colors hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            type="button"
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 space-x-reverse"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save التغييرات'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

const BasicInfoTab = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            التصنيف *
          </label>
          <select
            value={data.category || ''}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="">Select Category</option>
            <option value="physics">Physics</option>
            <option value="math">Mathematics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="programming">Programming</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-semibold mb-2">
          Short description *
        </label>
        <input
          type="text"
          value={data.shortDescription || ''}
          onChange={(e) => onChange('shortDescription', e.target.value)}
          className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          maxLength="120"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-semibold mb-2">
          Description التفصيلي *
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows="6"
          className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Level
          </label>
          <select
            value={data.level || 'beginner'}
            onChange={(e) => onChange('level', e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Language
          </label>
          <select
            value={data.language || 'ar'}
            onChange={(e) => onChange('language', e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="ar">Arabic</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Status
          </label>
          <select
            value={data.status || 'draft'}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full bg-gray-700 border border-gray-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="draft">Draft</option>
            <option value="pending">in الReview</option>
            <option value="published">Published</option>
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
      toast.error('Please enter section title');
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
    toast.success('Section added successfully');
  };

  const updateSection = (sectionId, updates) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    
    setSections(sections.filter(section => section.id !== sectionId));
    toast.success('Section deleted');
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
      isPublished: false,
      quiz: {
        questions: [],
        timeLimit: 30,
        maxAttempts: 3,
        passingScore: 70,
        showCorrectAnswers: true,
        allowReview: true,
        randomizeQuestions: false,
        settings: {
          description: '',
          instructions: '',
          showProgress: true,
          requirePassword: false,
          password: ''
        }
      }
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
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedLessons = section.lessons.filter(lesson => lesson.id !== lessonId);
    updateSection(sectionId, { lessons: updatedLessons });
    toast.success('Lesson deleted');
  };

  const toggleSectionExpansion = (sectionId) => {
    updateSection(sectionId, {
      isExpanded: !sections.find(s => s.id === sectionId)?.isExpanded
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Course Curriculum</h3>
        <button
          onClick={() => setShowAddSection(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add وحدة</span>
        </button>
      </div>

      {/* Course Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">{sections.length}</p>
          <p className="text-gray-300">وحدة</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">
            {sections.reduce((total, section) => total + (section.lessons?.length || 0), 0)}
          </p>
          <p className="text-gray-300">درس</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">
            {sections.reduce((total, section) => 
              total + (section.lessons?.reduce((lessonTotal, lesson) => 
                lessonTotal + (lesson.duration || 0), 0) || 0), 0
            )}
          </p>
          <p className="text-gray-300">minute</p>
        </div>
      </div>

      {/* Add Section Form */}
      {showAddSection && (
        <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
          <div className="flex space-x-3 space-x-reverse">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="New Section Title"
              className="flex-1 bg-gray-800 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && addSection()}
            />
            <button
              onClick={addSection}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddSection(false);
                setNewSectionTitle('');
              }}
              className="text-gray-300 hover:text-white px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-700 rounded-xl border border-gray-600">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">You haven't added any sections yet</p>
          <p className="text-gray-400 text-sm">Start by adding the first section to your course</p>
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
      <h3 className="text-xl font-semibold text-white mb-4">Setupات الكورس</h3>
      
      {/* Pricing */}
      <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Pricing</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id="isfree"
              checked={data.isfree || false}
              onChange={(e) => onChange('isfree', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isfree" className="text-white font-medium">
              كورس free
            </label>
          </div>

          {!data.isfree && (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Price (بالEGP المصري)
              </label>
              <input
                type="number"
                value={data.price || 0}
                onChange={(e) => onChange('price', Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-4">Setupات الView</h4>
        
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
              كورس Active وAvailable للتسجيل
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
              السماح بwithاينة some الدروس مجاناً
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
      toast.error('aboutوان الوحدة مطلوب');
      return;
    }
    onUpdate({ title: editTitle });
    setIsEditing(false);
    toast.success('Section title updated');
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 space-x-reverse flex-1">
          <button
            onClick={onToggleExpansion}
            className="text-gray-300 hover:text-white p-1 rounded"
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
                className="flex-1 bg-gray-700 border border-gray-500 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-400"
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
              />
              <button
                onClick={handleTitleSave}
                className="text-green-400 hover:text-green-300 p-1"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(section.title);
                }}
                className="text-red-400 hover:text-red-300 p-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <h4 className="text-white font-semibold flex-1">{section.title}</h4>
          )}
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-gray-300 text-sm">
            {section.lessons?.length || 0} درس
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-700"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-700"
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-300 hover:text-white hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>Add درس New</span>
          </button>
        </div>
      )}
    </div>
  );
};

const EditableLessonCard = ({ lesson, lessonIndex, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!lesson.title);
  const [formData, setFormData] = useState({
    title: lesson.title || '',
    type: lesson.type || 'article',
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || '',
    duration: lesson.duration || 0,
    isPublished: lesson.isPublished || false,
    quiz: lesson.quiz || {
      questions: [],
      timeLimit: 30,
      maxAttempts: 3,
      passingScore: 70,
      showCorrectAnswers: true,
      allowReview: true,
      randomizeQuestions: false,
      settings: {
        description: '',
        instructions: 'Read each question carefully and choose the correct answer.',
        showProgress: true,
        requirePassword: false,
        password: ''
      }
    }
  });

  // Memoized callback for quiz data changes to prevent unnecessary re-renders
  const handleQuizChange = useCallback((quiz) => {
    setFormData(prev => ({ ...prev, quiz }));
  }, []);

  // Reset form data when lesson changes
  useEffect(() => {
    setFormData({
      title: lesson.title || '',
      type: lesson.type || 'article',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      isPublished: lesson.isPublished || false,
      quiz: lesson.quiz || {
        questions: [],
        timeLimit: 30,
        maxAttempts: 3,
        passingScore: 70,
        showCorrectAnswers: true,
        allowReview: true,
        randomizeQuestions: false,
        settings: {
          description: '',
          instructions: 'Read each question carefully and choose the correct answer.',
          showProgress: true,
          requirePassword: false,
          password: ''
        }
      }
    });
  }, [lesson]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Lesson title required');
      return;
    }

    if (formData.type === 'video' && !formData.videoUrl.trim()) {
      toast.error('Video link required');
      return;
    }

    if (formData.type === 'quiz' && formData.quiz.questions.length === 0) {
      toast.error('Must add at least one question to the quiz');
      return;
    }

    onUpdate(formData);
    setIsEditing(false);
    toast.success('Lesson saved');
  };

  const handleCancel = () => {
    if (!lesson.title) {
      onDelete();
    } else {
      // Reset to original values
      setFormData({
        title: lesson.title || '',
        type: lesson.type || 'article',
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || 0,
        isPublished: lesson.isPublished || false,
        quiz: lesson.quiz || {
          questions: [],
          timeLimit: 30,
          maxAttempts: 3,
          passingScore: 70,
          showCorrectAnswers: true,
          allowReview: true,
          randomizeQuestions: false,
          settings: {
            description: '',
            instructions: 'Read each question carefully and choose the correct answer.',
            showProgress: true,
            requirePassword: false,
            password: ''
          }
        }
      });
      setIsEditing(false);
    }
  };

  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Youtube className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'article':
        return 'Article';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Article';
    }
  };

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
      {isEditing ? (
        <div className="space-y-3">
          {/* Lesson Title */}
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormField('title', e.target.value)}
            placeholder="Lesson Title"
            className="w-full bg-gray-800 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />

          {/* Lesson Type */}
          <select
            value={formData.type}
            onChange={(e) => updateFormField('type', e.target.value)}
            className="w-full bg-gray-800 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
          </select>

          {/* Content based on type */}
          {formData.type === 'article' ? (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                محتوى الArticle (يدعم Markdown)
              </label>
              <ErrorBoundary>
                <MarkdownEditor
                  value={formData.content}
                  onChange={(value) => updateFormField('content', value)}
                  placeholder="Write محتوى الArticle باستخدام Markdown..."
                />
              </ErrorBoundary>
            </div>
          ) : formData.type === 'video' ? (
            <div className="space-y-2">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => updateFormField('videoUrl', e.target.value)}
                placeholder="Video Link (YouTube or direct link)"
                className="w-full bg-gray-800 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => updateFormField('duration', parseInt(e.target.value) || 0)}
                placeholder="Video Duration (in minutes)"
                className="w-full bg-gray-800 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          ) : formData.type === 'quiz' ? (
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                محتوى الQuiz
              </label>
              <ErrorBoundary>
                <QuizEditor
                  quizData={formData.quiz}
                  onChange={handleQuizChange}
                  placeholder="إنشاء Quiz تفاعلي..."
                />
              </ErrorBoundary>
            </div>
          ) : null}

          {/* Published Status */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id={`published-${lesson.id}`}
              checked={formData.isPublished}
              onChange={(e) => updateFormField('isPublished', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor={`published-${lesson.id}`} className="text-gray-300 text-sm">
              Published وAvailable For students
            </label>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex space-x-2 space-x-reverse justify-end">
            <button
              onClick={handleSave}
              type="button"
              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="text-gray-300 hover:text-white px-3 py-1 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-gray-400">
              {lessonIndex + 1}.
            </div>
            <div className="text-gray-300">
              {getTypeIcon(lesson.type)}
            </div>
            <div>
              <h5 className="text-white font-medium">{lesson.title}</h5>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
                <span>{getTypeLabel(lesson.type)}</span>
                {lesson.type === 'video' && lesson.duration > 0 && <span>• {lesson.duration} minute</span>}
                {lesson.type === 'quiz' && lesson.quiz?.questions?.length > 0 && (
                  <span>• {lesson.quiz.questions.length} Question</span>
                )}
                {lesson.isPublished ? (
                  <span className="text-green-400">• Published</span>
                ) : (
                  <span className="text-yellow-400">• Draft</span>
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
                className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-600"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = ({ course, sections }) => {
  // Get all quiz lessons from all sections
  const quizLessons = sections.flatMap(section => 
    section.lessons?.filter(lesson => lesson.type === 'quiz') || []
  );

  if (quizLessons.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">لا توجد Quizات in this الكورس</h3>
        <p className="text-gray-400">قم بAdd Quizات in تبويب "Curriculum والوحدات" لView الAnalytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Analytics الQuizات</h3>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">{quizLessons.length}</p>
          <p className="text-gray-300">Total الQuizات</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">
            {quizLessons.reduce((total, lesson) => total + (lesson.quiz?.questions?.length || 0), 0)}
          </p>
          <p className="text-gray-300">Total الأسئلة</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4 text-center border border-gray-600">
          <p className="text-2xl font-bold text-white">
            {quizLessons.filter(lesson => lesson.isPublished).length}
          </p>
          <p className="text-gray-300">Quizات Publishedة</p>
        </div>
      </div>

      {/* Quiz Analytics for each quiz */}
      <div className="space-y-6">
        {quizLessons.map((lesson, index) => (
          <div key={lesson.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h4 className="text-lg font-semibold text-white">{lesson.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.isPublished 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-black'
                }`}>
                  {lesson.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="text-gray-400 text-sm">
                {lesson.quiz?.questions?.length || 0} Question • 
                {lesson.quiz?.timeLimit || 30} minute
              </div>
            </div>
            
            {lesson.isPublished ? (
              <QuizAnalytics 
                courseId={course.id}
                lessonId={lesson.id}
                quizTitle={lesson.title}
              />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>يجب Publish الQuiz أولاً لView الAnalytics</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditCourseModal;