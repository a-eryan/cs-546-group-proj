console.log("Report form script loaded");

// Checks if a string is non-empty and trims it
const checkString = (string) => {
	if (!string || typeof string !== 'string')
		throw "You must provide a report reason";

	string = string.trim();
	if (string.length === 0)
		throw "You must provide a report reason";

	return string;
};

// Checks if a string is a valid description
const checkDescription = (description) => {
	description = checkString(description);

	if (description.length < 10 || description.length > 250)
		throw "The report reason must be between 10 and 250 characters long";

	return description;
};

document.addEventListener('DOMContentLoaded', () => {
	// Get the report form, reason textarea, and character counter
	const reportForm = document.getElementById('reportForm');
	const reasonTextarea = document.getElementById('reason');
	const charCount = document.getElementById('char-count');
	
	if (reportForm && reasonTextarea) {
		//Update the character counter as thge user types
		reasonTextarea.addEventListener('input', () => {
			const length = reasonTextarea.value.length;
			charCount.textContent = length;

			// Visual warning when approaching the limit
			charCount.style.color = length > 200 ? '#f0ad4e' : '';
		});
		
		// Initialize the character counter
		charCount.textContent = reasonTextarea.value.length;
		
		reportForm.addEventListener('submit', (e) => {
			// Clear previous errors
			const errorDiv = document.querySelector('.error-message');
			if (errorDiv && !errorDiv.hasAttribute('data-server-error'))
				errorDiv.remove();

			// Validate the reason
			const reason = reasonTextarea.value;

			try {
				checkDescription(reason);
			} catch (error) {
				e.preventDefault();

				let errorDiv = document.querySelector('.error-message');
				if (!errorDiv) {
					errorDiv = document.createElement('div');
					errorDiv.className = 'error-message';
					reportForm.prepend(errorDiv);
				}

				errorDiv.textContent = error;
				errorDiv.scrollIntoView({ behavior: 'smooth' });
				return;
			}
		});
	}
});