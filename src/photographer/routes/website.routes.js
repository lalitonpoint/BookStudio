const express = require('express');
const router = express.Router();
const HomeCtrl = require('../controllers/homePageController');
router.get('/', HomeCtrl.homePage);
module.exports = router; 
