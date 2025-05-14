import { Router } from 'express';
import { checkID, checkContent, checkDescription, checkTitle } from '../helpers.js';
import { requireAuth } from '../middleware.js';
import { getEmailById } from '../data/users.js';
import { createForumPost, getAllForumPosts, getForumPostById, addCommentToForumPost, deleteForumPost, editForumPost} from '../data/forumPosts.js';
import xss from 'xss';

const router = Router();

// GET all forum posts
router.get('/', requireAuth, async (req, res) => {
	try {
		const forumPosts = await getAllForumPosts();
		return res.render('forums/list', { title: "Forum Posts", forums: forumPosts, isSignedIn: true });
	} catch (e) {
		return res.status(500).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// GET the create page
router.get('/create', requireAuth, async (req, res) => {
	try {
		return res.render('forums/create', { title: "Create Forum Post", isSignedIn: true });
	} catch (e) {
		return res.status(500).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// POST a new forum post
router.post('/create', requireAuth, async (req, res) => {
	let title = xss(req.body.title);
	let content = xss(req.body.content);

	try {
		// Validate the title and content
		title = checkTitle(title);
		content = checkDescription(content);

		// Create the forum post
		const forumPost = await createForumPost(req.session.user._id, title, content);
		return res.redirect(`/forums/${forumPost._id}`);
	} catch (e) {
		return res.status(400).render('forums/create', {
			title: "Create Forum Post",
			error: e,
			isSignedIn: true,
			forum_title: title,
			content: content
		});
	}
});

// GET a specific forum post
router.get('/:forumId', requireAuth, async (req, res) => {
	try {
		// Validate the forum ID
		const forumId = checkID(xss(req.params.forumId));

		// Get the forum post and its author's email
		const forumPost = await getForumPostById(forumId);
		const authorEmail = await getEmailById(forumPost.userId);

		// Render the forum post
		return res.render('forums/post', {
			_id: forumId,
			title: forumPost.title,
			author: authorEmail,
			content: forumPost.content,
			createdAt: forumPost.createdAt,
			comments: forumPost.comments,
			isSignedIn: true,
			canModify: req.session.user._id === forumPost.userId
		});
	} catch (e) {
		return res.status(400).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// POST a comment to a specific forum post
router.post('/:forumId', requireAuth, async (req, res) => {
	try {
		// Validate comment properties
		const forumId = checkID(xss(req.params.forumId));
		const userId = req.session.user._id;

		// Get the forum post and its author's email
		const forumPost = await getForumPostById(forumId);
		const authorEmail = await getEmailById(forumPost.userId);

		// Validate the comment
		let comment;
		try {
			comment = checkContent(xss(req.body.comment));
		} catch (e) {
			return res.status(400).render('forums/post', {
				_id: forumId,
				error: e,
				title: forumPost.title,
				author: authorEmail,
				content: forumPost.content,
				createdAt: forumPost.createdAt,
				comments: forumPost.comments,
				isSignedIn: true,
				canModify: req.session.user._id === forumPost.userId
			});
		}

		// Redirect back to the forum page after adding the comment
		await addCommentToForumPost(forumId, userId, comment);
		return res.redirect(`/forums/${forumId}`);
	} catch (e) {
		return res.status(400).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// DELETE a forum post
router.post('/:forumId/delete', requireAuth, async (req, res) => {
	try {
		// Validate the forum ID
		const forumId = checkID(xss(req.params.forumId));

		// Check if the user has permission to delete the post
		const forumPost = await getForumPostById(forumId);
		if (forumPost.userId !== req.session.user._id)
			return res.status(403).render('error', { title: "Error", error: "You do not have permission to delete this post", isSignedIn: true });

		// Delete the forum post and redirect to the forum list
		await deleteForumPost(forumId);
		return res.redirect('/forums');
	} catch (e) {
		return res.status(400).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// GET the edit page for a specific forum post
router.get('/:forumId/edit', requireAuth, async (req, res) => {
	try {
		// Validate the forum ID
		const forumId = checkID(xss(req.params.forumId));

		// Check if the user has permission to edit the post
		const forumPost = await getForumPostById(forumId);
		if (forumPost.userId !== req.session.user._id)
			return res.status(403).render('error', { title: "Error", error: "You do not have permission to edit this post", isSignedIn: true });

		// Render the edit page
		return res.render('forums/edit', {
			_id: forumId,
			title: "Edit Forum Post",
			postTitle: forumPost.title,
			content: forumPost.content,
			isSignedIn: true
		});
	} catch (e) {
		return res.status(500).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

// POST the edited forum post
router.post('/:forumId/edit', requireAuth, async (req, res) => {
	let forumId = xss(req.params.forumId);
	let title = xss(req.body.title);
	let content = xss(req.body.content);

	// Validate the forum properties
	try {
		forumId = checkID(forumId);
		title = checkTitle(title);
		content = checkDescription(content);
	} catch (e) {
		return res.status(400).render('forums/edit', {
			_id: forumId,
			error: e,
			title: "Edit Forum Post",
			postTitle: title,
			content: content,
			isSignedIn: true
		});
	}

	try {
		// Check if the user has permission to edit the post
		const forumPost = await getForumPostById(forumId);

		if (forumPost.userId !== req.session.user._id)
			return res.status(403).render('error', { title: "Error", error: "You do not have permission to edit this post", isSignedIn: true });
	} catch (e) {
		return res.status(400).render('error', { title: "Error", error: e, isSignedIn: true });
	}

	try {
		// Update the forum post and redirect to the forum page
		await editForumPost(forumId, title, content);
		return res.redirect(`/forums/${forumId}`);
	} catch (e) {
		return res.status(500).render('error', { title: "Error", error: e, isSignedIn: true });
	}
});

export default router;