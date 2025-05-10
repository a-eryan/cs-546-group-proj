import { studySpots, users, reviews } from '../config/mongoCollections.js';
import { checkString, checkReviewProperties, calculateAverageRating, getCreatedDate } from '../helpers.js';
import { ObjectId } from 'mongodb';

export const createReview = async (spotId, userId, title, content, rating) => {
	// Validate all review properties
	({ spotId, userId, title, content, rating } = checkReviewProperties(spotId, userId, title, content, rating));

	// Check if the study spot and reviewer IDs are valid
	if (!ObjectId.isValid(spotId))
		throw `Invalid study spot ID ${spotId}`;

	if (!ObjectId.isValid(userId))
		throw `Invalid reviewer ID ${userId}`;

	// Find the study spot and reviewer by ID
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: new ObjectId(spotId) });

	if (!studySpot)
		throw `Study spot ${spotId} not found`;

	const usersCollection = await users();
	const reviewer = await usersCollection.findOne({ _id: new ObjectId(userId) });

	if (!reviewer)
		throw `Reviewer ${userId} not found`;

	// Check if the reviewer has already reviewed this study spot
	const reviewsCollection = await reviews();
	// const existingReview = await reviewsCollection.findOne({ spotId: spotId, userId: userId });

	// if (existingReview)
	// 	throw `User ${userId} has already reviewed study spot ${spotId}`;

	const reviewsArr = await reviewsCollection.find({ spotId: spotId }).toArray();

	// Create the review object
	const date = getCreatedDate();
	const reviewObj = { spotId, userId, title, content, rating, createdAt: date };

	const insertInfo = await reviewsCollection.insertOne(reviewObj);
	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw `Could not add review to study spot with ID ${spotId}`;

	// Update the study spot with the new review and overall rating
	const averageRating = calculateAverageRating([...reviewsArr, reviewObj]);

	const updateInfo = await studySpotCollection.findOneAndUpdate(
		{ _id: new ObjectId(spotId) },
		{
			$push: { reviews: insertInfo.insertedId },
			$set: { averageRating: averageRating }
		},
		{ returnDocument: 'after' }
	);

	if (!updateInfo)
		throw `Could not add review to study spot with ID ${spotId}`;

	return await getReview(insertInfo.insertedId.toString());
};

export const getReview = async (reviewId) => {
	// Validate the review ID
	try {
		reviewId = checkString(reviewId);
	} catch {
		throw "The review ID must be a non-empty string";
	}

	if (!ObjectId.isValid(reviewId))
		throw `Invalid review ID ${reviewId}`;

	// Find the review by ID
	const reviewsCollection = await reviews();
	const review = await reviewsCollection.findOne({ _id: new ObjectId(reviewId) });

	if (!review)
		throw `Review ${reviewId} not found`;
	
	review._id = review._id.toString();
	return review;
}

export const getAllReviews = async (spotId) => {
	// Validate the study spot ID
	try {
		spotId = checkString(spotId);
	} catch {
		throw "The study spot ID must be a non-empty string";
	}

	if (!ObjectId.isValid(spotId))
		throw `Invalid study spot ID ${spotId}`;

	// Ensure the study spot exists
	// Note: Spot ID is stored as an object ID in studySpots, but as a string in reviews
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: new ObjectId(spotId) });
	if (!studySpot)
		throw `Study spot ${spotId} not found`;

	// Find all reviews for the study spot
	// No need to error when a study spot has no reviews
	const reviewsCollection = await reviews();
	const reviewsObjs = await reviewsCollection.find({ spotId: spotId }).toArray();

	return reviewsObjs.map(review => {
		review._id = review._id.toString();
		return review;
	});
};