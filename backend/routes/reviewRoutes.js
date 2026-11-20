import express from 'express';
import { createReview, getReviewsForUser } from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReview);
router.get('/user/:userId', getReviewsForUser);

export default router;
