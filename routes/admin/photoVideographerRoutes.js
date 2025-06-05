const express = require('express');
const router = express.Router();
const controller = require('../../controllers/PhotoVideographer');


router.get('/pending-users', controller.renderPendingUsersPage);

// API routes remain same for approve action
// router.get('/api/pending-users', controller.getPendingUsers);
// router.put('/api/approve/:id', controller.approveUser);

module.exports = router;
