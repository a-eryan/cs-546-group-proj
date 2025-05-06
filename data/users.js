import { users } from "../config/mongoCollections"
import { checkEmail, checkPassword } from "../helpers"
import bcrypt from "bcrypt"

export const register = async (
    email,
    password,
) => {
    if (!email || !password)
        throw "Please provide username and password"
    email = checkEmail(email)
    const userCollection = await users()
    const duplicateUser = await userCollection.findOne({email: email})

    if (duplicateUser)
        throw `User with email of: ${email} already exists, please log in instead.`

    password = checkPassword(password)
    let hashedPassword = await bcrypt.hash(password, 16)

    let newUser = {
        email: email,
        password: hashedPassword,
        isAdmin: false,
        achievements: [],
        uploadedSpots: [],
        likedSpots: [],
        messages: []
    }

    const insertInfo = await userCollection.insertOne(newUser)
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw `Could not add user with email of ${email}`

    return {registrationCompleted: true}
}