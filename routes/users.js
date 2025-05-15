import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getStudySpotById } from '../data/studySpots.js';
import { forumPosts, users } from '../config/mongoCollections.js';
import { requireAuth } from '../middleware.js';
import { setProfilePic } from '../data/users.js';
import multer from 'multer';
import path from 'path';

const router = Router();

const avatarStorage = multer.diskStorage({
	destination: 'public/uploads/avatars',
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${req.session.user._id}-${Date.now()}${ext}`);
	}
});

const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
const uploadAvatar = multer({
	storage: avatarStorage,
	limits: { fileSize: 5 * 1024 * 1024 }, //5mb limit
	fileFiler: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, allowed.includes(ext));
	}
});

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

// POST to upload a profile picture
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), async (req, res) => {
	try{
		if (!req.file){
			throw 'No file uploaded';
		}
		const relPath = `/${req.file.path}`;
		await setProfilePic(req.session.user._id, relPath);

		req.session.user.profilePic = relPath;

		return res.redirect('/profile')

	} catch (e) {
		return res.status(400).render('error', {error: e.toString(), isSignedIn: true});
	}
});

export default router;