import { Router } from "express";
import { getStudySpotById } from "../data/studySpots.js";
import { requireAuth } from "../middleware.js";
import { isAuthenticated } from '../middleware.js';
import { checkContent, checkID, checkReviewProperties } from '../helpers.js';
import * as reviews from '../data/reviews.js';
import xss from 'xss';

const router = Router();

// GET a specific review
router.get('/:reviewId', async (req, res) => {
	try {
		const reviewId = checkID(xss(req.params.reviewId));
		const review = await reviews.getReview(reviewId);
		return res.status(200).json(review);
	} catch (e) {
		return res.status(400).json({ error: e })
	}
});

// GET all reviews for a study spot
router.get('/spot/:spotId', async (req, res) => {
	try {
		const spotId = checkID(xss(req.params.spotId));
		const reviewsList = await reviews.getAllReviews(spotId);
		return res.status(200).json(reviewsList);
	} catch (e) {
		return res.status(400).json({ error: e })
	}
});

// POST a new review
router.post('/:spotId', isAuthenticated, async (req, res) => {
	// Validate the review properties
	let spotId = xss(req.params.spotId);
	let userId = req.session.user._id;
	let title = xss(req.body.title);
	let content = xss(req.body.content);
	let rating = xss(req.body.rating);
	let ratingNum = Number(rating);

	// Create the new review
	try {
		({spotId, userId, title, content, rating} = checkReviewProperties(spotId, userId, title, content, ratingNum));
		const review = await reviews.createReview(spotId, userId, title, content, ratingNum);
		return res.status(201).json(review);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

router.delete('/:reviewId', isAuthenticated, async (req, res) => {
	// Validate the review ID and user ID
	let reviewId = xss(req.params.reviewId);
	let userId = req.session.user._id;

	// Get the review by ID and ensure the user is authorized to delete it
	try {
		reviewId = checkID(reviewId);
		userId = checkID(userId);
		const review = await reviews.getReview(reviewId);

		if (review.userId !== userId)
			return res.status(403).json({ error: "You are not authorized to delete this review" });
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Delete the review
	try {
		const result = await reviews.deleteReview(reviewId); // Use the imported alias
		return res.status(200).json(result);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

// GET review edit form
router.get('/:reviewId/edit', requireAuth, async (req, res) => {
  try {
		// Validate the review ID
    const reviewId = checkID(xss(req.params.reviewId));
    const userId = req.session.user._id;
    
		// Get the review by ID
    const review = await reviews.getReview(reviewId);
    
    // Check if the user is authorized to edit the review
    if (review.userId !== userId)
      return res.status(403).render('error', {
        error: "You are not authorized to edit this review",
        user: req.session.user,
        isSignedIn: true
      });
    
    // Get the study spot for context
    const studySpot = await getStudySpotById(review.spotId);
    
    return res.render('reviews/edit', {
      title: 'Edit Review',
      review,
      spot: studySpot,
      isSignedIn: true
    });
  } catch (e) {
    return res.status(400).render('error', { error: e, isSignedIn: true });
  }
});

// POST review edit
router.post('/:reviewId/edit', requireAuth, async (req, res) => {
	let reviewId = xss(req.params.reviewId);
	let userId = req.session.user._id;
	let title = xss(req.body.title);
	let content = xss(req.body.content);
	let rating = xss(req.body.rating);

	let review;
	let studySpot;

	try {
		// Get the review by ID
		reviewId = checkID(reviewId);
		review = await reviews.getReview(reviewId);
		studySpot = await getStudySpotById(review.spotId);
	} catch (e) {
		return res.status(400).render('error', {
			error: e,
			isSignedIn: true
		});
	}

	try {
		// Check if the user is authorized to edit the review
		if (review.userId !== userId)
			return res.status(403).render('error', {
				error: 'You are not authorized to edit this review',
				isSignedIn: true
			});

		// Validate the review properties
		let spotId = review.spotId;
		let ratingNum = Number(rating);
		({ spotId, userId, title, content, rating } = checkReviewProperties(spotId, userId, title, content, ratingNum));

		await reviews.updateReview(reviewId, userId, title, content, ratingNum);
		return res.redirect(`/studyspots/${spotId}`);
	} catch (e) {
		return res.status(400).render('reviews/edit', {
			title: 'Edit Review',
      error: e,
      isSignedIn: true,
			review: {
				_id: reviewId,
				title,
				content,
				rating
			},
			spot: studySpot
		});
	}
});

// DELETE review
router.post('/:reviewId/delete', requireAuth, async (req, res) => {
  try {
    const reviewId = checkID(xss(req.params.reviewId));
    const userId = req.session.user._id;
    const spotId = checkID(xss(req.body.spotId));
    
    // Get the review to check ownership
    const review = await reviews.getReview(reviewId);
    
    // Verify user owns the review
    if (review.userId !== userId)
      return res.status(403).render('error', {
        error: 'You can only delete your own reviews',
        user: req.session.user,
        isSignedIn: true
      });
    
    // Delete the review
    await reviews.deleteReview(reviewId);
    
    // Redirect back to the study spot
    return res.redirect(`/studyspots/${spotId}`);
    
  } catch (e) {
    return res.status(400).render('error', {
      error: e.toString(),
      user: req.session.user,
      isSignedIn: true
    });
  }
});

// POST a new comment on a review
router.post('/comments/:reviewId', isAuthenticated, async (req, res) => {
	let reviewId = xss(req.params.reviewId);
  let userId = req.session.user._id;
  let content = xss(req.body.content);

  try {
    reviewId = checkID(reviewId);
    userId = checkID(userId);
    content = checkContent(content);
  } catch (e) {
    return res.status(400).json({ error: e });
  }

  try {
    const comment = await reviews.addCommentToReview(reviewId, userId, content);
    return res.status(201).json(comment);
  } catch (e) {
    return res.status(500).json({ error: e.toString() });
  }
});

export default router;