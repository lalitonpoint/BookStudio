const express = require('express');
const router = express.Router();
const LoginCtrl = require('../controllers/loginController');

router.get('/', LoginCtrl.loginPage);
router.get('/dashboard', (req, res) => { title: 'Admin Dashboard' });
module.exports = router; 
