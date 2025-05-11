import { ObjectId } from "mongodb";
import { studySpots, users } from "../config/mongoCollections.js"
import { checkDescription, checkLocation, checkNoiseLevel, checkResources, checkTitle, getCreatedDate } from "../helpers.js"

export const uploadStudySpot = async (
    title,
    description,
    poster,
    location,
    resources,
    noiseLevel

) => {
    if (!title || !description || !location || !resources || !noiseLevel) {
      throw "All fields need to have valid values";
    }

    title = checkTitle(title);
    description = checkDescription(description);
    location = checkLocation(location);
    resources = checkResources(resources);
    noiseLevel = checkNoiseLevel(noiseLevel);

    const studyCollection = await studySpots();
    const duplicateSpot = await studyCollection.findOne({title: title.toLowerCase()});

    if (duplicateSpot)
      throw `Study spot with title: ${title} already exists. Please change title or choose new study spot.`;

    

    let newSpot = {
      title: title,
      description: description,
      poster: poster,
      location: location,
      resourcesNearby: resources,
      noiseLevel: noiseLevel,
      averageRating: null,
      reviews: [],
      genAiSummary: null,
      createdDate: getCreatedDate()
    };

    const insertInfo = await studyCollection.insertOne(newSpot);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw `Could not add study spot with title of ${title}`;


    const usersCollection = await users();
    const updateUser = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(poster) },
      {
        $push: { uploadedSpots: insertInfo.insertedId }
      },
      { returnDocument: 'after'}
    );

    if (!updateUser){
      throw "Study spot created, but failed to update user's uploaded spots."
    }
    return {uploadCompleted: true}
}

export const getAllStudySpots = async() => {
  const studyCollection = await studySpots();
  let studyList = await studyCollection.find({}).toArray();
  if (!studyList) throw 'Could not get all study spots.';
  studyList = studyList.map((element) => {
    element._id = element._id.toString();
    return element;
  })

  return studyList;
}