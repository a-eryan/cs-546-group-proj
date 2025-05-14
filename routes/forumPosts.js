import { Router } from "express";
import { requireAuth } from "../middleware.js";
const router = Router()
import { findEmailById, forums, getAllForumPosts, getForumPostById, addCommentToForumPost, deleteForumPost, editForumPost} from "../data/forumPosts.js";

router
    .route('/')
    .get(requireAuth, async(req, res) => {
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
    .get(requireAuth, async(req, res) => {
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
    .post(requireAuth, async(req, res) => {
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
    .get(requireAuth, async(req, res) => {
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
            //add flag for who is allowed to modify the post

            const canModify = req.session.user && (req.session.user._id.toString() === forumPost.userId.toString() || req.session.user.isAdmin);
            
            return res.render('forums/post', {
                title: forumPost.title,
                _id: forumId, 
                author: author.email,
                content: forumPost.content,
                createdAt: forumPost.createdAt,
                comments: forumPost.comments,
                user: req.session.user, //shows the user object in the navbar
                isSignedIn: req.session.user ? true : false,
                userId: forumPost.userId,
                canModify: canModify
            });
        } catch (e) {
            return res.status(500).render('error', {
                error: e.toString(),
                user: req.session.user,
                isSignedIn: req.session.user ? true : false
            });
        }
    })
    .post(requireAuth, async(req, res) => {
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

    router.post('/:id/delete', async(req, res) => {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }

            const isAdmin = req.session.user.isAdmin;

            await deleteForumPost(req.params.id, req.session.user._id, isAdmin);
            return res.redirect('/forums');
        } catch (e) {
            return res.status(400).render('error', {
                error: e.toString(),
                user: req.session.user, 
                isSignedIn: !!req.session.user
            })
        }
    });
router.get('/:id/edit', requireAuth, async(req, res) => {   
    try {
        const forumId = req.params.id;
        const forumPost = await getForumPostById(forumId);
        
        if (!forumPost) {
            return res.status(404).render('error', { 
                error: 'Forum post not found',
                user: req.session.user,
                isSignedIn: true
            });
        }
        
        const canModify = req.session.user && 
            (req.session.user._id.toString() === forumPost.userId.toString() || 
             req.session.user.isAdmin);
        
        if (!canModify) {
            return res.status(403).render('error', {
                error: 'You do not have permission to edit this forum post',
                user: req.session.user,
                isSignedIn: true
            });
        }
        
        return res.render('forums/edit', {
            title: 'Edit Forum Post',
            _id: forumId,
            postTitle: forumPost.title,  
            content: forumPost.content,
            user: req.session.user,
            isSignedIn: true,
            error: null
        });
    } catch (e) {
        return res.status(500).render('error', {
            error: e.toString(),
            user: req.session.user,
            isSignedIn: true
        });
    }
});
router.post('/:id/edit', requireAuth, async(req, res) => { 
    try {
        const forumId = req.params.id;
        const { title, content } = req.body;
        const userId = req.session.user._id;
        const forumPost = await getForumPostById(forumId);
       
        const canModify = req.session.user && 
        (req.session.user._id.toString() ===  forumPost.userId.toString() || 
        req.session.user.isAdmin);

        if (!title || /^\s*$/.test(title)) {
            return res.status(400).render('forums/edit', {
                title: 'Edit Forum Post',
                _id: forumId,
                postTitle: title,
                content: content,
                error: 'Title cannot be empty',
                user: req.session.user,
                isSignedIn: true
            });
        }

        if (!content || /^\s*$/.test(content)) {
            return res.status(400).render('forums/edit', {
                title: 'Edit Forum Post',
                _id: forumId,
                postTitle: title,
                content: content,
                error: 'Content cannot be empty',
                user: req.session.user,
                isSignedIn: true
            });
        }

        if (!canModify) {
            return res.status(403).render('error', {
                error: 'You do not have permission to edit this forum post',
                user: req.session.user,
                isSignedIn: true
            });
        }

        await editForumPost(forumId, title, content, userId);
        return res.redirect(`/forums/${forumId}`);
    } catch (e) {
        const error_400 = e.toString().includes("cannot be an empty string or string with just spaces") || e.toString().includes("needs to be atleast");
        if (error_400) {
            return res.status(400).render('forums/edit', {
                title: 'Edit Forum Post',
                _id: req.params.id,
                postTitle: req.body.title,
                content: req.body.content,
                error: e.toString(),
                user: req.session.user,
                isSignedIn: !!req.session.user
            });
        }

        return res.status(500).render('error', {
                error: 'A server error occurred. Please try again.',
                formData: {  // Save form data for potential recovery
                    id: req.params.id,
                    title: req.body.title,
                    content: req.body.content
                },
                user: req.session.user,
                isSignedIn: !!req.session.user
        });
    }
});



export default router;
