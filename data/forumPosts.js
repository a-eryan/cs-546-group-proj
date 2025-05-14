import { ObjectId } from 'mongodb';
import { getEmailById } from './users.js';
import { users, forumPosts } from '../config/mongoCollections.js';
import { checkString, checkID, checkTitle, checkDescription, getCreatedDate } from '../helpers.js';

export const createForumPost = async (userId, title, content) => {
	// Validate forum post properties
	userId = checkID(userId);
	title = checkTitle(title);
	content = checkDescription(content);

	// Check if the user exists
	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

	if (!user)
		throw `User ${userId} not found`;

	// Create the forum post
	const forumPostsCollection = await forumPosts();
	const newForumPost = {
		_id: new ObjectId(),
		userId: userId,
		title: title,
		content: content,
		createdAt: getCreatedDate(),
		comments: []
	}
	
	const insertInfo = await forumPostsCollection.insertOne(newForumPost);
	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw "Could not create forum post";
	
	newForumPost._id = newForumPost._id.toString();
	return newForumPost;
};

export const getForumPostById = async (forumId) => {
	// Validate the forum post ID
	forumId = checkID(forumId);
	
	// Find the forum post by ID
	const forumPostsCollection = await forumPosts();
	const forumPost = await forumPostsCollection.findOne({ _id: new ObjectId(forumId) });

	if (!forumPost)
		throw `Forum post ${forumId} not found`;
	
	forumPost._id = forumPost._id.toString();
	return forumPost;
};

export const getAllForumPosts = async () => {
	// Get all forum posts
	const forumPostsCollection = await forumPosts();
	const allForumPosts = await forumPostsCollection.find({}).toArray();
	
	if (!allForumPosts)
		throw "Could not get all forum posts";

	return allForumPosts.map(post => {
		post._id = post._id.toString();
		return post;
	});
};

export const addCommentToForumPost = async (forumId, userId, comment) => {
	// Validate the forum comment properties
	forumId = checkID(forumId);
	userId = checkID(userId);
	comment = checkString(comment);
  
	// Get the forum post author email
	let email;
	try {
		email = await getEmailById(userId);
	} catch {
		email = 'Unknown User';
	}

	// Create the new comment
	const forumPostsCollection = await forumPosts();
	const newComment = {
		_id: new ObjectId(),
		userId: userId,
		email: email,
		content: comment,
		createdAt: getCreatedDate()
	};

	const updateInfo = await forumPostsCollection.updateOne(
		{ _id: new ObjectId(forumId) },
		{ $push: { comments: newComment } }
	);
	
	if (updateInfo.modifiedCount === 0)
		throw `Could not add comment to forum post ${forumId}`;

	// Check if the user has made 5 or more comments
	let totalComments = 0;
	const allForumPosts = await getAllForumPosts();

	for (const post of allForumPosts) {
		if (post.comments && Array.isArray(post.comments)) {
			const userComments = post.comments.filter(comment => comment.userId === userId);
			totalComments += userComments.length;
		}
	}

	// Add the Study Spotter achievement if they have
	if (totalComments >= 5) {
		const userObjectId = new ObjectId(userId);
		const usersCollection = await users();
		const user = await usersCollection.findOne({ _id: userObjectId });

		if (!user)
			return newComment;

		const hasAchievement = user.achievements && user.achievements.includes('Big Talker');
		if (!hasAchievement) {
			await usersCollection.updateOne(
				{ _id: userObjectId },
				{ $push: { achievements: 'Big Talker' } }
			);
		}
	}
	
	return newComment;
};

// TODO: Ensure the user has permissions to delete the post in the route
export const deleteForumPost = async (forumId) => {
	// Validate the forum post ID
	forumId = checkID(forumId);

	// Get the forum post to delete
	const forumObjectId = new ObjectId(forumId);
	const forumCollection = await forumPosts();
	const post = await forumCollection.findOne({ _id: forumObjectId });

	if (!post)
		throw `Forum post ${forumId} not found`;

	// Delete the forum post
	const result = await forumCollection.deleteOne({ _id: forumObjectId });

	if (!result.acknowledged)
		throw `Could not delete forum post ${forumId}`;

	return { deleted: true };
};

export const editForumPost = async (forumId, title, content) => {
	// Validate forum post properties
	forumId = checkID(forumId);
	title = checkTitle(title);
	content = checkDescription(content);
	
	// Get the forum post by ID
	const forumObjectId = new ObjectId(forumId);
	const forumPostsCollection = await forumPosts();
	const post = await forumPostsCollection.findOne({ _id: forumObjectId });

	if (!post)
		throw `Forum post ${forumId} not found`;
	
	// Edit the forum post
	const updateInfo = await forumPostsCollection.updateOne(
		{ _id: forumObjectId },
		{
			$set: {
				title: title,
				content: content,
				updatedAt: getCreatedDate()
			}
		}
	);
	
	if (updateInfo.modifiedCount === 0)
		throw `Could not edit forum post ${forumId}`;
	
	return { updated: true };
};