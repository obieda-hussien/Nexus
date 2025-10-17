import React, { useState, useEffect } from 'react';
import { ref, push, set, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewSubmission = ({ courseId, courseTitle }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    if (currentUser?.uid && courseId) {
      checkExistingReview();
    }
  }, [currentUser, courseId]);

  const checkExistingReview = () => {
    // Use courses/{courseId}/reviews path instead of course_reviews/{courseId}
    const reviewsRef = ref(db, `courses/${courseId}/reviews`);
    onValue(reviewsRef, (snapshot) => {
      let foundReview = null;
      snapshot.forEach((childSnapshot) => {
        const review = childSnapshot.val();
        if (review.studentId === currentUser.uid) {
          foundReview = {
            id: childSnapshot.key,
            ...review
          };
        }
      });
      
      if (foundReview) {
        setHasReviewed(true);
        setUserReview(foundReview);
        setRating(foundReview.rating);
        setComment(foundReview.comment || '');
      }
    });
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('يرجى تحديد التقييم أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        studentId: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email?.split('@')[0] || 'student',
        rating: rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
        courseId: courseId
      };

      if (hasReviewed && userReview) {
        // Update existing review - use courses/{courseId}/reviews/{reviewId} path
        const reviewRef = ref(db, `courses/${courseId}/reviews/${userReview.id}`);
        await set(reviewRef, {
          ...reviewData,
          updatedAt: new Date().toISOString()
        });
        toast.success('تم Update تقييمك بنجاح');
      } else {
        // Create new review - use courses/{courseId}/reviews path
        const reviewsRef = ref(db, `courses/${courseId}/reviews`);
        await push(reviewsRef, reviewData);
        toast.success('تم Submit تقييمك بنجاح');
        setHasReviewed(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An error occurred في Submit التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index + 1)}
        className={`w-8 h-8 transition-all duration-200 ${
          index < rating 
            ? 'text-yellow-400 hover:text-yellow-300' 
            : 'text-gray-400 hover:text-yellow-200'
        }`}
      >
        <Star 
          className={`w-full h-full ${index < rating ? 'fill-current' : ''}`} 
        />
      </button>
    ));
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 ml-2 text-blue-400" />
        {hasReviewed ? 'Update تقييمك' : 'قيم هذا الكورس'}
      </h3>

      {hasReviewed && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
          <div className="flex items-center text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 ml-2" />
            لقد قمت بتقييم هذا الكورس مسبقاً. يمكنك Update تقييمك أدناه.
          </div>
        </div>
      )}

      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-white font-medium mb-2">التقييم</label>
        <div className="flex items-center space-x-1 space-x-reverse">
          {renderStars()}
          <span className="text-gray-300 mr-3">
            {rating > 0 ? `${rating}/5` : 'اختر التقييم'}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-white font-medium mb-2">
          تعليقك (اختياري)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شاركنا رأيك في الكورس..."
          className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none h-24"
          maxLength={500}
        />
        <div className="text-right text-gray-400 text-sm mt-1">
          {comment.length}/500
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitReview}
        disabled={isSubmitting || rating === 0}
        className={`w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
          rating === 0 || isSubmitting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{hasReviewed ? 'Update التقييم' : 'Submit التقييم'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ReviewSubmission;