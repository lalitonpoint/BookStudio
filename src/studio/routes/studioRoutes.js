const express = require('express');
const router = express.Router();
const LoginCtrl = require('../controllers/loginController');
const HomeCtrl = require('../controllers/homePageController');

// ********************** Login Route **********************
router.get('/', LoginCtrl.loginPage);
router.get('/createAccount', LoginCtrl.createAccountPage);
router.get('/otp', LoginCtrl.otpPage);
router.post('/addUser', LoginCtrl.addUser);
router.post('/checkLogin', LoginCtrl.checkLogin);
// ********************** Login Route **********************

// ********************** Dashboard Route **********************
router.get('/dashboard', HomeCtrl.homePage);


// ********************** Dashboard Route **********************



module.exports = router; 
