import { Router } from 'express';
import { isAuthenticated } from '../middleware.js';
import { addCommentToReview } from '../data/reviews.js';
import { checkID, checkString } from '../helpers.js';

const router = Router();

router.post('/:reviewId', isAuthenticated, async (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.session.user._id;
  const { content } = req.body;

  try {
    checkID(reviewId);
    checkID(userId);
    checkString(content);
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const comment = await addCommentToReview(reviewId, userId, content);
    return res.status(201).json(comment);
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
});

export default router;
