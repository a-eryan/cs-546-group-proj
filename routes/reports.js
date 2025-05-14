import { Router } from 'express';
import { isAuthenticated } from '../middleware.js';
import { checkString, checkID } from '../helpers.js';
import * as reports from '../data/reports.js';

const router = Router();

// POST a new study spot report
router.post('/spot/:spotId', isAuthenticated, async (req, res) => {
	// Validate the report properties
	const spotId = req.params.spotId;
	const userId = req.session.user._id;
	const { reason } = req.body;

	try {
		checkID(spotId);
		checkID(userId);
		checkString(reason);
	} catch {
		return res.status(400).json({ error: "A report must have a valid content ID, reporter ID, and reason" });
	}

	if (reason.length > 100)
		return res.status(400).json({ error: "The report reason cannot exceed 100 characters" });

	// Create the report
	try {
		const report = await reports.createStudySpotReport(spotId, userId, reason);
		return res.status(200).json({ reportId: report });
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

// POST a new forum post report
router.post('/forum/:forumId', isAuthenticated, async (req, res) => {
	// Validate the report properties
	const forumId = req.params.forumId;
	const userId = req.session.user._id;
	const { reason } = req.body;

	try {
		checkID(forumId);
		checkID(userId);
		checkString(reason);
	} catch {
		return res.status(400).json({ error: "A report must have a valid content ID, reporter ID, and reason" });
	}

	if (reason.length > 100)
		return res.status(400).json({ error: "The report reason cannot exceed 100 characters" });

	// Create the report
	try {
		const report = await reports.createForumPostReport(forumId, userId, reason);
		return res.status(200).json({ reportId: report });
	} catch (e) {
		return res.status(400).json({ error: e });
	}
});

export default router;