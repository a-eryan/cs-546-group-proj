import { Router } from "express";
const router = Router();

router.route('/profile').get(async(req, res) => {
    try{
        const user = req.session.user || null;
        const isSignedIn = !!user;
        return res.render('users/profile', {
            isSignedIn: isSignedIn,
            user: user
        })
    } catch (e) {
        return res.status(400).render('users/profile', { error: e });
    }
})

export default router;