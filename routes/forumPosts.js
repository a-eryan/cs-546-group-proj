import { Router } from "express";
const router = Router()
import { findEmailById, forums, getAllForumPosts, getForumPostById, addCommentToForumPost } from "../data/forumPosts.js";

router
    .route('/')
    .get(async(req, res) => {
        try {
            const forumPosts = await getAllForumPosts();
            return res.render('forums/list', {
                title: 'Forums',
                forums: forumPosts,
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        } catch (e) {
            console.error('Error rendering forums page:', e);
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        }
    })
router
    .route('/create') 
    .get(async(req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).redirect('/error');
            }
            return res.render('forums/create', {
                title: 'Create Forum',
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false,
            });
        } catch (e) {
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        }
    })
    .post(async(req, res) => {
        try {
            if (!req.session.user) { //if the user somehow isn't signed in, redirect to error page
                return res.status(401).redirect('/error');
            }
            const title = req.body.title;
            const content = req.body.content;
            if (!title || !content) {
                throw "You must provide a title and content for the forum post";
            }
            
            const forumPost = await forums(title, content, req.session.user.email);

            return res.redirect(`/forums/${forumPost.id}`);
        } catch (e) {
            if (e.toString().includes("cannot be an empty string or string with just spaces") || e.toString().includes("needs to be atleast")) {
                return res.status(400).render('forums/create', {
                    title: 'Create Forum',
                    error: e.toString(),
                    user: req.session.user, //shows the user object in the navbar
                    isSignedIn: req.session.user ? true : false,
                    title: req.body.title,
                    content: req.body.content
                });
            }
            console.error('Error creating forum post:', e);
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        }
    })
router
    .route('/:id')
    .get(async(req, res) => {
        try {
            const forumId = req.params.id;
            const forumPost = await getForumPostById(forumId);

            // Check if forumPost exists BEFORE trying to access its properties
            if (!forumPost) {
                return res.status(404).render('error', { 
                    error: 'Forum post not found',
                    user: req.session.user, //shows the user object in the navbar
                    isSignedIn: req.session.user ? true : false
                });
            }
            const author = await findEmailById(forumPost.userId.toString());
            console.log("Forum Post:", forumPost);
            return res.render('forums/post', {
                title: forumPost.title,
                _id: forumId, 
                author: author.email,
                content: forumPost.content,
                createdAt: forumPost.createdAt,
                comments: forumPost.comments,
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        } catch (e) {
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user,
                isSignedIn: req.session.user ? true : false
            });
        }
    })
    .post(async(req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).redirect('/error');
            }
            const forumId = req.params.id;
            const userId = req.session.user._id;
            const comment = req.body.comment;
            if (!comment || /^\s*$/.test(comment)) {
                const forumPost = await getForumPostById(forumId);
                const author = await findEmailById(forumPost.userId.toString());
                return res.status(400).render('forums/post', {
                    title: forumPost.title, // Use actual forum title
                    _id: forumId,
                    author: author.email,
                    content: forumPost.content,
                    createdAt: forumPost.createdAt,
                    comments: forumPost.comments,
                    error: 'Comment cannot be empty',
                    user: req.session.user,
                    isSignedIn: req.session.user ? true : false
                });
        }
            const newComment = await addCommentToForumPost(forumId, comment, userId);
            return res.redirect(`/forums/${forumId}`);
        } catch (e) {
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false
            });
        }
    })



export default router;