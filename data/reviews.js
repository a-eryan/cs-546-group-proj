import { studySpots, users } from '../config/mongoCollections.js';
import { checkString, checkID, checkReviewProperties, calculateAverageRating, validateReviewComment, getCreatedDate } from '../helpers.js';
import { ObjectId } from 'mongodb';

export const createReview = async (spotId, userId, title, content, rating) => {
	// Validate all review properties
	({ spotId, userId, title, content, rating } = checkReviewProperties(spotId, userId, title, content, rating));

	// Find the study spot and reviewer by ID
	const spotObjectId = new ObjectId(spotId);
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: spotObjectId });

	if (!studySpot)
		throw `Study spot ${spotId} not found`;

	const usersCollection = await users();
	const reviewer = await usersCollection.findOne({ _id: new ObjectId(userId) });

	if (!reviewer)
		throw `Reviewer ${userId} not found`;

	//Check if the reviewer has already reviewed this study spot
	if (studySpot.reviews && studySpot.reviews.length > 0) {
		const existingReview = studySpot.reviews.find(review => review.userId === userId);
		if (existingReview)
			throw `User ${userId} has already reviewed study spot ${spotId}`;
	}

	// Create the review object
	const date = getCreatedDate();
	const reviewObj = { _id: new ObjectId(), spotId, userId, title, content, rating, createdAt: date, comments: [] };

	// Add the review to the study spot and recalculate the average rating
	const averageRating = calculateAverageRating([...studySpot.reviews, reviewObj]);
	const updateInfo = await studySpotCollection.findOneAndUpdate(
		{ _id: spotObjectId },
		{
			$push: { reviews: reviewObj },
			$set: { averageRating: averageRating }
		},
		{ returnDocument: 'after' }
	);

	if (!updateInfo)
		throw `Could not add review to study spot with ID ${spotId}`;

	// Add the Top Critic achievement if the reviewer has 3 or more reviews
	const userReviewsCount = await studySpotCollection.countDocuments({ 'reviews.userId': userId });
	if (userReviewsCount >= 3) {
		const hasAchievement = reviewer.achievements && reviewer.achievements.includes('Top Critic');
		if (!hasAchievement) {
			await usersCollection.updateOne(
				{ _id: new ObjectId(userId) },
				{ $push: { achievements: 'Top Critic' } }
			);
		}
	}

	reviewObj._id = reviewObj._id.toString();
	return reviewObj;
};

export const getReview = async (reviewId) => {
	// Validate the review ID
	reviewId = checkID(reviewId);

	// Find the review by ID
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ 'reviews._id': new ObjectId(reviewId) });

	if (!studySpot)
		throw `Review ${reviewId} not found`;

	const review = studySpot.reviews.find(review => review._id.toString() === reviewId);

	if (!review)
		throw `Review ${reviewId} not found`;

	review._id = review._id.toString();
	return review;
}

export const getAllReviews = async (spotId) => {
	// Validate the study spot ID
	spotId = checkID(spotId);

	// Find all reviews for the study spot
	// No need to error when a study spot has no reviews
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ _id: new ObjectId(spotId) });

	if (!studySpot || !Array.isArray(studySpot.reviews)) // Check for the reviews property to ensure we return a study spot
		throw `Study spot ${spotId} not found`;

	return studySpot.reviews.map(review => {
		review._id = review._id.toString();
		review.comments = Array.isArray(review.comments) ? review.comments : [];
		return review;
	});
};

export const removeReview = async (reviewId) => {
	// Validate the review ID
	reviewId = checkID(reviewId);

	// Find the review by ID, or throw if not found
	const reviewObjectId = new ObjectId(reviewId);
	const studySpotCollection = await studySpots();
	const studySpot = await studySpotCollection.findOne({ 'reviews._id': reviewObjectId });

	if (!studySpot)
		throw `Review ${reviewId} not found`;

	// Recalculate the overall rating
	const reviews = studySpot.reviews.filter(review => review._id.toString() !== reviewId);
	const averageRating = reviews.length > 0 ? calculateAverageRating(reviews) : null;

	// Remove the review
	const updateInfo = await studySpotCollection.findOneAndUpdate(
		{ 'reviews._id': reviewObjectId },
		{
			$pull: { reviews: { _id: reviewObjectId } },
			$set: { averageRating: averageRating }
		},
		{ returnDocument: 'after' }
	);

	if (!updateInfo)
		throw `Could not remove review with ID ${reviewId}`;

	updateInfo._id = updateInfo._id.toString();
	return updateInfo;
};

export const addCommentToReview = async (reviewId, userId, content) => {
  reviewId = checkID(reviewId);
  userId = checkID(userId);
  content = checkString(content);

  const studySpotCollection = await studySpots();
  const reviewObjectId = new ObjectId(reviewId);

  const spot=await studySpotCollection.findOne({ 'reviews._id': reviewObjectId });
  if (!spot) throw `Review ${reviewId} not found`;

  const usersCollection = await users();
  const poster = await usersCollection.findOne({ _id: new ObjectId(userId) });

  const newComment={
    _id: new ObjectId(),
    userId,
    author: poster ? poster.email : 'Anonymous',
    content,
    createdAt: getCreatedDate()
  };

  const updateRes = await studySpotCollection.updateOne(
    { 'reviews._id': reviewObjectId },
    { $push:{ 'reviews.$.comments': newComment } }
  );
  if (updateRes.modifiedCount === 0) throw `Could not add comment to review ${reviewId}`;

  newComment._id = newComment._id.toString();
  return newComment;
};