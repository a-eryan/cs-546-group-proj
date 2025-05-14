import { Router } from "express";
import { getReview, updateReview, deleteReview, createReview, getAllReviews } from "../data/reviews.js";
import { getStudySpotById } from "../data/studySpots.js";
import { checkID } from "../helpers.js";
import { requireAuth } from "../middleware.js";
import { isAuthenticated } from '../middleware.js';
import { checkString, checkID, checkReviewProperties } from '../helpers.js';
import * as reviews from '../data/reviews.js';
import xss from 'xss';

const router = Router();

// GET a specific review
router.get('/:reviewId', async (req, res) => {
	// Validate the review ID
	const reviewId = xss(req.params.reviewId);

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
	const spotId = xss(req.params.spotId);

	try {
		checkID(spotId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get all reviews for the study spot
	try {
		const reviewsList = await getAllReviews(req.params.spotId); // Use imported function
		return res.status(200).json(reviewsList);
	} catch (e) {
		return res.status(400).json({ error: e })
	}
});

// POST a new review
router.post('/:spotId', isAuthenticated, async (req, res) => {
	// Validate the review properties
	const spotId = xss(req.params.spotId);
	const userId = req.session.user._id;
	const { title, content, rating } = xss(req.body);

	const ratingNum = Number(rating);

	try {
		checkReviewProperties(spotId, userId, title, content, ratingNum);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Create the new review
	try {
		const review = await createReview(spotId, userId, title, content, ratingNum);
		return res.status(201).json(review);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

router.delete('/:reviewId', isAuthenticated, async (req, res) => {
	// Validate the review ID and user ID
	const reviewId = xss(req.params.reviewId);
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
		const result = await deleteReview(reviewId); // Use the imported alias
		return res.status(200).json(result);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

// GET review edit form
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    
    checkID(reviewId);
    
    const review = await getReview(reviewId);
    
    if (!review) {
      return res.status(404).render('error', {
        error: 'Review not found',
        user: req.session.user,
        isSignedIn: true
      });
    }
    
    // Verify user owns the review
    if (review.userId !== userId.toString()) {
      return res.status(403).render('error', {
        error: 'You can only edit your own reviews',
        user: req.session.user,
        isSignedIn: true
      });
    }
    
    // Get the study spot for context
    const studySpot = await getStudySpotById(review.spotId);
    
    return res.render('reviews/edit', {
      title: 'Edit Review',
      review,
      spot: studySpot,
      user: req.session.user,
      isSignedIn: true
    });
    
  } catch (e) {
    return res.status(400).render('error', {
      error: e.toString(),
      user: req.session.user,
      isSignedIn: true
    });
  }
});

// POST review edit
router.post('/:id/edit', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    const { title, content, rating, spotId } = req.body;  // Make sure to get spotId from form
    
    // Add spotId to the form in edit.handlebars
    const updatedReview = await updateReview(
      reviewId,
      userId.toString(),
      title,
      content,
      parseInt(rating)
    );
    
    // Get spotId from the original review if not in form
    const review = await getReview(reviewId);
    return res.redirect(`/studyspots/${review.spotId}`);
  } catch (e) {
    const review = await getReview(req.params.id);
    const studySpot = await getStudySpotById(review.spotId);
    
    return res.status(400).render('reviews/edit', {
      title: 'Edit Review',
      error: e.toString(),
      review: {
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        rating: req.body.rating
      },
      spot: studySpot,
      user: req.session.user,
      isSignedIn: true
    });
  }
});

// DELETE review
router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.session.user._id;
    const spotId = req.body.spotId;
    
    checkID(reviewId);
    checkID(spotId);
    
    // Get the review to check ownership
    const review = await getReview(reviewId);
    
    if (!review) {
      return res.status(404).render('error', {
        error: 'Review not found',
        user: req.session.user,
        isSignedIn: true
      });
    }
    
    // Verify user owns the review
    if (review.userId !== userId.toString()) {
      return res.status(403).render('error', {
        error: 'You can only delete your own reviews',
        user: req.session.user,
        isSignedIn: true
      });
    }
    
    // Delete the review - removeReview only takes reviewId
    await deleteReview(reviewId); // Fixed parameter list
    
    // Redirect back to the study spot
    return res.redirect(`/studyspots/${spotId}`);
    
  } catch (e) {
    return res.status(400).render('error', {
      error: e.toString(),
      user: req.session.user,
      isSignedIn: true
    });
  }
};

router.post('/comments/:reviewId', isAuthenticated, async (req, res) => {
	const reviewId = xss(req.params.reviewId);
  const userId = req.session.user._id;
  const { content } = xss(req.body);

  try {
    checkID(reviewId);
    checkID(userId);
    checkString(content);
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