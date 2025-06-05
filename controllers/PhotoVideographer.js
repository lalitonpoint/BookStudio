const PhotoVideographer = require('../models/admin/PhotoVideographer');

// Approve a photographer/videographer
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    await PhotoVideographer.findByIdAndUpdate(id, { is_approved: true });
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await PhotoVideographer.find({ is_approved: false });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Render admin pending users page
exports.renderPendingUsersPage = async (req, res) => {
    try {
      const pendingUsers = await PhotoVideographer.find({ is_approved: false });
      res.render('layouts/main', {
        title: 'Category List',
        currentPage: 'category',
        adminName: req.session.adminName,
        body: '../admin/photovideographer/pendingUsers',
        users: pendingUsers
      });
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
