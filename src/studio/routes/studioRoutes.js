const express = require('express');
const router = express.Router();
const LoginCtrl = require('../controllers/loginController');
const HomeCtrl = require('../controllers/homePageController');
const ProfileCtrl = require('../controllers/profileController');
const checkLoggedIn = require('../middleware/checkLoggedIn');


// router.get('*', LoginCtrl.notFound);
// ********************** Login Route **********************
router.get('/', checkLoggedIn, LoginCtrl.loginPage);
router.get('/createAccount', checkLoggedIn, LoginCtrl.createAccountPage);
router.get('/otp', LoginCtrl.otpPage);
router.post('/addUser', LoginCtrl.addUser);
router.post('/checkLogin', LoginCtrl.checkLogin);
// ********************** Login Route **********************
router.use(checkLoggedIn);

// ********************** Dashboard Route **********************
router.get('/dashboard', HomeCtrl.homePage);
router.get('/profile', ProfileCtrl.profilePage);



// ********************** Dashboard Route **********************



module.exports = router; 
