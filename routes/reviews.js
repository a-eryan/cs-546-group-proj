import { Router } from 'express';
import { checkID, checkReviewProperties } from '../helpers.js';
import * as reviews from '../data/reviews.js';

const router = Router();

const isAuthenticated = (req, res, next) => {
	if (!req.session.user)
		return res.status(401).json({ error: "You must be logged in to do this" });

	next();
};

// GET a specific review
router.get('/:reviewId', async (req, res) => {
	// Validate the review ID
	const reviewId = req.params.reviewId;

	try {
		checkID(reviewId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get the review by ID
	try {
		const review = await reviews.getReview(reviewId);
		return res.status(200).json(review);
	} catch (e) {
		return res.status(400).json({ error: e })
	}
});

// GET all reviews for a study spot
router.get('/spot/:spotId', async (req, res) => {
	// Validate the study spot ID
	const spotId = req.params.spotId;

	try {
		checkID(spotId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get all reviews for the study spot
	try {
		const reviewsList = await reviews.getAllReviews(req.params.spotId);
		return res.status(200).json(reviewsList);
	} catch (e) {
		return res.status(400).json({ error: e })
	}
});

// POST a new review
router.post('/:spotId', isAuthenticated, async (req, res) => {
	// Validate the review properties
	const spotId = req.params.spotId;
	const userId = req.session.user._id;
	const { title, content, rating } = req.body;

	const ratingNum = Number(rating);

	try {
		checkReviewProperties(spotId, userId, title, content, ratingNum);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Create the new review
	try {
		const review = await reviews.createReview(spotId, userId, title, content, ratingNum);
		return res.status(201).json(review);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.delete('/:reviewId', isAuthenticated, async (req, res) => {
	// Validate the review ID and user ID
	const reviewId = req.params.reviewId;
	const userId = req.session.user._id;

	try {
		checkID(reviewId);
		checkID(userId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get the review by ID and ensure the user is authorized to delete it
	try {
		const review = await reviews.getReview(reviewId);

		if (review.userId !== userId)
			return res.status(403).json({ error: "You are not authorized to delete this review" });
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Delete the review
	try {
		const result = await reviews.removeReview(reviewId);
		return res.status(200).json(result);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

export default router;