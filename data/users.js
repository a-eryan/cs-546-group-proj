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
    const duplicateUser = await userCollection.findOne({email: email.toLowerCase()})

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

export const login = async (
    email,
    password
) => {
    if (!email || !password)
        throw "Please provide username and password"
    email = checkEmail(email)
    password = checkPassword(password)

    const userCollection = await users()
    const user = await userCollection.findOne({email: email.toLowerCase()})

    if (!user)
        throw "Either the email or password is invalid"
    const matchedPassword = await bcrypt.compare(password, user.password)
    if (matchedPassword){
        const userObj = {
            email: user.email,
            isAdmin: user.isAdmin,
            achievements: user.achievements,
            uploadedSpots: user.uploadedSpots,
            likedSpots: user.likedSpots,
            messages: user.messages
        }
        return userObj
    } else {
        throw "Either the email or password is invalid"
    }
}