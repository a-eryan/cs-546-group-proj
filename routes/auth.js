//allow only stevens.edu domains to log in/register
//docs: https://developers.google.com/identity
import { Router } from "express";
import { checkEmail, checkPassword } from "../helpers.js";
import { login, register } from "../data/users.js";
const router = Router()

router
    .route('/register')
    .get(async(req, res) => {
        //code here for GET
        try {
            return res.render('register')
        } catch (e) {
            return res.status(500).json({error: e})
        }
    })
    .post(async(req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password
            let confirmPassword = req.body.confirmPassword

            email = checkEmail(email)
            password = checkPassword(password)
            confirmPassword = checkPassword(confirmPassword)

            if (password !== confirmPassword){
                return res.status(400).render('register', {
                  error: "The passwords do not match"
                })
            }

            const registered = await register(email, password)
            if (registered.registrationCompleted){
                return res.redirect('/login')
            } else {
                return res.status(500).render('error', {error: "Internal Server Error"})
            }
        } catch (e) {
            console.log(e)
            return res.status(400).render('register', { error: e})
        }
    })

router
    .route('/login')
    .get(async(req, res) => {
        try {
            return res.render('login')
        } catch (e) {
            return res.status(500).json({error: e})
        }
    })
    .post(async(req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password
            if (!email || !password){
                return res.status(400).render('login', {
                    error: 'Email or password not provided'
                })
            }

            email = checkEmail(email)
            password = checkPassword(password)

            req.session.user = await login(email, password);

            return res.redirect('/studyspots')
        } catch (e) {
            console.log(e)
            return res.status(400).render('login', { error: e })
        }
    })

router.route('/logout').get(async (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).render('error', { error: 'Failed to logout. Please try again.' });
      }

      res.set('Cache-Control', 'no-store');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.clearCookie('AuthenticationState'); // Optional, depending on your session cookie name
      return res.redirect('/login');
    });
  } catch (e) {
    return res.status(500).render('error', { error: 'Internal Server Error' });
  }
});

export default router