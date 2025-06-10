const express = require('express');
const router = express.Router();


const adminRoutes = require('./routes/admin/adminRoutes'); // Adjust path as needed
const userRoutes = require('./routes/api/userRoutes');
const grievanceRoutes = require('./routes/api/grievanceRoutes');
const categoryRoutes = require('./routes/api/categoryRoutes');
const eventManagerRoutes = require('./routes/admin/eventManager');
const reportsManager = require('./routes/admin/reportsManager');
const studioOwnerRoutes = require('./routes/admin/studioOwnerRoutes');
const admincategoryRoutes = require('./routes/admin/categoryRoutes');
const photoVideographerRoutes = require('./routes/admin/photoVideographerRoutes');
const studioRoutes = require('./routes/api/studioRoutes');
const apiphotoVideographerRoutes = require('./routes/api/photoVideographerRoutes');


router.use('/admin', adminRoutes); // Admin routes under `admin`
router.use('/api/users', userRoutes);
router.use('/studio/', studioOwnerRoutes);
router.use('/photoVideographer/', photoVideographerRoutes);
router.use('/admin/categories', admincategoryRoutes);


// API Routes
router.use('/api/grievances', grievanceRoutes);
router.use('/api/studios', studioRoutes);
router.use('/api/category', categoryRoutes);
router.use('/events/', eventManagerRoutes);
router.use('/reports/', reportsManager);
router.use('/api/photovideographer', apiphotoVideographerRoutes);


module.exports = router;
