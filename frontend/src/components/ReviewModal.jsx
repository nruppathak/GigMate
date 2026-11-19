import React, { useState } from 'react';
import { X, Star, Sparkles, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { submitReview } from '../api';

export default function ReviewModal({ reviewData, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!reviewData) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please write a brief review comment.');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        project_id: reviewData.projectId,
        reviewer_id: reviewData.reviewerId,
        reviewee_id: reviewData.revieweeId,
        rating,
        comment: comment.trim()
      });
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 text-gray-900 p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff6200] border border-orange-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Star className="w-6 h-6 fill-[#ff6200] text-[#ff6200]" />
          </div>
          <h3 className="text-xl font-black text-gray-900">Leave a Review</h3>
          <p className="text-xs text-gray-500 mt-1">
            Share feedback for <strong className="text-gray-900 font-bold">{reviewData.revieweeName}</strong> on this completed project.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Overall Rating</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#ff6200]">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional (5.0)' :
               rating === 4 ? '⭐⭐⭐⭐ Great Work (4.0)' :
               rating === 3 ? '⭐⭐⭐ Satisfactory (3.0)' :
               rating === 2 ? '⭐⭐ Needs Improvement (2.0)' : '⭐ Unsatisfactory (1.0)'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Written Review & Testimonial
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Highlight their communication, technical quality, timeliness, and how they met expectations..."
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#ff6200] focus:ring-1 focus:ring-[#ff6200] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-[#ff6200] hover:bg-[#e55800] text-white rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
