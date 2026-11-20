import { Review } from '../../database/models/Review.js';
import { User } from '../../database/models/User.js';
import { fallbackStore, isMongoConnected } from '../../database/index.js';

export const createReview = async (req, res, next) => {
  try {
    const { project_id, reviewer_id, reviewee_id, rating, comment } = req.body;
    const reviewerId = req.user ? req.user.id : reviewer_id;

    if (!project_id || !reviewerId || !reviewee_id || !rating) {
      return res.status(400).json({ error: 'Missing review fields' });
    }

    const newReview = {
      _id: 'rev_' + Date.now(),
      id: 'rev_' + Date.now(),
      project_id,
      reviewer_id: reviewerId,
      reviewee_id,
      rating: Number(rating),
      comment: comment || '',
      created_at: new Date()
    };

    if (isMongoConnected) {
      const created = await Review.create(newReview);
      const allReviews = await Review.find({ reviewee_id });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await User.findByIdAndUpdate(reviewee_id, {
        rating_avg: Number(avg.toFixed(1)),
        rating_count: allReviews.length
      });
      return res.status(201).json(created);
    }

    fallbackStore.reviews.unshift(newReview);
    const userReviews = fallbackStore.reviews.filter(r => r.reviewee_id === reviewee_id);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const user = fallbackStore.users.find(u => u.id === reviewee_id);
    if (user) {
      user.rating_avg = Number(avg.toFixed(1));
      user.rating_count = userReviews.length;
    }

    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
};

export const getReviewsForUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (isMongoConnected) {
      const reviews = await Review.find({ reviewee_id: userId }).sort({ createdAt: -1 });
      const enriched = await Promise.all(reviews.map(async r => {
        const reviewer = await User.findById(r.reviewer_id);
        return {
          ...r.toObject(),
          reviewer_name: reviewer?.name || 'Anonymous',
          reviewer_avatar: reviewer?.avatar || ''
        };
      }));
      return res.json(enriched);
    }

    const reviews = fallbackStore.reviews
      .filter(r => r.reviewee_id === userId)
      .map(r => {
        const reviewer = fallbackStore.users.find(u => u.id === r.reviewer_id);
        return {
          ...r,
          reviewer_name: reviewer?.name || 'Anonymous',
          reviewer_avatar: reviewer?.avatar || ''
        };
      });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
