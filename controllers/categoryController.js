const Category = require('../models/admin/Category');
const { uploadImage } = require("../utils/uploadHelper"); // Import helper for file upload
const multiparty = require('multiparty');

const moment = require('moment'); // For date manipulation
const { generateLogs } = require('../utils/logsHelper');

// List all categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: { $ne: 3 } }).lean();
    res.render('layouts/main', {
      title: 'Category List',
      currentPage: 'category',
      adminName: req.session.adminName,
      body: '../admin/category/list',
      data: { categories }
    });
  } catch (error) {
    console.error('Error listing categories:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Render Add Form
exports.renderAddForm = (req, res) => {
  try {
    res.render('layouts/main', {
      title: 'Add Category',
      currentPage: 'category',
      adminName: req.session.adminName,
      body: '../admin/category/add',
    });
  } catch (error) {
    console.error('Error rendering add form:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Handle Add

exports.addCategory = async (req, res) => {
  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).send('File parsing error');
      }

      const type = fields.type[0];
      const category = fields.category[0];
      const subcategories = fields.subcategories[0];

      const subcatArray = subcategories.split(',').map(item => ({
        name: item.trim(),
        isChecked: true,
      }));

      const file = files.categoryimage ? files.categoryimage[0] : null;

      let categoryimage = '';
      if (file) {
        const result = await uploadImage(file);
        if (result.success) {
          categoryimage = result.url;
        } else {
          console.error('Error uploading image:', result.error || result.message);
          return res.status(500).json({ error: 'Failed to upload banner image' });
        }
      }

      await Category.create({
        type,
        category,
        categoryimage,
        subcategories: subcatArray,
      });

      await generateLogs(req, 'Add', Category);
      res.redirect('/admin/categories');
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).send('Internal Server Error');
  }
};


// Render Edit Form
exports.renderEditForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.render('layouts/main', {
      title: 'Edit Category',
      currentPage: 'category',
      adminName: req.session.adminName,
      body: '../admin/category/edit',
      data: { category }
    });
   // console.log(data);
  } catch (error) {
    console.error('Error rendering edit form:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Handle Update
exports.updateCategory = async (req, res) => {
    const form = new multiparty.Form();
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).send('Form processing error');
      }
  
      const type = fields.type?.[0] || '';
      const categoryName = fields.category?.[0] || '';
      const subcategoriesStr = fields.subcategories?.[0] || '';
      const subcategories = subcategoriesStr.split(',').map(item => ({
        name: item.trim(),
        isChecked: true
      }));
  
      let categoryimage = null;
      const file = files.categoryimage?.[0];
  
      if (file && file.originalFilename) {
        const uploadResult = await uploadImage(file);
        if (uploadResult.success) {
          categoryimage = uploadResult.url;
        } else {
          console.error('Upload failed:', uploadResult.error || uploadResult.message);
          return res.status(500).send('Image upload failed');
        }
      }
  
      try {
        const updateData = {
          type,
          category: categoryName,
          subcategories
        };
  
        if (categoryimage) {
          updateData.categoryimage = categoryimage;
        }
  
        await Category.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/categories');
      } catch (err) {
        console.error('Update failed:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  };

  exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      await Category.updateOne({ _id: id }, { $set: { status: parseInt(status) } });
      return res.json({ success: true });
    } catch (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  