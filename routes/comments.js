import { Router } from 'express';
import { checkID, checkString } from '../helpers.js';
import { isAuthenticated } from '../middleware.js';
import * as comments from '../data/comments.js';

const router = Router();

// GET a specific comment
router.get('/:commentId', async (req, res) => {
	// Validate the comment ID
	const commentId = req.params.commentId;

	try {
		checkID(commentId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get the comment by ID
	try {
		const comment = await comments.getComment(commentId);
		return res.status(200).json(comment);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

// GET all comments for a study spot
router.get('/spot/:spotId', async (req, res) => {
	// Validate the study spot ID
	const spotId = req.params.spotId;

	try {
		checkID(spotId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Get all comments for the study spot
	try {
		const commentsList = await comments.getAllComments(spotId);
		return res.status(200).json(commentsList);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

// POST a new comment
router.post('/:spotId', isAuthenticated, async (req, res) => {
	// Validate the comment properties
	const spotId = req.params.spotId;
	const userId = req.session.user._id;
	const { content } = req.body;

	try {
		checkID(spotId);
		checkID(userId);
		checkString(content);
	} catch {
		return res.status(400).json({ error: "A comment must have a valid study spot, commenter, and content" });
	}

	// Create the comment
	try {
		const comment = await comments.createComment(spotId, userId, content);
		return res.status(201).json(comment);
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

router.delete('/:commentId', isAuthenticated, async (req, res) => {
	// Validate the comment ID and user ID
	const commentId = req.params.commentId;
	const userId = req.session.user._id;

	try {
		checkID(commentId);
		checkID(userId);
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Ensure the user is authorized to delete the comment
	// TODO: Check if the user is admin. Same for reviews
	try {
		const comment = await comments.getComment(commentId);

		if (comment.userId !== userId)
			return res.status(403).json({ error: "You are not authorized to delete this comment" });
	} catch (e) {
		return res.status(400).json({ error: e });
	}

	// Delete the comment
	try {
		const result = await comments.removeComment(commentId);
		return res.status(200).json(result);
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

export default router;