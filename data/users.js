import { users } from '../config/mongoCollections.js';
import { checkEmail, checkPassword, checkID } from '../helpers.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const saltRounds = 1;

export const register = async (email, password) => {
	// Validate the email and password
	email = checkEmail(email);
	password = checkPassword(password);

	// Ensure the email is not already registered
	const userCollection = await users();
	const duplicateUser = await userCollection.findOne({ email: email });

	if (duplicateUser)
			throw `${email} is already registered, please log in instead`

	// Create the new user
	const hashedPassword = await bcrypt.hash(password, saltRounds)
	const newUser = {
		email: email,
		password: hashedPassword,
		achievements: [],
		uploadedSpots: []
	}

	const insertInfo = await userCollection.insertOne(newUser)
	if (!insertInfo.acknowledged || !insertInfo.insertedId)
		throw `Could not add user ${email}`

	return insertInfo.insertedId.toString();
};

export const login = async (email, password) => {
	// Validate the email and password
	email = checkEmail(email);
	password = checkPassword(password);

	// Find the user by email
	const userCollection = await users()
	const user = await userCollection.findOne({ email: email })
	if (!user) throw "Incorrect email or password";

	// Compare the user's password with the hashed password
	const match = await bcrypt.compare(password, user.password)
	if (!match) throw "Incorrect email or password";

	user._id = user._id.toString();
	return user;
}

export const getEmailById = async (userId) => {
	// Validate the user ID
	userId = checkID(userId);
	
	// Find the user by ID
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(userId) });
	
	if (!user || !user.email)
		throw `User ${userId} not found`;

	return user.email;
};