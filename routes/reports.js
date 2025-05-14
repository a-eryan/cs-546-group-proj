import { Router } from 'express';
import { requireAuth } from '../middleware.js';
import { checkContent, checkID } from '../helpers.js';
import * as reports from '../data/reports.js';
import xss from 'xss';

const router = Router();

// GET the report page for a study spot
router.get('/spot/:spotId', requireAuth, async (req, res) => {
	try {
		const spotId = checkID(xss(req.params.spotId));
		
		res.render('users/report', {
			title: 'Report Study Spot',
			type: 'spot',
			id: spotId,
			isSpot: true,
			returnPath: 'studyspots',
			isSignedIn: true
		});
	} catch (e) {
		return res.status(400).render('error', {
			error: e,
			isSignedIn: true
		});
	}
});

// GET the report page for a forum post
router.get('/forum/:forumId', requireAuth, async (req, res) => {
	try {
		const forumId = checkID(xss(req.params.forumId));
		
		res.render('users/report', {
			title: 'Report Forum Post',
			type: 'forum',
			id: forumId,
			isSpot: false,
			returnPath: 'forums',
			isSignedIn: true
		});
	} catch (e) {
		return res.status(400).render('error', {
			error: e,
			isSignedIn: true
		});
	}
});

// POST a new study spot report
router.post('/spot/:spotId', requireAuth, async (req, res) => {
	// Validate the report properties
	let spotId = xss(req.params.spotId);
	let userId = req.session.user._id;
	let reason = xss(req.body.reason);

	try {
		spotId = checkID(spotId);
		userId = checkID(userId);
		reason = checkContent(reason);

		if (reason.length < 5)
			throw 'Please provide a more detailed reason (at least 5 characters)';

		await reports.createStudySpotReport(spotId, userId, reason);
		return res.redirect(`/studyspots/${spotId}`);
	} catch (e) {
		return res.status(400).render('users/report', {
			title: 'Report Study Spot',
			type: 'spot',
			id: spotId,
			isSpot: true,
			returnPath: 'studyspots',
			error: e,
			reason: reason,
			isSignedIn: true
		});
	}
});


// POST a new forum post report
router.post('/forum/:forumId', requireAuth, async (req, res) => {	
	let forumId = xss(req.params.forumId);
	let userId = req.session.user._id;
	let reason = xss(req.body.reason);

	try {
		forumId = checkID(forumId);
		userId = checkID(userId);
		reason = checkContent(reason);

		if (reason.length < 5)
			throw 'Please provide a more detailed reason (at least 5 characters)';

		await reports.createForumPostReport(forumId, userId, reason);
		return res.redirect(`/forums/${forumId}`);
	} catch (e) {
		return res.status(400).render('users/report', {
			title: 'Report Forum Post',
			type: 'forum',
			id: forumId,
			isSpot: false,
			returnPath: 'forums',
			error: e,
			reason: reason,
			isSignedIn: true
		});
	}
});

export default router;