const express = require('express');
const router = express.Router();
const photoVideographerController = require('../../controllers/api/photoVideographerController');

router.post('/register', photoVideographerController.register);

module.exports = router;
