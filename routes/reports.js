import { Router } from 'express';
import { isAuthenticated } from '../middleware.js';
import { checkString, checkID } from '../helpers.js';
import * as reports from '../data/reports.js';

const router = Router();

router.get('/spot/:spotId', isAuthenticated, async (req, res) => {
    try {
        const spotId = req.params.spotId;
        checkID(spotId);
        
        res.render('users/report', {
            title: 'Report Study Spot',
            type: 'spot',
            id: spotId,
            isSpot: true,
            returnPath: 'studyspots',
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

router.get('/forum/:forumId', isAuthenticated, async (req, res) => {
    try {
        const forumId = req.params.forumId;
        checkID(forumId);
        
        res.render('users/report', {
            title: 'Report Forum Post',
            type: 'forum',
            id: forumId,
            isSpot: false,
            returnPath: 'forums',
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
        
        if (reason.length > 100)
            return res.status(400).render('users/report', {
                title: 'Report Study Spot',
                type: 'spot',
                id: spotId,
                isSpot: true,
                returnPath: 'studyspots',
                error: "The report reason cannot exceed 100 characters",
                reason: reason,
                user: req.session.user,
                isSignedIn: true
            });
            
        const report = await reports.createStudySpotReport(spotId, userId, reason);
        
        return res.redirect(`/studyspots/${spotId}`);
    } catch (e) {
        return res.status(400).render('users/report', {
            title: 'Report Study Spot',
            type: 'spot',
            id: spotId,
            isSpot: true,
            returnPath: 'studyspots',
            error: e.toString(),
            reason: reason,
            user: req.session.user,
            isSignedIn: true
        });
    }
});
router.post('/forum/:forumId', isAuthenticated, async (req, res) => {	
	const forumId = req.params.forumId;
	const userId = req.session.user._id;
	const { reason } = req.body;

	try {
		checkID(forumId);
		checkID(userId);
		checkString(reason);
		
		if (reason.length > 100)
			return res.status(400).render('users/report', {
				title: 'Report Forum Post',
				type: 'forum',
				id: forumId,
				isSpot: false,
				returnPath: 'forums',
				error: "The report reason cannot exceed 100 characters",
				reason: reason,
				user: req.session.user,
				isSignedIn: true
			});
			
		const report = await reports.createForumPostReport(forumId, userId, reason);
		
		return res.redirect(`/forums/${forumId}`);
	} catch (e) {
		return res.status(400).render('users/report', {
			title: 'Report Forum Post',
			type: 'forum',
			id: forumId,
			isSpot: false,
			returnPath: 'forums',
			error: e.toString(),
			reason: reason,
			user: req.session.user,
			isSignedIn: true
		});
	}
});
export default router;