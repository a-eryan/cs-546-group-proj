console.log("Forum comment validation script loaded");

// Checks if a string is non-empty and trims it
const checkString = (string) => {
	if (!string || typeof string !== 'string')
		throw "You must provide a non-empty string";

	string = string.trim();
	if (string.length === 0)
		throw "You must provide a non-empty string";

	return string;
};

// Checks if a string is valid content
const checkContent = (content) => {
	content = checkString(content);

	if (content.length > 250)
		throw "The content must be less than 250 characters long";

	return content;
};

document.addEventListener('DOMContentLoaded', () => {
	const commentForm = document.querySelector('.comment-form');

	if (commentForm) {
		commentForm.addEventListener('submit', (e) => {
			// Validate the comment content
			const commentContent = commentForm.querySelector('textarea').value;

			try {
				checkContent(commentContent);
			} catch (e) {
				e.preventDefault();

				let errorDiv = document.querySelector('.error-message');
				if (!errorDiv) {
					errorDiv = document.createElement('div');
					errorDiv.className = 'error-message';
					commentForm.prepend(errorDiv);
				}
				
				errorDiv.textContent = e;
				errorDiv.scrollIntoView({ behavior: 'smooth' });
			}
		});
	}
});