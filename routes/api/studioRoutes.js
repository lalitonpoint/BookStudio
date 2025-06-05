const express = require('express');
const router = express.Router();
const studioController = require('../../controllers/api/studioController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/studios/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/register/step1', studioController.registerStudioStep1);
router.post('/register/step2', upload.fields([{ name: 'logo' }, { name: 'images' }, { name: 'video' }]), studioController.registerStep2);
router.post('/register/step3', studioController.registerStep3);
;

module.exports = router;
