import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config/firebase';
import { Star, User, MessageSquare, Calendar, Reply } from 'lucide-react';

const ReviewsDisplay = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (courseId) {
      loadReviews();
    }
  }, [courseId]);

  useEffect(() => {
    calculateStats();
  }, [reviews]);

  const loadReviews = () => {
    // Use courses/{courseId}/reviews path instead of course_reviews/{courseId}
    const reviewsRef = ref(db, `courses/${courseId}/reviews`);
    onValue(reviewsRef, (snapshot) => {
      const reviewsData = [];
      snapshot.forEach((childSnapshot) => {
        reviewsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by creation date (newest first)
      reviewsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(reviewsData);
      setLoading(false);
    });
  };

  const calculateStats = () => {
    if (reviews.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    setStats({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      ratingDistribution: distribution
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-400" /> {/* Changed ml-2 to mr-2 */}
          Student Reviews ({stats.totalReviews})
        </h3>

        {stats.totalReviews > 0 ? (
          <>
            <div className="flex items-center mb-4">
              <div className="text-3xl font-bold text-white mr-4">{stats.averageRating}</div> {/* Changed ml-4 to mr-4 */}
              <div>
                <div className="flex items-center mb-1">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <div className="text-gray-400 text-sm">from {stats.totalReviews} reviews</div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating];
                const percentage = (count / stats.totalReviews) * 100;
                return (
                  <div key={rating} className="flex items-center space-x-3"> {/* Removed space-x-reverse */}
                    <div className="flex items-center space-x-1 w-16"> {/* Removed space-x-reverse */}
                      <span className="text-white text-sm">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">No reviews yet</p>
            <p className="text-gray-500 text-sm">Be the first to rate this course</p>
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Individual Reviews</h4>
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3"> {/* Removed space-x-reverse */}
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-white font-semibold">{review.studentName || 'student'}</h5>
                    <div className="flex items-center space-x-2 text-sm text-gray-400"> {/* Removed space-x-reverse */}
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(review.createdAt).toLocaleDateString('en-US')}</span> {/* Changed ar-EG */}
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-yellow-400 font-semibold">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Review Content */}
              {review.comment && (
                <div className="mb-4">
                  <p className="text-gray-200 leading-relaxed">{review.comment}</p>
                </div>
              )}

              {/* Instructor Reply */}
              {review.instructorReply && (
                <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border-l-4 border-blue-400"> {/* Changed border-r-4 to border-l-4 */}
                  <div className="flex items-center mb-2">
                    <Reply className="w-4 h-4 text-blue-400 mr-2" /> {/* Changed ml-2 to mr-2 */}
                    <span className="text-blue-300 font-semibold">Instructor Reply</span>
                    <span className="text-gray-400 text-sm ml-auto"> {/* Changed mr-auto to ml-auto */}
                      {new Date(review.instructorReply.timestamp).toLocaleDateString('en-US')} {/* Changed ar-EG */}
                    </span>
                  </div>
                  <p className="text-gray-200">{review.instructorReply.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;