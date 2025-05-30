import { ObjectId } from 'mongodb';
import { reports, studySpots, forumPosts } from '../config/mongoCollections.js';
import { checkString, checkID, getCreatedDate, checkDescription } from '../helpers.js';

// Two different functions to handle the different contentTypes
export const createStudySpotReport = async (contentId, userId, reason) => {
	try {
		return await createReport(contentId, userId, 'studySpot', reason);
	} catch (e) {
		throw e;
	}
};

export const createForumPostReport = async (contentId, userId, reason) => {
	try {
		return await createReport(contentId, userId, 'forumPost', reason);
	} catch (e) {
		throw e;
	}
};

const createReport = async (contentId, userId, contentType, reason) => {
	// Validate the report properties
	contentId = checkID(contentId);
	userId = checkID(userId);
	contentType = checkString(contentType);
	reason = checkDescription(reason);

	// Check if the content exists
	const contentObjectId = new ObjectId(contentId);
	if (contentType === 'studySpot') {
		const studySpotCollection = await studySpots();
		const studySpot = await studySpotCollection.findOne({ _id: contentObjectId });

		if (!studySpot)
			throw `No study spot found with ID ${contentId}`;
	} else if (contentType === 'forumPost') {
		const forumPostsCollection = await forumPosts();
		const forumPost = await forumPostsCollection.findOne({ _id: contentObjectId });

		if (!forumPost)
			throw `No forum post found with ID ${contentId}`;
	} else {
		throw `Invalid content type: ${contentType}`;
	}

	const reportsCollection = await reports();
	const insertInfo = await reportsCollection.insertOne({
		contentId: contentId,
		reportedBy: userId,
		contentType: contentType,
		reason: reason,
		createdAt: getCreatedDate()
	});

	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw `Could not add report for ${contentType} ID ${contentId}`;

	return insertInfo.insertedId.toString();
};