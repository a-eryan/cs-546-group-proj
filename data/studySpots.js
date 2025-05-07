import { studySpots } from "../config/mongoCollections.js"
import { checkDescription, checkLocation, checkTitle, getCreatedDate } from "../helpers"

export const uploadStudySpot = async (
    title,
    description,
    location
) => {
    if (!title, !description, !location, !createdAt)
        throw "All fields need to have valid values"
    title = checkTitle(title)

    const studyCollection = await studySpots()
    const duplicateSpot = await studyCollection.findOne({title: title.toLowerCase()})

    if (duplicateSpot)
        throw `Study spot with title: ${title} already exists. Please change title or choose new study spot.`

    description = checkDescription(description)
    location = checkLocation(location)

    let newSpot = {
        title: title,
        description: description,
        poster: null,
        location: location,
        resourcesNearby: [],
        noiseLevel: null,
        averageRating: null,
        reviews: [],
        createdDate: getCreatedDate()
    }

    const insertInfo = await studyCollection.insertOne(newSpot)
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw `Could not add study spot with title of ${title}`

    return {registrationCompleted: true}
}