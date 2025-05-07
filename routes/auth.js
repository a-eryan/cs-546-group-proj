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
            const user = await login(email, password)

            req.session.user = {
                email: user.email,
                isAdmin: user.isAdmin,
                achievements: user.achievements,
                uploadedSpots: user.uploadedSpots,
                likedSpots: user.likedSpots,
                messages: user.messages
            }

            return res.redirect('/home')
        } catch (e) {
            console.log(e)
            return res.status(400).render('login', { error: e })
        }
    })

router.route('/home').get(async(req, res) => {
    try{
        return res.render('home')
    } catch (e) {
        console.log(e)
    }
})

export default router