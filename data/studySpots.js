import { ObjectId } from 'mongodb';
import { studySpots, users } from '../config/mongoCollections.js';
import { checkDescription, checkID, checkLocation, checkNoiseLevel, checkResources, checkTitle, getCreatedDate } from '../helpers.js'

export const uploadStudySpot = async (userId, title, description, location, resources, noiseLevel, imagePath) => {
	// Validate study spot properties
	userId = checkID(userId);
	title = checkTitle(title);
	description = checkDescription(description);
	location = checkLocation(location);
	resources = checkResources(resources);
	noiseLevel = checkNoiseLevel(noiseLevel);

	// Check if the user exists
	const userObjectId = new ObjectId(userId);
	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: userObjectId });

	if (!user)
		throw `User ${userId} not found`;
	
	// Create the new study spot
	const studySpotObj = {
		_id: new ObjectId(),
		userId: userId,
		title: title,
		description: description,
		location: location,
		resourcesNearby: resources,
		noiseLevel: noiseLevel,
		averageRating: null,
		comments: [],
		reviews: [],
		createdDate: getCreatedDate(),
		imageUrl: imagePath || null
	}
	
	const studySpotCollection = await studySpots();
	const insertInfo = await studySpotCollection.insertOne(studySpotObj);

	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw "Could not create study spot";

	// Add the study spot ID to the user's uploaded spots
	const updateUser = await usersCollection.findOneAndUpdate(
		{ _id: userObjectId },
		{ $push: { uploadedSpots: insertInfo.insertedId } },
		{ returnDocument: 'after' }
	);

	if (!updateUser)
		throw `Failed to update the uploaded spots for user ${userId}`;

	// Add the Study Spotter achievement if the user has uploaded 3 or more spots
	if (updateUser.uploadedSpots && updateUser.uploadedSpots.length >= 3) {
		const hasAchievement = updateUser.achievements && updateUser.achievements.includes('Study Spotter');
		if (!hasAchievement) {
			await usersCollection.updateOne(
				{ _id: userObjectId },
				{ $push: { achievements: 'Study Spotter' } }
			);
		}
	}

	studySpotObj._id = studySpotObj._id.toString();
	return studySpotObj;
};

export const getAllStudySpots = async() => {
	// Get all study spots
  const studyCollection = await studySpots();
  const studySpotList = await studyCollection.find({}).toArray();

  if (!studySpotList)
		throw "Could not get all study spots";

  return studySpotList.map(studySpot => {
    studySpot._id = studySpot._id.toString();
    return studySpot;
  });
};

export const getStudySpotById = async(spotId) => {
  // Validate the study spot ID
	spotId = checkID(spotId);

	// Find the study spot by ID
  const studyCollection = await studySpots();
  const studySpot = await studyCollection.findOne({ _id: new ObjectId(spotId)});

  if (!studySpot)
    throw `Study spot ${spotId} not found`;

  studySpot._id = studySpot._id.toString();
  return studySpot;
};

export const updateStudySpot = async(spotId, title, description, location, resources, noiseLevel, imagePath) => {
	// Validate all study spot properties
  spotId = checkID(spotId);
  title = checkTitle(title);
  description = checkDescription(description);
  location = checkLocation(location);
  resources = checkResources(resources);
  noiseLevel = checkNoiseLevel(noiseLevel);

	// Check if the study spot exists
	const spotObjectId = new ObjectId(spotId);
	const studyCollection = await studySpots();
	const studySpot = await studyCollection.findOne({ _id: spotObjectId });

	if (!studySpot)
		throw `Study spot ${spotId} not found`;

	// Update the study spot
  const updatedStudySpot = {
    title: title,
    description: description,
    location: location,
    resourcesNearby: resources,
    noiseLevel: noiseLevel,
    imageUrl: imagePath,
		createdDate: studySpot.createdDate,
    updatedAt: getCreatedDate()
  };
  
  const updatedInfo = await studyCollection.findOneAndUpdate(
    { _id: spotObjectId },
    { $set: updatedStudySpot },
    { returnDocument: 'after' }
  );

  if (!updatedInfo)
    throw `Could not update study spot ${spotId}`;

  updatedInfo._id = updatedInfo._id.toString();
  return updatedInfo;
};

export const deleteStudySpot = async(spotId) => {
	// Validate the study spot ID
  spotId = checkID(spotId);

	// Delete the study spot
  const studyCollection = await studySpots();
  const deletionInfo = await studyCollection.findOneAndDelete({ _id: new ObjectId(spotId) });

  if (!deletionInfo)
    throw `Could not delete study spot ${spotId}`;

  return deletionInfo;
};