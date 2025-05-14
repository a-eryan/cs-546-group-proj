import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getStudySpotById } from '../data/studySpots.js';
import { forumPosts, users } from '../config/mongoCollections.js';
import { requireAuth } from '../middleware.js';

const router = Router();

// GET the user profile page
router.get('/', requireAuth, async (req, res) => {
	try {
		// Get the user from the session
		const user = req.session.user;

		if (!user || !user._id)
			return res.redirect('/login');

		const userObjectId = new ObjectId(user._id);
		const userCollection = await users();

		// Get the user's uploaded study spots
		const uploadedSpots = [];
		const validSpotIds = [];

		if (user.uploadedSpots && user.uploadedSpots.length > 0) {
			for (const spotId of user.uploadedSpots) {
				try {
					const spot = await getStudySpotById(spotId);
					uploadedSpots.push(spot);
					validSpotIds.push(spot._id);
				} catch {
					console.warn(`Study spot with ID ${spotId} not found`);
				}
			}

			// Update the user's uploadedSpots with only valid IDs
			await userCollection.updateOne(
				{ _id: userObjectId },
				{ $set: { uploadedSpots: validSpotIds.map(id => new ObjectId(id)) } }
			);
		}

		// Update the user's session
		const updatedUser = await userCollection.findOne({ _id: userObjectId });
		req.session.user = {
			...req.session.user,
			uploadedSpots: updatedUser.uploadedSpots.map(id => id.toString()),
			achievements: updatedUser.achievements || []
		};

		// Get the user's forum posts
		const forumCollection = await forumPosts();
		const userForums = await forumCollection.find({ userId: user._id }).toArray();

		const forums = [];
		forums.push(...userForums.map(post => ({
			...post,
			_id: post._id.toString(),
			userId: post.userId
		})));

		// Display the profile page
		return res.render('users/profile', {
			isSignedIn: true,
			user: { ...req.session.user, uploadedSpots },
			achievements: req.session.user.achievements || [],
			forums
		});
	} catch (e) {
		return res.status(500).render('error', {
			error: e,
			isSignedIn: true
		});
	}
});

export default router;