//Client side validation for authentication (login and register)
console.log("Auth validation script loaded");

const checkString = (string) => {
  if (!string) throw 'You must provide a string'
  if (typeof string !== 'string') throw `${string} must be a string`
  string = string.trim()
  if (string.length === 0)
      throw `${string} cannot be an empty string or string with just spaces`
  return string
}

const checkEmail = (email) => {
  email = checkString(email);

  if (email.includes(' '))
    throw `${email} can't contain empty spaces`;

  if (!/^[^\s@]+@stevens\.edu$/i.test(email))
    throw `${email} must be a valid Stevens email address`;

  return email;
};

const checkPassword = (password) => {
  if (!password || typeof password !== 'string')
    throw "You must provide a password";
  
  if (password.includes(' '))
    throw "Password cannot contain spaces";

  if (password.length < 8)
    throw "Password needs to be at least 8 characters long";

  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password))
    throw "Password needs to have atleast one uppercase letter, one number, and one special character";

  return password;
};

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

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

  if (registerForm){
    registerForm.addEventListener("submit", (e) => {
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;
      let confirmPassword = document.getElementById("confirmPassword").value;

      try {
        email = checkEmail(email);
      } catch (error) {
        e.preventDefault();
        displayError(registerForm, error);
        return;
      }

      try {
        password = checkPassword(password);
      } catch (error) {
        e.preventDefault();
        displayError(registerForm, error);
        return;
      }

      try {
        confirmPassword = checkPassword(confirmPassword);
      } catch (error) {
        e.preventDefault();
        displayError(registerForm, error);
        return;
      }

      if (password !== confirmPassword) {
          e.preventDefault();
          displayError(registerForm, "Passwords do not match.");
          return;
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      let email = document.getElementById("email").value;
      let password = document.getElementById("password").value;

      try {
        email = checkEmail(email);
      } catch (error) {
        e.preventDefault();
        displayError(loginForm, error);
        return;
      }

      try {
        password = checkPassword(password);
      } catch (error) {
        e.preventDefault();
        displayError(loginForm, error);
        return;
      }
    });
  }
});