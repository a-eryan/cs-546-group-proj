console.log("Forum edit validation script loaded");

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

document.addEventListener('DOMContentLoaded', () => {
	// Get the edit forum form
	const editForumForm = document.getElementById('editForumForm');
	
	if (editForumForm) {
		editForumForm.addEventListener('submit', (e) => {
			// Get the title and content inputs
			const title = document.getElementById('title').value;
			const content = document.getElementById('content').value;

			// Validate the title and content
			let isValid = true;
			let errorMessage = "";
			
			try {
				checkTitle(title);
				checkDescription(content);
			} catch (e) {
				isValid = false;
				errorMessage = e;
			}

			if (!isValid) {
				e.preventDefault();
						
				let errorDiv = document.querySelector('.error-message');
				if (!errorDiv) {
					errorDiv = document.createElement('div');
					errorDiv.className = 'error-message';
					editForumForm.prepend(errorDiv);
				}
						
				errorDiv.textContent = errorMessage;
				errorDiv.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}
});