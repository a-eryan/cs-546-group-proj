import { Router } from 'express';
import { checkEmail, checkPassword } from '../helpers.js';
import { login, register } from '../data/users.js';
import xss from 'xss';

const router = Router()

// GET the login page
router.get('/login', (req, res) => {
	try {
		return res.render('login');
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

// POST the login form
router.post('/login', async (req, res) => {
	try {
		// Validate the email and password
		const email = checkEmail(xss(req.body.email));
		const password = checkPassword(xss(req.body.password));

		// Log the user in and redirect them to the study spots page
		req.session.user = await login(email, password);
		return res.redirect('/studyspots');
	} catch (e) {
		return res.status(400).render('login', { error: e });
	}
});

// GET the registration page
router.get('/register', (req, res) => {
	try {
		return res.render('register');
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

// POST the registration form
router.post('/register', async (req, res) => {
	try {
		// Validate the passwords
		const password = checkPassword(xss(req.body.password));
		const confirmPassword = xss(req.body.confirmPassword); // No need to checkPassword

		if (password !== confirmPassword)
			return res.status(400).render('register', { error: "Passwords do not match" });

		// Register the user and redirect to the login page
		const email = checkEmail(xss(req.body.email));

		await register(email, password);
		return res.redirect('/login');
	} catch (e) {
		return res.status(400).render('register', { error: e });
	}
});

// GET the logout page
router.get('/logout', (req, res) => {
	try {
		// Destroy the session
		req.session.destroy(err => {
			if (err) // Render the error page if session destruction fails
				return res.status(500).render('error', { error: "Failed to logout, please try again" });
			
			// Clear the cookie
			res.set('Cache-Control', 'no-store');
			res.set('Pragma', 'no-cache');
			res.set('Expires', '0');
			res.clearCookie('AuthenticationState');

			// Redirect to login
			return res.redirect('/login');
		});
	} catch (e) {
		return res.status(500).json({ error: e });
	}
});

export default router