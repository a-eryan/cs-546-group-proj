import { Router } from "express";
import { getAllStudySpots, uploadStudySpot, getStudySpotById } from "../data/studySpots.js";
import { checkDescription, checkLocation, checkNoiseLevel, checkTitle } from "../helpers.js";
import { getAllReviews } from "../data/reviews.js";
import { requireAuth } from "../middleware.js";
import { findEmailById } from "../data/forumPosts.js";
import multer from "multer";  
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage});


router
  .route('/studyspots')
  .get(requireAuth, async(req,res) => {
    try {
      const allSpots = await getAllStudySpots();
      const user = req.session.user || null;
      const isSignedIn = !!user;

      const spotsWithEmail = [];
      for (const spot of allSpots){
        let posterEmail = 'Unknown';
        try {
          const {email} = await findEmailById(spot.poster.toString());
          posterEmail = email;
        } catch (e) {
          return res.status(400).render('studySpots/list', { error: e }); 
        }

        spotsWithEmail.push({
          ...spot,
          posterEmail
        })
      }
      return res.render('studySpots/list', {
        spots: spotsWithEmail,
        isSignedIn: isSignedIn,
        user: user
      });
    } catch (e) {
      return res.status(400).render('studySpots/list', { error: e });
    }
  })

  router
    .route('/studyspots/upload')
    .get(requireAuth, async(req,res) => {
      try {
        const user = req.session.user || null;
        const isSignedIn = !!user;
        return res.render('studySpots/create', {
          isSignedIn: isSignedIn
        });
      } catch (e) {
        return res.status(400).render('studySpots/create', { error: e });
      }
    })
    .post(requireAuth, upload.single("image"), async(req,res) => {
      try {
        let title = req.body.title;
        let description = req.body.description;
        let location = req.body.location;
        let noiseLevel = req.body.noiseLevel;
        let resources = req.body.resourcesNearby;

        if (!title || !description || !location || !noiseLevel || !resources)
          throw new Error('All fields need to be given.')
        title = checkTitle(title);
        description = checkDescription(description);
        location = checkLocation(location);
        noiseLevel = checkNoiseLevel(noiseLevel);

        if (!resources){
          resources = [];
        } else if (typeof resources === 'string') {
          resources = [resources];
        }

        const imagePath = req.file ? `/${req.file.path}` : null;


        const uploaded = await uploadStudySpot(
          title,
          description,
          req.session.user._id,
          location,
          resources,
          noiseLevel,
          imagePath
        );

        if (uploaded.uploadCompleted && uploaded.insertedId){
          req.session.user.uploadedSpots.push(uploaded.insertedId);
          return res.redirect('/studyspots');
        } else {
          return res.status(400).render('studySpots/create', {
            error: "Issue in creating post"
          });
        }
      } catch (e) {
        return res.status(400).render('studySpots/create', { error: e });
      }
    })

  router.get('/studyspots/:id', requireAuth, async (req, res) => {
    try {
      const spot = await getStudySpotById(req.params.id);
      const reviews = await getAllReviews(spot._id);
      const user = req.session.user || null;
      const signed = !!user;

      return res.render('studySpots/spot', {
        title: spot.title,
        spot,
        reviews,
        isSignedIn: signed,
        user
    });
  } catch (e) {
    return res.status(404).render('error', {
      error: e.toString(),
      isSignedIn: !!req.session.user,
      user: req.session.user
    });
  }
});

router
  .route('/studyspots/:id/edit')
  .get(requireAuth, async(req, res) => {
    try{
      const spot = await getStudySpotById(req.params.id)
      const user = req.session.user || null;
      const isSignedIn = !!user;
      const spotResources = spot.resourcesNearby || [];

      const resources = [
        "printer",
        "water fountain",
        "vending machine",
        "scanner",
        "whiteboard",
        "outlets",
        "external monitors"
      ].map(r => ({
        name: r,
        checked: spotResources.includes(r)
      }));

      if (spot.poster.toString() !== user._id.toString()) {
        return res.status(403).render("error", {
          error: "You are not authorized to edit this study spot.",
          isSignedIn
        });
      }

      return res.render('studySpots/edit', {
        spot,
        isSignedIn: isSignedIn,
        user: user,
        resources
      });
    } catch (e) {
      return res.status(400).render('studySpots/create', { error: e });
    }
  })

export default router;
