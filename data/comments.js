import { checkID, checkString, getCreatedDate } from '../helpers.js';
import { studySpots, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

export const createComment = async (spotId, userId, content) => {
	// Validate all comment properties
	try {
		spotId = checkID(spotId);
		userId = checkID(userId);
		content = checkString(content);
	} catch {
		throw "A comment must have a valid study spot, commenter, and content";
	}

	// Find the study spot and commenter by ID
	const spotObjectId = new ObjectId(spotId);
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: spotObjectId });

	if (!studySpot)
		throw `Study spot ${spotId} not found`;

	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

	if (!user)
		throw `User ${userId} not found`;

	// Create the comment object
	const date = getCreatedDate();
	const commentObj = { _id: new ObjectId(), spotId, userId, content, createdAt: date };

	// Add the comment to the study spot
	const updateInfo = await studySpotCollection.findOneAndUpdate(
		{ _id: spotObjectId },
		{ $push: { comments: commentObj } },
		{ returnDocument: 'after' }
	);

	if (!updateInfo)
		throw `Could not add comment to study spot with ID ${spotId}`;

	commentObj._id = commentObj._id.toString();
	return commentObj;
};

export const getComment = async (commentId) => {
	// Validate the comment ID
	commentId = checkID(commentId);

	// Find the comment by ID
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ 'comments._id': new ObjectId(commentId) });

	if (!studySpot)
		throw `Comment ${commentId} not found`;

	const comment = studySpot.comments.find(comment => comment._id.toString() === commentId);

	if (!comment)
		throw `Comment ${commentId} not found`;

	comment._id = comment._id.toString();
	return comment;
};

export const getAllComments = async (spotId) => {
	// Validate the study spot ID
	spotId = checkID(spotId);

	// Find the study spot by ID
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: new ObjectId(spotId) });

	if (!studySpot || !Array.isArray(studySpot.comments))
		throw `Study spot ${spotId} not found`;

	return studySpot.comments.map(comment => {
		comment._id = comment._id.toString();
		return comment;
	});
};

export const removeComment = async (commentId) => {
	// Validate the comment ID
	commentId = checkID(commentId);

	// Find the comment by ID, or throw if not found
	const commentObjectId = new ObjectId(commentId);
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ 'comments._id': commentObjectId });

	if (!studySpot)
		throw `Comment ${commentId} not found`;

	// Remove the comment
	const updateInfo = await studySpotCollection.findOneAndUpdate(
		{ 'comments._id': commentObjectId },
		{ $pull: { comments: { _id: commentObjectId } } },
		{ returnDocument: 'after' }
	);

	if (!updateInfo)
		throw `Could not remove comment with ID ${commentId}`;

	updateInfo._id = updateInfo._id.toString();
	return updateInfo;
};