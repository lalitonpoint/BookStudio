const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');

router.get('/', categoryController.listCategories);
router.get('/add', categoryController.renderAddForm);
router.post('/add', categoryController.addCategory);
router.get('/edit/:id', categoryController.renderEditForm);
// router.get('/edit/:id', categoryController.getEditCategory);
router.post('/edit/:id', categoryController.updateCategory);
// Toggle active/inactive
router.post('/update-status/:id', categoryController.updateStatus);

module.exports = router;
