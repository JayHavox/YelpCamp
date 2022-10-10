const express = require('express');
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const router = express.Router();
const users = require('../controllers/users')


router.route('/register')
.get(users.renderRegister)
.post( catchAsync(users.register))

router.route('/login')
.get( users.renderLogin)
.post( passport.authenticate('local', { failureFlash: true, keepSessionInfo: true, failureRedirect: '/login' }), users.login) // so passport will do this locally but you can create other ones for google, facebook and things like that failure flash will flash a msg that is wrong and redirect will redirect it back to the homepage


router.get('/logout', users.logout)

module.exports = router;