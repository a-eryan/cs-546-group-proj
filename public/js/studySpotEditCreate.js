//create/edit study spot with validation
console.log("Study spot edit/create validation script loaded");

// Checks if a string is non-empty and trims it
const checkString = (string) => {
	if (!string || typeof string !== 'string')
		throw "You must provide a non-empty string";

	string = string.trim();
	if (string.length === 0)
		throw "You must provide a non-empty string";

	return string;
};

// Checks if a string is a valid title
const checkTitle = (title) => {
	title = checkString(title);

	if (title.length < 6 || title.length > 100)
		throw "The title must be between 6 and 100 characters long";

	return title;
};

// Checks if a string is a valid description
const checkDescription = (description) => {
	description = checkString(description);

	if (description.length < 10 || description.length > 250)
		throw "The description must be between 10 and 250 characters long";

	return description;
};

// Checks if a string is a valid location
const checkLocation = (location) => {
	location = checkString(location);

	if (location.length < 6 || location.length > 50)
		throw "The location must be between 6 and 50 characters long";

	return location;
};

// Checks if a number is a valid noise level (1, 2, or 3)
const checkNoiseLevel = (val) => {
	const num = Number(val);
	
	if (!Number.isInteger(num) || num < 1 || num > 3)
		throw "The noise level must be 1, 2, or 3";

	return num;
};

const checkResources = (arr) => {
	if (!arr)
		return [];

	if (typeof arr === 'string')
		arr = arr.split(',').map(resource => resource.trim());
	else if (!Array.isArray(arr))
		return [];

	if (arr.length === 0)
		return arr;

	const resources = ['printer', 'water fountain', 'vending machine', 'scanner', 'whiteboard', 'outlets', 'external monitors' ];

	const result = [];
	for (let i = 0; i < arr.length; i++) {
		if (!arr[i])
			continue;

		const resource = arr[i].toLowerCase();
		if (!resources.includes(resource))
			throw `Invalid resource ${arr[i]}`;
		result.push(resource);
	}

  return result;
};

document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("uploadForm");
    const displayError = (form, message) => {
        let errorDiv = form.querySelector(".error-message");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            form.prepend(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: "smooth" });
    };

    if (uploadForm){
        uploadForm.addEventListener("submit", (e) => {
            try {
                let title = document.getElementById("title").value;
                let description = document.getElementById("description").value;
                let location = document.getElementById("location").value;
                let noiseLevel = document.getElementById("noiseLevel").value;
                const resourceNodes = document.querySelectorAll('input[name="resourcesNearby"]:checked');
                let resources = Array.from(resourceNodes).map(input => input.value);
                let imageInput = document.getElementById("image");
                
                const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                if (imageInput && imageInput.files && imageInput.files.length > 0) { //needed short circuiting here, imageInput.files would throw an error if imageInput was null 
                    if (!allowedTypes.includes(imageInput.files[0].type)) {
                        throw "Only JPG, PNG, and WEBP images are allowed.";
                    }
                } /*else {
                    throw "Image is required.";
                }*/

                //Will uncomment if making it required
                title = checkTitle(title);
                description = checkDescription(description);
                location = checkLocation(location);
                noiseLevel = checkNoiseLevel(noiseLevel);
                resources = checkResources(resources);
            } catch (error) {
                e.preventDefault();
                displayError(uploadForm, error);
                return;
            }
        });
    }

})