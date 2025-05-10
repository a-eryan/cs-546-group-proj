import { ObjectId } from "mongodb";

export const checkString = (string) => {
    if (!string) throw 'You must provide a string'
    if (typeof string !== 'string') throw `${string} must be a string`
    string = string.trim()
    if (string.length === 0)
        throw `${string} cannot be an empty string or string with just spaces`
    return string
}
export const checkID = (id) => {
    if (!id) throw 'You must provide an id to search for'
    if (typeof id !== 'string') throw `${id} must be a string`
    id = id.trim()
    if (id.length === 0)
        throw `${id} cannot be an empty string or just spaces`
    if (!ObjectId.isValid(id)) throw 'invalid object ID'
    return id
}
export const checkEmail = (email) => {
    email = checkString(email)
    if (email.includes(' '))
        throw `${email} can't contain empty spaces`
    if (!/^[^\s@]+@stevens\.edu$/.test(email))
        throw `${email} must be a valid Stevens email address`;
    return email
}
export const checkPassword = (password) => {
    password = checkString(password)
    if (password.includes(' '))
        throw `Password can't contain spaces`
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password))
        throw `Password needs to have atleast one uppercase letter, one number, and one special character`
    if (password.length < 8)
        throw `Password needs to be at least 8 characters long`
    return password
}
export const checkTitle = (title) => {
    title = checkString(title)
    if (title.length < 6)
        throw `${title} needs to be atleast 6 characters long`
    return title
}
export const checkDescription = (description) => {
    description = checkString(description)
    if (description.length < 10)
        throw `${description} needs to be atleast 10 characters long`
    return description
}
export const checkLocation = (location) => {
    location = checkString(location)
    if (location.length < 8)
        throw `${location} needs to be atleast 8 characters long`
    return location
}

export function getCreatedDate() {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()

    let hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    hours = hours ? hours : 12
    const formattedHour = String(hours).padStart(2, '0')

    return `${month}/${day}/${year} ${formattedHour}:${minutes}${ampm}`
}
// created for study spot upload
export const checkNoiseLevel = (val) => {
    const num = Number(val);
    if (!Number.isFinite(num) || num < 1 || num > 3) {
        throw `${val} must be a number between 1 and 3`;
    }
    return num;
}

export const checkResources = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw 'Resources must be a non-empty array';
    }
    const valid = ['printer', 'water fountain', 'vending machine', 'scanner', 'whiteboard', 'outlets', 'external monitors' ];
    arr.forEach(r => { if (!valid.includes(r)) throw `Invalid resource ${r}`; });
  return arr; // not sure if we are going to turn this into check boxes yet, for now still string input.
}

export const checkReviewProperties = (spotId, userId, title, content, rating) => {
	// Ensure that all string properties are provided
	try {
		spotId = checkString(spotId);
		userId = checkString(userId);
		title = checkString(title);
		content = checkString(content);
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