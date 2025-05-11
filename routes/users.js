import { Router } from "express";
import { getStudySpotById } from "../data/studySpots.js";
const router = Router();

router.route('/profile').get(async(req, res) => {
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
        return res.render('users/profile', {
            isSignedIn: isSignedIn,
            user: { ...user, uploadedSpots}
        });
    } catch (e) {
        return res.status(400).render('users/profile', { error: e });
    }
})

export default router;