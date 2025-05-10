import { studySpots } from "../config/mongoCollections.js"
import { checkDescription, checkLocation, checkNoiseLevel, checkResources, checkTitle, getCreatedDate } from "../helpers.js"

export const uploadStudySpot = async (
    title,
    description,
    location,
    resources,
    noiseLevel

) => {
    if (!title || !description || !location || !resources || !noiseLevel) {
        throw "All fields need to have valid values"
    }

    title = checkTitle(title)
    description = checkDescription(description)
    location = checkLocation(location)
    resources = checkResources(resources)
    noiseLevel = checkNoiseLevel(noiseLevel)

    const studyCollection = await studySpots()
    const duplicateSpot = await studyCollection.findOne({title: title.toLowerCase()})

    if (duplicateSpot)
        throw `Study spot with title: ${title} already exists. Please change title or choose new study spot.`

    

    let newSpot = {
        title: title,
        description: description,
        poster: null, // this should turn into poster id?
        location: location,
        resourcesNearby: resources,
        noiseLevel: noiseLevel,
        averageRating: null,
        reviews: [],
        genAiSummary: null,
        createdDate: getCreatedDate()
    }

    const insertInfo = await studyCollection.insertOne(newSpot)
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw `Could not add study spot with title of ${title}`

    return {registrationCompleted: true}
}