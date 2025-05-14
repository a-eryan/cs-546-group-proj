import { ObjectId } from 'mongodb';

// Checks if a string is non-empty and trims it
export const checkString = (string) => {
	if (!string || typeof string !== 'string')
		throw "You must provide a non-empty string";

	string = string.trim();
	if (string.length === 0)
		throw "You must provide a non-empty string";

	return string;
};

// Checks if a string is a valid ObjectId
export const checkID = (id) => {
	try {
		id = checkString(id);
	} catch {
		throw "A non-empty string ID must be provided";
	}

	if (!ObjectId.isValid(id))
		throw `Invalid object ID ${id}`;

	return id;
};

// Checks if a string is a valid Stevens email
export const checkEmail = (email) => {
	email = checkString(email).toLowerCase();

	if (email.length > 72)
		throw "Email must be less than 72 characters long";

	if (email.includes(' '))
		throw "Email can't contain empty spaces";

	if (!/^[^\s@]+@stevens\.edu$/i.test(email))
		throw "A valid Stevens email address must be provided";

	return email;
};

// Checks if a string is a password of at least 8 characters with one uppercase letter, one number, and one special character
export const checkPassword = (password) => {
	if (!password || typeof password !== 'string')
		throw "You must provide a password";
	
	if (password.includes(' '))
		throw "Password cannot contain spaces";

	if (password.length < 8 || password.length > 64)
		throw "Password must be between 8 and 64 characters long";

	if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password))
		throw "Password must have at least one uppercase letter, one number, and one special character";

	return password;
};

// Checks if a string is a valid title
export const checkTitle = (title) => {
	title = checkString(title);

	if (title.length < 6 || title.length > 100)
		throw "The title must be between 6 and 100 characters long";

	return title;
};

// Checks if a string is a valid description
export const checkDescription = (description) => {
	description = checkString(description);

	if (description.length < 10 || description.length > 250)
		throw "The description must be between 10 and 250 characters long";

	return description;
};

// Checks if a string is valid content
export const checkContent = (content) => {
	content = checkString(content);

	if (content.length > 250)
		throw "The content must be less than 250 characters long";

	return content;
};

// Checks if a string is a valid location
export const checkLocation = (location) => {
	location = checkString(location);

	if (location.length < 6 || location.length > 50)
		throw "The location must be between 6 and 50 characters long";

	return location;
};

// Formats a date of a created resource to be MM/DD/YY HH:MM AM/PM
export function getCreatedDate() {
	const now = new Date();
	const day = String(now.getDate()).padStart(2, '0');
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const year = now.getFullYear();

	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';

	hours = hours % 12;
	hours = hours ? hours : 12;
	const formattedHour = String(hours).padStart(2, '0');

	return `${month}/${day}/${year} ${formattedHour}:${minutes}${ampm}`;
};

// Checks if a number is a valid noise level (1, 2, or 3)
export const checkNoiseLevel = (val) => {
	const num = Number(val);
	
	if (!Number.isInteger(num) || num < 1 || num > 3)
		throw "The noise level must be 1, 2, or 3";

	return num;
};

// Checks if an array contains only valid resources
export const checkResources = (arr) => {
	if (!arr || !Array.isArray(arr))
		throw "A resources array must be provided";
	
	const resources = ['printer', 'water fountain', 'vending machine', 'scanner', 'whiteboard', 'outlets', 'external monitors' ];

	arr.forEach(resource => {
		if (!resources.includes(resource.toLowerCase()))
			throw `Invalid resource ${resource}`;
	});

  return arr;
};

export const checkReviewProperties = (spotId, userId, title, content, rating) => {
	// Ensure that all string properties are provided
	try {
		spotId = checkID(spotId);
		userId = checkID(userId);
		title = checkTitle(title);
		content = checkContent(content);
	} catch {
		throw "A review must have an associated study spot, reviewer, title, and content";
	}

	// Ensure that the rating is a number between 1 and 5
	if (!rating || typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5)
		throw "The review rating must be an integer between 1 and 5";

	return { spotId, userId, title, content, rating };
}

export const calculateAverageRating = (reviews) => {
	// Ensure the ratings array consists of only numbers
	if (!reviews || !Array.isArray(reviews))
		throw "An array of reviews must be provided";

	// The rating is 0 if there are no ratings
	if (reviews.length === 0)
		return 0;

	// Ensure that all reviews have a rating property
	reviews.forEach(review => {
		if (typeof review.rating !== 'number')
			throw "Not all reviews have a valid rating";
	});

	// Calculate the average rating and round it to one decimal place
	const sum = reviews.reduce((total, review) => total + review.rating, 0);
	const average = sum / reviews.length;
	return Math.round(average * 10) / 10;
};

export const validateReviewComment = (reviewId, userId, comment) => {
	reviewId = checkID(reviewId);
	userId = checkID(userId);
	comment = checkString(comment);
	return { reviewId, userId, comment };
}