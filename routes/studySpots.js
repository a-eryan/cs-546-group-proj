import { Router } from "express";
import { getAllStudySpots, uploadStudySpot } from "../data/studySpots.js";
import { checkDescription, checkLocation, checkNoiseLevel, checkTitle } from "../helpers.js";
import multer from "multer";
const router = Router();
const upload = multer({ dest: 'public/uploads/' });


router
  .route('/studyspots')
  .get(async(req,res) => {
    try {
      const allSpots = await getAllStudySpots();
      const user = req.session.user || null;
      const isSignedIn = !!user;
      return res.render('studySpots/list', {
        spots: allSpots,
        isSignedIn: isSignedIn,
        user: user
      });
    } catch (e) {
      return res.status(400).render('studySpots/list', { error: e });
    }
  })

  router
    .route('/studyspots/upload')
    .get(async(req,res) => {
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
    .post(upload.single("image"), async(req,res) => {
      console.log('REQ.FILE', req.file);
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

        const imagePath = req.file ? req.file.path : null;

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


export default router;