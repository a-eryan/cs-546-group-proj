console.log("Auth validation script loaded");

// Checks if a string is non-empty and trims it
const checkString = (string) => {
	if (!string || typeof string !== 'string')
		throw "You must provide a non-empty string";

	string = string.trim();
	if (string.length === 0)
		throw "You must provide a non-empty string";

	return string;
};

// Checks if a string is a valid Stevens email
const checkEmail = (email) => {
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
const checkPassword = (password) => {
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

document.addEventListener('DOMContentLoaded', () => {
	// Get the register and login forms
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

	// Function to display any errors
  const displayError = (form, message) => {
    let errorDiv = form.querySelector('.error-message');
    if (!errorDiv) {
			errorDiv = document.createElement('div');
			errorDiv.className = 'error-message';
			form.prepend(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth' });
  };

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
			// Get the email, password, and confirm password values
			const email = document.getElementById('email').value;
			let password = document.getElementById('password').value;
			let confirmPassword = document.getElementById('confirmPassword').value;

			// Display errors if any of the fields are invalid or the passwords do not match
			try {
				checkEmail(email);
				password = checkPassword(password);
			} catch (error) {
				e.preventDefault();
				displayError(registerForm, error);
				return;
			}

			if (password !== confirmPassword) {
				e.preventDefault();
				displayError(registerForm, "Passwords do not match");
				return;
			}
		});
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
			// Get the email and password
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        checkEmail(email);
				checkPassword(password);
      } catch (error) {
        e.preventDefault();
        displayError(loginForm, error);
        return;
      }
    });
  }
});