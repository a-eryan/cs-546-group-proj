import { Router } from "express";
const router = Router()
import { forums, getAllForumPosts } from "../data/forumPosts.js";

router
    .route('/')
    .get(async(req, res) => {
        try {
            const forumPosts = await getAllForumPosts();
            return res.render('forums/list', {
                title: 'Forums',
                forums: await forumPosts,
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        } catch (e) {
            console.error('Error rendering forums page:', e);
            return res.status(500).json({error: e.toString()})
        }
    })
router
    .route('/create') 
    .get(async(req, res) => {
        try {
            if (!req.session.user) {
                return res.redirect('/error');
            }
            return res.render('forums/create', {
                title: 'Create Forum',
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false,
            });
        } catch (e) {
            console.error('Error rendering create forum page:', e);
            return res.status(500).json({error: e.toString()})
        }
    })
    .post(async(req, res) => {
        try {
            if (!req.session.user) { //if the user somehow isn't signed in, redirect to error page
                return res.redirect('/error');
            }
            const title = req.body.title;
            const content = req.body.content;
            if (!title || !content) {
                return res.status(400).render('forums/create', {
                    error: 'Title and content are required'
                });
            }
            await forums(title, content, req.session.user.email);
            return res.redirect('/forums');
        } catch (e) {
            console.error('Error creating forum post:', e);
            return res.status(500).render('forums/create', {
                title: 'Create Forum',
                error: e.toString(),
                user: req.session.user,
                isSignedIn: req.session.user ? true : false
            });
        }
    })



export default router;