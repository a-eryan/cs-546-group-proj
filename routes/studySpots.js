import { getAllStudySpots, uploadStudySpot, getStudySpotById, updateStudySpot, deleteStudySpot } from '../data/studySpots.js';
import { checkID, checkDescription, checkLocation, checkNoiseLevel, checkResources, checkTitle } from '../helpers.js';
import { getAllReviews } from '../data/reviews.js';
import { getAllComments } from '../data/comments.js';
import { requireAuth } from '../middleware.js';
import { getEmailById } from '../data/users.js';
import { Router } from 'express';
import multer from 'multer';  
import path from 'path';
import xss from 'xss';

const router = Router();

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage});

// GET the study spots homepage
router.get('/', requireAuth, async (req, res) => {
	// Get the user from the session
	const user = req.session.user;

	if (!user || !user.email)
		return res.redirect('/login');

	try {
		// Get all study spots
		const studySpots = await getAllStudySpots();

		// Get every study spot's author email
		const spotsWithEmail = [];
		for (const spot of studySpots) {
			let authorEmail;

			try {
				authorEmail = await getEmailById(spot.userId);
			} catch {
				authorEmail = 'Unknown User';
			}

			spotsWithEmail.push({ ...spot, authorEmail });
		}

		// Render the study spots list page
		return res.render('studySpots/list', {
			spots: spotsWithEmail,
			isSignedIn: true,
			user: user
		});
	} catch (e) {
		return res.status(400).render('studySpots/list', { error: e });
	}
});

// GET the study spots upload page
router.get('/upload', requireAuth, async (req, res) => {
	try {
		return res.render('studySpots/create', { isSignedIn: true });
	} catch (e) {
		return res.status(500).render('error', { error: e, isSignedIn: true });
	}
})

// POST a new study spot
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
	try {
		// Validate the input
		const title = checkTitle(xss(req.body.title));
		const description = checkDescription(xss(req.body.description));
		const location = checkLocation(xss(req.body.location));
		const noiseLevel = checkNoiseLevel(xss(req.body.noiseLevel));
		const resources = checkResources(xss(req.body.resourcesNearby));

		// Upload the study spot
		const imagePath = req.file ? `/${req.file.path}` : null;
		const studySpot = await uploadStudySpot(req.session.user._id, title, description, location, resources, noiseLevel, imagePath);
		req.session.user.uploadedSpots.push(studySpot._id);

		return res.redirect('/studyspots');
	} catch (e) {
		return res.status(400).render('studySpots/create', { error: e, isSignedIn: true });
	}
});

// GET a specific study spot
router.get('/:spotId', requireAuth, async (req, res) => {
  try {

    const spotId = checkID(xss(req.params.spotId));
    const spot = await getStudySpotById(spotId);

    const reviews = await getAllReviews(spotId);
    
    const reviewsWithEmail = [];
    for (const review of reviews) {
      let authorEmail;
      try {
        authorEmail = await getEmailById(review.userId);
      } catch {
        authorEmail = 'Unknown User';
      }
      reviewsWithEmail.push({
        ...review,
        authorEmail
      });
    }

    const comments = await getAllComments(spotId);

    return res.render('studySpots/spot', {
      title: spot.title,
      spot,
      reviews: reviewsWithEmail, 
      comments,
      isSignedIn: true,
      user: req.session.user
    });
  } catch (e) {
    return res.status(400).render('error', { error: e, isSignedIn: true });
  }
});

// GET the edit page for a specific study spot
router.get('/:spotId/edit', requireAuth, async (req, res) => {
	const user = req.session.user;
	
	try {
		// Get the study spot by ID
		const spotId = checkID(xss(req.params.spotId));
		const spot = await getStudySpotById(spotId);

		// Check if the user is the owner of the study spot
		if (user._id !== spot.userId)
			return res.status(403).render('error', { error: "You are not authorized to edit this study spot", isSignedIn: true });

		// Get the checked resources
		const spotResources = spot.resourcesNearby || [];
		const resources = ['printer', 'water fountain', 'vending machine', 'scanner', 'whiteboard', 'outlets', 'external monitors']
		.map(resource => ({
			name: resource,
			checked: spotResources.includes(resource)
		}));

		return res.render('studySpots/edit', {
			spot,
			resources,
			user,
			isSignedIn: true
		});
	} catch (e) {
		return res.status(400).render('studySpots/edit', { error: e });
	}
});

// POST an edited study spot
router.post('/:spotId/edit', requireAuth, upload.single('image'), async (req, res) => {
	const user = req.session.user;

	try {
		// Get the study spot by ID
		const spotId = checkID(xss(req.params.spotId));
		const spot = await getStudySpotById(spotId);

		// Check if the user is the owner of the study spot
		if (user._id !== spot.userId)
			return res.status(403).render('error', { error: "You are not authorized to edit this study spot", isSignedIn: true });

		// Validate the input
		const title = checkTitle(xss(req.body.title));
		const description = checkDescription(xss(req.body.description));
		const location = checkLocation(xss(req.body.location));
		const noiseLevel = checkNoiseLevel(xss(req.body.noiseLevel));
		const resources = checkResources(xss(req.body.resourcesNearby));

		// Update the study spot
		const imagePath = req.file ? `/${req.file.path}` : spot.imageUrl;
		await updateStudySpot(spotId, title, description, location, resources, noiseLevel, imagePath);
		return res.redirect(`/studyspots/${spotId}`);
	} catch (e) {
		return res.status(400).render('studySpots/edit', { error: e, isSignedIn: true });
	}
});

// DELETE a study spot
router.post('/:spotId/delete', requireAuth, async (req, res) => {
	const user = req.session.user;

	try {
		// Get the study spot by ID
		const spotId = checkID(xss(req.params.spotId));
		const spot = await getStudySpotById(spotId);

		// Check if the user is the owner of the study spot
		if (user._id !== spot.userId)
			return res.status(403).render('error', { error: "You are not authorized to delete this study spot", isSignedIn: true });

		// Delete the study spot
		await deleteStudySpot(spotId);
		req.session.user.uploadedSpots = req.session.user.uploadedSpots.filter(id => id !== spotId);
		return res.redirect('/studyspots');
	} catch (e) {
		return res.status(400).render('error', { error: e, isSignedIn: true });
	}
});
  
export default router;