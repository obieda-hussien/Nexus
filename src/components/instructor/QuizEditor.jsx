import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Save, Eye, Settings, Clock, Trophy, HelpCircle, CheckCircle, X, ChevronUp, ChevronDown, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizEditor = ({ quizData, onChange, placeholder = "إنشاء كويز تفاعلي..." }) => {
  const [quiz, setQuiz] = useState({
    questions: [],
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 70,
    showCorrectAnswers: true,
    allowReview: true,
    randomizeQuestions: false,
    settings: {
      description: '',
      instructions: 'اقرأ كل سؤال بعناية واختر الإجابة الصحيحة.',
      showProgress: true,
      requirePassword: false,
      password: ''
    },
    ...quizData
  });

  const [activeTab, setActiveTab] = useState('questions');
  const [showPreview, setShowPreview] = useState(false);
  const isInitialMount = useRef(true);
  const changeTimeoutRef = useRef(null);

  // Memoized onChange callback to prevent unnecessary calls
  const debouncedOnChange = useCallback((newQuiz) => {
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    changeTimeoutRef.current = setTimeout(() => {
      if (onChange && typeof onChange === 'function') {
        onChange(newQuiz);
      }
    }, 100);
  }, [onChange]);

  // Initialize quiz data only once when quizData prop changes
  useEffect(() => {
    if (quizData && JSON.stringify(quizData) !== JSON.stringify(quiz)) {
      setQuiz(prevQuiz => ({
        ...prevQuiz,
        ...quizData
      }));
    }
  }, [quizData]);

  // Call onChange when quiz changes, but skip initial mount and debounce updates
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    debouncedOnChange(quiz);
    
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [quiz, debouncedOnChange]);

  const addQuestion = (type = 'multiple_choice') => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      question: '',
      explanation: '',
      points: 1,
      required: true,
      options: type === 'multiple_choice' ? [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false },
        { id: '3', text: '', isCorrect: false },
        { id: '4', text: '', isCorrect: false }
      ] : [],
      correctAnswer: type === 'true_false' ? true : '',
      order: quiz.questions.length + 1
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId, updates) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (questionId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    toast.success('تم حذف السؤال');
  };

  const moveQuestion = (questionId, direction) => {
    const questions = [...quiz.questions];
    const index = questions.findIndex(q => q.id === questionId);
    
    if (direction === 'up' && index > 0) {
      [questions[index], questions[index - 1]] = [questions[index - 1], questions[index]];
    } else if (direction === 'down' && index < questions.length - 1) {
      [questions[index], questions[index + 1]] = [questions[index + 1], questions[index]];
    }

    // Update order numbers
    questions.forEach((q, i) => q.order = i + 1);

    setQuiz(prev => ({ ...prev, questions }));
  };

  const updateSettings = (key, value) => {
    setQuiz(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateQuizSettings = (key, value) => {
    setQuiz(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
  };

  const renderQuestionEditor = (question, index) => (
    <QuestionEditor
      key={question.id}
      question={question}
      index={index}
      onUpdate={(updates) => updateQuestion(question.id, updates)}
      onDelete={() => deleteQuestion(question.id)}
      onMove={(direction) => moveQuestion(question.id, direction)}
      canMoveUp={index > 0}
      canMoveDown={index < quiz.questions.length - 1}
    />
  );

  return (
    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">محرر الكويز</h3>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {quiz.questions.length} سؤال
          </span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1 space-x-reverse px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          الأسئلة ({quiz.questions.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          الإعدادات
        </button>
      </div>

      {/* Content */}
      {!showPreview ? (
        <div className="space-y-4">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* Questions */}
              {quiz.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">لا توجد أسئلة بعد</p>
                  <p className="text-sm">ابدأ بإضافة أول سؤال للكويز</p>
                </div>
              ) : (
                quiz.questions.map((question, index) => renderQuestionEditor(question, index))
              )}

              {/* Add Question Buttons */}
              <div className="border-t border-gray-600 pt-4">
                <h4 className="text-white font-medium mb-3">إضافة سؤال جديد:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addQuestion('multiple_choice')}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>اختيار متعدد</span>
                  </button>
                  <button
                    onClick={() => addQuestion('true_false')}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>صح أم خطأ</span>
                  </button>
                  <button
                    onClick={() => addQuestion('short_answer')}
                    className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>إجابة قصيرة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <QuizSettings
              quiz={quiz}
              onUpdateSetting={updateSettings}
              onUpdateQuizSetting={updateQuizSettings}
            />
          )}
        </div>
      ) : (
        <QuizPreview quiz={quiz} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

const QuestionEditor = ({ question, index, onUpdate, onDelete, onMove, canMoveUp, canMoveDown }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateQuestion = (field, value) => {
    onUpdate({ [field]: value });
  };

  const updateOption = (optionId, field, value) => {
    const updatedOptions = question.options.map(option =>
      option.id === optionId ? { ...option, [field]: value } : option
    );
    onUpdate({ options: updatedOptions });
  };

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false
    };
    onUpdate({ options: [...question.options, newOption] });
  };

  const removeOption = (optionId) => {
    if (question.options.length <= 2) {
      toast.error('يجب أن يكون هناك خيارين على الأقل');
      return;
    }
    onUpdate({ options: question.options.filter(option => option.id !== optionId) });
  };

  const setCorrectOption = (optionId) => {
    const updatedOptions = question.options.map(option => ({
      ...option,
      isCorrect: option.id === optionId
    }));
    onUpdate({ options: updatedOptions });
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <span className="text-white font-medium">السؤال {index + 1}</span>
          <span className="text-gray-400 text-sm">
            ({question.type === 'multiple_choice' ? 'اختيار متعدد' : 
              question.type === 'true_false' ? 'صح أم خطأ' : 'إجابة قصيرة'})
          </span>
        </div>
        
        <div className="flex items-center space-x-1 space-x-reverse">
          <button
            onClick={() => onMove('up')}
            disabled={!canMoveUp}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={!canMoveDown}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              نص السؤال *
            </label>
            <textarea
              value={question.question}
              onChange={(e) => updateQuestion('question', e.target.value)}
              placeholder="اكتب السؤال هنا..."
              rows="3"
              className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Question Type Specific Content */}
          {question.type === 'multiple_choice' && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                خيارات الإجابة
              </label>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => setCorrectOption(option.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        option.isCorrect
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-500 hover:border-green-400'
                      }`}
                    >
                      {option.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                      placeholder={`الخيار ${optionIndex + 1}`}
                      className="flex-1 bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    />
                    {question.options.length > 2 && (
                      <button
                        onClick={() => removeOption(option.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {question.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="mt-2 flex items-center space-x-1 space-x-reverse text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة خيار</span>
                </button>
              )}
            </div>
          )}

          {question.type === 'true_false' && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                الإجابة الصحيحة
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => updateQuestion('correctAnswer', true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    question.correctAnswer === true
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  صح
                </button>
                <button
                  onClick={() => updateQuestion('correctAnswer', false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    question.correctAnswer === false
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  خطأ
                </button>
              </div>
            </div>
          )}

          {question.type === 'short_answer' && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                الإجابة النموذجية
              </label>
              <input
                type="text"
                value={question.correctAnswer}
                onChange={(e) => updateQuestion('correctAnswer', e.target.value)}
                placeholder="الإجابة المتوقعة..."
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          )}

          {/* Question Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                النقاط
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={question.points}
                onChange={(e) => updateQuestion('points', parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`required-${question.id}`}
                checked={question.required}
                onChange={(e) => updateQuestion('required', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor={`required-${question.id}`} className="mr-2 text-gray-300 text-sm">
                سؤال إجباري
              </label>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              شرح الإجابة (اختياري)
            </label>
            <textarea
              value={question.explanation}
              onChange={(e) => updateQuestion('explanation', e.target.value)}
              placeholder="اكتب شرح للإجابة الصحيحة..."
              rows="2"
              className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const QuizSettings = ({ quiz, onUpdateSetting, onUpdateQuizSetting }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Limit */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <Clock className="w-4 h-4 inline ml-1" />
            الحد الزمني (دقيقة)
          </label>
          <input
            type="number"
            min="1"
            max="180"
            value={quiz.timeLimit}
            onChange={(e) => onUpdateSetting('timeLimit', parseInt(e.target.value) || 30)}
            className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Max Attempts */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <Trophy className="w-4 h-4 inline ml-1" />
            عدد المحاولات المسموحة
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={quiz.maxAttempts}
            onChange={(e) => onUpdateSetting('maxAttempts', parseInt(e.target.value) || 3)}
            className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Passing Score */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            درجة النجاح (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={quiz.passingScore}
            onChange={(e) => onUpdateSetting('passingScore', parseInt(e.target.value) || 70)}
            className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          وصف الكويز
        </label>
        <textarea
          value={quiz.settings.description}
          onChange={(e) => onUpdateQuizSetting('description', e.target.value)}
          placeholder="وصف مختصر للكويز..."
          rows="3"
          className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          تعليمات الكويز
        </label>
        <textarea
          value={quiz.settings.instructions}
          onChange={(e) => onUpdateQuizSetting('instructions', e.target.value)}
          rows="3"
          className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">خيارات الكويز</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={quiz.showCorrectAnswers}
              onChange={(e) => onUpdateSetting('showCorrectAnswers', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">إظهار الإجابات الصحيحة</span>
          </label>

          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={quiz.allowReview}
              onChange={(e) => onUpdateSetting('allowReview', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">السماح بمراجعة الإجابات</span>
          </label>

          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={quiz.randomizeQuestions}
              onChange={(e) => onUpdateSetting('randomizeQuestions', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">ترتيب عشوائي للأسئلة</span>
          </label>

          <label className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={quiz.settings.showProgress}
              onChange={(e) => onUpdateQuizSetting('showProgress', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-300">إظهار شريط التقدم</span>
          </label>
        </div>
      </div>

      {/* Password Protection */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 space-x-reverse">
          <input
            type="checkbox"
            checked={quiz.settings.requirePassword}
            onChange={(e) => onUpdateQuizSetting('requirePassword', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-300">حماية بكلمة مرور</span>
        </label>

        {quiz.settings.requirePassword && (
          <input
            type="text"
            value={quiz.settings.password}
            onChange={(e) => onUpdateQuizSetting('password', e.target.value)}
            placeholder="كلمة مرور الكويز"
            className="w-full bg-gray-700 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
        )}
      </div>
    </div>
  );
};

const QuizPreview = ({ quiz, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let correct = 0;
    let total = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple_choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (userAnswer === correctOption?.id) correct++;
      } else if (question.type === 'true_false') {
        if (userAnswer === question.correctAnswer) correct++;
      } else if (question.type === 'short_answer') {
        if (userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
          correct++;
        }
      }
    });

    return { correct, total, percentage: Math.round((correct / total) * 100) };
  };

  const currentQ = quiz.questions[currentQuestion];

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
        <div className="text-center">
          <div className="mb-4">
            <Trophy className={`w-16 h-16 mx-auto ${score.percentage >= quiz.passingScore ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">نتائج الكويز</h3>
          <div className="text-4xl font-bold mb-2 text-gray-900">
            {score.percentage}%
          </div>
          <p className="text-gray-600 mb-4">
            أجبت على {score.correct} من {score.total} أسئلة بشكل صحيح
          </p>
          <div className={`inline-block px-4 py-2 rounded-full font-medium ${
            score.percentage >= quiz.passingScore
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {score.percentage >= quiz.passingScore ? 'نجح' : 'راسب'}
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-2 space-x-reverse">
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 max-h-96 overflow-y-auto">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">معاينة الكويز</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {quiz.settings.showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        )}
        
        <p className="text-gray-600 text-sm">
          السؤال {currentQuestion + 1} من {quiz.questions.length}
        </p>
      </div>

      {currentQ && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">{currentQ.question}</h4>
          
          {currentQ.type === 'multiple_choice' && (
            <div className="space-y-2">
              {currentQ.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-2 space-x-reverse p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.id}
                    checked={answers[currentQ.id] === option.id}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'true_false' && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 space-x-reverse p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value="true"
                  checked={answers[currentQ.id] === true}
                  onChange={() => handleAnswerChange(currentQ.id, true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">صح</span>
              </label>
              <label className="flex items-center space-x-2 space-x-reverse p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value="false"
                  checked={answers[currentQ.id] === false}
                  onChange={() => handleAnswerChange(currentQ.id, false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">خطأ</span>
              </label>
            </div>
          )}

          {currentQ.type === 'short_answer' && (
            <input
              type="text"
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          السابق
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={() => setShowResults(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            إنهاء الكويز
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            التالي
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizEditor;