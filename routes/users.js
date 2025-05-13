import { Router } from "express";
import { ObjectId } from 'mongodb';
import { getStudySpotById } from "../data/studySpots.js";
import { forumPosts, users } from "../config/mongoCollections.js";
import { requireAuth } from "../middleware.js";

const router = Router();

router.route('/profile').get(requireAuth, async (req, res) => {
  try {
    const user = req.session.user || null;
    const isSignedIn = !!user;

    let uploadedSpots = [];
    const validSpotIds = [];

    if (user && user.uploadedSpots) {
      for (let spotId of user.uploadedSpots) {
        try {
          const spot = await getStudySpotById(spotId);
          uploadedSpots.push(spot);
          validSpotIds.push(spot._id.toString());
        } catch (e) {
          console.warn(`Study spot with ID ${spotId} not found. Skipping.`);
        }
      }

      // Update user's uploadedSpots in the database
      const userCollection = await users();
      await userCollection.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { uploadedSpots: validSpotIds.map(id => new ObjectId(id)) } }
      );

      // Refresh session data with updated uploadedSpots
      const updatedUser = await userCollection.findOne({ _id: new ObjectId(user._id) });
      req.session.user = {
        ...req.session.user,
        uploadedSpots: updatedUser.uploadedSpots.map(id => id.toString())
      };
    }

    let forums = [];
    if (user && user._id) {
      const forumCollection = await forumPosts();
      forums = await forumCollection
        .find({ userId: new ObjectId(user._id) })
        .toArray();

      forums = forums.map(post => ({
        ...post,
        _id: post._id.toString(),
        userId: post.userId.toString()
      }));
    }

    return res.render('users/profile', {
      isSignedIn: isSignedIn,
      user: { ...req.session.user, uploadedSpots },
      forums
    });
  } catch (e) {
    console.error("Error in /profile route:", e);
    return res.status(400).render('users/profile', { error: e });
  }
});

export default router;
