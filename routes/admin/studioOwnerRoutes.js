const express = require('express');
const router = express.Router();
const controller = require('../../controllers/studioOwnerController');

router.get('/register', controller.renderForm);
router.post('/register', controller.saveDetails);
router.get('/studio_list', controller.studio_list);
router.post('/studios', controller.getStudiosData);

module.exports = router;
