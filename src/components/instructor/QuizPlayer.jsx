import React, { useState, useEffect } from 'react';
import { Clock, Trophy, CheckCircle, X, ArrowRight, ArrowLeft, AlertCircle, Play } from 'lucide-react';
import { ref, push, set, get } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const QuizPlayer = ({ quiz, courseId, lessonId, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [canStart, setCanStart] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const { currentUser } = useAuth();

  // Load previous attempts
  useEffect(() => {
    if (!currentUser || !courseId || !lessonId) return;

    const loadPreviousAttempts = async () => {
      try {
        const analyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}/${currentUser.uid}`);
        const snapshot = await get(analyticsRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPreviousAttempts(data.attempts || []);
          
          // Check if user has exceeded max attempts
          if (data.attempts && data.attempts.length >= quiz.maxAttempts) {
            setCanStart(false);
          }
        }
      } catch (error) {
        console.error('Error loading previous attempts:', error);
      }
    };

    loadPreviousAttempts();
  }, [currentUser, courseId, lessonId, quiz.maxAttempts]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || quizCompleted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeRemaining]);

  const handleTimeUp = () => {
    toast.error('انتهى الوقت المحدد للكويز');
    submitQuiz();
  };

  const startQuiz = () => {
    // Check password if required
    if (quiz.settings?.requirePassword) {
      if (!passwordInput) {
        setRequiresPassword(true);
        return;
      }
      if (passwordInput !== quiz.settings.password) {
        toast.error('كلمة المرور غير صحيحة');
        return;
      }
    }

    setQuizStarted(true);
    setTimeRemaining(quiz.timeLimit * 60);
    
    // Randomize questions if enabled
    if (quiz.randomizeQuestions) {
      // This would randomize the questions order
      // For now, we'll keep the original order
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const goToNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    if (!currentUser) {
      toast.error('يجب تسجيل الدخول لحفظ النتائج');
      return;
    }

    const startTime = Date.now() - ((quiz.timeLimit * 60 - timeRemaining) * 1000);
    const timeSpent = quiz.timeLimit * 60 - timeRemaining;
    
    const { calculatedScore, correctAnswers } = calculateScore();
    setScore(calculatedScore);
    setQuizCompleted(true);

    try {
      // Save submission
      const submissionData = {
        studentId: currentUser.uid,
        courseId,
        lessonId,
        answers,
        score: calculatedScore,
        timeSpent,
        submittedAt: new Date().toISOString(),
        correctAnswers,
        maxScore: quiz.questions.length
      };

      const submissionRef = await push(ref(db, `quiz_submissions/${courseId}/${lessonId}`), submissionData);
      setSubmissionId(submissionRef.key);

      // Update analytics
      const analyticsRef = ref(db, `quiz_analytics/${courseId}/${lessonId}/${currentUser.uid}`);
      const analyticsSnapshot = await get(analyticsRef);
      
      const existingData = analyticsSnapshot.val() || {};
      const attempts = existingData.attempts || [];
      
      const newAttempt = {
        submissionId: submissionRef.key,
        score: calculatedScore,
        timeSpent,
        submittedAt: new Date().toISOString(),
        passed: calculatedScore >= quiz.passingScore
      };

      const updatedAnalytics = {
        attempts: [...attempts, newAttempt],
        bestScore: Math.max(existingData.bestScore || 0, calculatedScore),
        totalAttempts: attempts.length + 1,
        averageScore: Math.round(([...attempts, newAttempt].reduce((sum, a) => sum + a.score, 0)) / (attempts.length + 1)),
        passed: calculatedScore >= quiz.passingScore || existingData.passed,
        lastAttemptAt: new Date().toISOString()
      };

      await set(analyticsRef, updatedAnalytics);

      // Show results after a brief delay
      setTimeout(() => {
        setShowResults(true);
      }, 1000);

      if (onComplete) {
        onComplete({
          score: calculatedScore,
          passed: calculatedScore >= quiz.passingScore,
          submissionId: submissionRef.key
        });
      }

    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('حدث خطأ في حفظ النتائج');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    const correctAnswers = {};

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'multiple_choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.id;
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer === question.correctAnswer;
      } else if (question.type === 'short_answer') {
        isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
      }

      if (isCorrect) {
        correct++;
      }
      
      correctAnswers[question.id] = isCorrect;
    });

    return {
      calculatedScore: Math.round((correct / quiz.questions.length) * 100),
      correctAnswers
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionProgress = () => {
    const answeredQuestions = quiz.questions.filter(q => answers[q.id] !== undefined).length;
    return (answeredQuestions / quiz.questions.length) * 100;
  };

  if (!canStart) {
    return (
      <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">لقد تجاوزت العدد المسموح من المحاولات</h3>
        <p className="text-gray-600 mb-4">
          لقد قمت بـ {previousAttempts.length} محاولة من أصل {quiz.maxAttempts} محاولة مسموحة.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إغلاق
        </button>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-4">كلمة مرور مطلوبة</h3>
        <p className="text-gray-600 mb-4">يتطلب هذا الكويز كلمة مرور للمتابعة</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="أدخل كلمة المرور"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-400"
        />
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={startQuiz}
            className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            بدء الكويز
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            إلغاء
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <QuizResults
        score={score}
        quiz={quiz}
        answers={answers}
        onClose={onClose}
        onRetry={() => {
          if (previousAttempts.length + 1 < quiz.maxAttempts) {
            // Reset quiz for retry
            setCurrentQuestion(0);
            setAnswers({});
            setQuizStarted(false);
            setQuizCompleted(false);
            setScore(null);
            setShowResults(false);
            setTimeRemaining(quiz.timeLimit * 60);
          }
        }}
        canRetry={previousAttempts.length + 1 < quiz.maxAttempts}
        attemptNumber={previousAttempts.length + 1}
        maxAttempts={quiz.maxAttempts}
      />
    );
  }

  if (!quizStarted) {
    return (
      <QuizIntro
        quiz={quiz}
        onStart={startQuiz}
        onClose={onClose}
        previousAttempts={previousAttempts}
        maxAttempts={quiz.maxAttempts}
      />
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="bg-white rounded-lg max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">الكويز</h2>
          <p className="text-gray-600 text-sm">
            السؤال {currentQuestion + 1} من {quiz.questions.length}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
            <Clock className="w-5 h-5" />
            <span className={`font-mono ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {quiz.settings?.showProgress && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>التقدم: {Math.round(getQuestionProgress())}%</span>
            <span>تم الإجابة على {quiz.questions.filter(q => answers[q.id] !== undefined).length} من {quiz.questions.length}</span>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {currentQ.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQ.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQ.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.id}
                    checked={answers[currentQ.id] === option.id}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 flex-1">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'true_false' && (
            <div className="space-y-3">
              <label className="flex items-center space-x-3 space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value="true"
                  checked={answers[currentQ.id] === true}
                  onChange={() => handleAnswerChange(currentQ.id, true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 flex-1">صح</span>
              </label>
              <label className="flex items-center space-x-3 space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value="false"
                  checked={answers[currentQ.id] === false}
                  onChange={() => handleAnswerChange(currentQ.id, false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 flex-1">خطأ</span>
              </label>
            </div>
          )}

          {currentQ.type === 'short_answer' && (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="اكتب إجابتك هنا..."
              rows="4"
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>السابق</span>
        </button>

        <div className="flex space-x-2 space-x-reverse">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              className="flex items-center space-x-2 space-x-reverse px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Trophy className="w-4 h-4" />
              <span>إنهاء الكويز</span>
            </button>
          ) : (
            <button
              onClick={goToNext}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <span>التالي</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const QuizIntro = ({ quiz, onStart, onClose, previousAttempts, maxAttempts }) => {
  return (
    <div className="bg-white rounded-lg max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك في الكويز</h2>
        {quiz.settings?.description && (
          <p className="text-gray-600">{quiz.settings.description}</p>
        )}
      </div>

      {/* Quiz Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{quiz.questions.length}</div>
          <div className="text-gray-600 text-sm">أسئلة</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{quiz.timeLimit}</div>
          <div className="text-gray-600 text-sm">دقيقة</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</div>
          <div className="text-gray-600 text-sm">درجة النجاح</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">تعليمات:</h3>
        <p className="text-blue-800 text-sm">{quiz.settings?.instructions}</p>
      </div>

      {/* Attempt Info */}
      {previousAttempts.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">محاولاتك السابقة:</h4>
          <div className="space-y-2">
            {previousAttempts.slice(-3).map((attempt, index) => (
              <div key={index} className="flex justify-between text-sm text-yellow-800">
                <span>المحاولة {previousAttempts.length - index}</span>
                <span className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                  {attempt.score}% {attempt.passed ? '(نجح)' : '(راسب)'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-yellow-700 text-sm mt-2">
            المحاولة {previousAttempts.length + 1} من {maxAttempts}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 space-x-reverse justify-center">
        <button
          onClick={onStart}
          className="flex items-center space-x-2 space-x-reverse px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          <Play className="w-5 h-5" />
          <span>بدء الكويز</span>
        </button>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};

const QuizResults = ({ score, quiz, answers, onClose, onRetry, canRetry, attemptNumber, maxAttempts }) => {
  const passed = score >= quiz.passingScore;
  
  return (
    <div className="bg-white rounded-lg max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="mb-4">
          <Trophy className={`w-20 h-20 mx-auto ${passed ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">نتائج الكويز</h2>
        <div className="text-6xl font-bold mb-4 text-gray-900">
          {score}%
        </div>
        <div className={`inline-block px-6 py-3 rounded-full font-semibold text-lg ${
          passed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {passed ? 'مبروك! لقد نجحت' : 'للأسف لم تنجح'}
        </div>
      </div>

      {/* Score Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((score / 100) * quiz.questions.length)}
          </div>
          <div className="text-gray-600 text-sm">إجابات صحيحة من {quiz.questions.length}</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{attemptNumber}</div>
          <div className="text-gray-600 text-sm">من {maxAttempts} محاولة</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 space-x-reverse justify-center">
        {canRetry && !passed && (
          <button
            onClick={onRetry}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
          >
            محاولة أخرى
          </button>
        )}
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          إغلاق
        </button>
      </div>

      {!canRetry && !passed && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800">لقد استنفدت جميع المحاولات المتاحة لهذا الكويز</p>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;