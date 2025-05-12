import { Router } from "express";
import { ObjectId } from 'mongodb'; 
import { getStudySpotById } from "../data/studySpots.js";
import { forumPosts } from "../config/mongoCollections.js";
import { requireAuth } from "../middleware.js";
const router = Router();

router.route('/profile').get(requireAuth, async(req, res) => {
    try{
        const user = req.session.user || null;
        const isSignedIn = !!user;

        let uploadedSpots = [];
        if (user && user.uploadedSpots) {
            for (let spotId of user.uploadedSpots){
                const spot = await getStudySpotById(spotId);
                uploadedSpots.push(spot)
            }
        }

        let forums = [];
        if (user && user._id) {
            const forumCollection = await forumPosts();
            forums = await forumCollection
                .find({ userId: new ObjectId(user._id) })
                .toArray();

            // Optional: convert _id and userId to strings
            forums = forums.map(post => ({
                ...post,
                _id: post._id.toString(),
                userId: post.userId.toString()
            }));
        }

        return res.render('users/profile', {
            isSignedIn: isSignedIn,
            user: { ...user, uploadedSpots},
            forums
        });
    } catch (e) {
        return res.status(400).render('users/profile', { error: e });
    }
})

export default router;