const StudioOwner = require('../models/api/Studio');

exports.renderForm = (req, res) => {
    //res.render('admin/studio/studioOwnerForm', { error: null });
    res.render('layouts/main', {
        title: 'studioOwnerForm',
        currentPage: 'studioOwnerForm', // Set the current page for the sidebar
        adminName: req.session.adminName,
        body: '../admin/studio/studioOwnerForm',
        //events: JSON.stringify(events), // Pass events as JSON string
    });
};

exports.saveDetails = async (req, res) => {
  try {
    const {
      registeredMobile,
      ownerNames,
      ownerMobiles,
      emails,
      idCards,
      businessName,
      registrationTypes,
      gstNumber,
      panCard,
      fssaiLicense
    } = req.body;

    if (!Array.isArray(ownerNames) || ownerNames.length === 0) {
      return res.status(400).send("At least one owner must be added.");
    }

    const owners = ownerNames.map((name, i) => ({
      name,
      mobile: ownerMobiles[i]
    }));

    const newOwner = new StudioOwner({
      registeredMobile,
      owners,
      emails: emails || [],
      idCards: idCards || [],
      businessName,
      registrationTypes,
      gstNumber,
      panCard,
      fssaiLicense
    });

    await newOwner.save();
    res.send("Studio Owner Details Saved Successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.studio_list = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    try {
        const citizens = await StudioOwner.find({}, 'name email pinCode state district mobile').exec();

        res.render('layouts/main', {
            title: 'Studio List',
            currentPage: 'studio_list',
            adminName: req.session.adminName,
            body: '../admin/studio/studio_list', // ✅ Fixed relative path
            citizens
        });
    } catch (err) {
        console.error('Error fetching Studios:', err.message);
        res.status(500).render('layouts/main', {
            title: 'Error',
            currentPage: 'studio_list',
            adminName: req.session.adminName,
            body: '../admin/error',  // ✅ Also a relative path
            errorTitle: 'Internal Server Error',
            errorMessage: 'Something went wrong while fetching Studio data.',
            redirectUrl: '/studio/studio_list',
        });
    }
};

exports.getStudiosData = async (req, res) => {
  try {
    let draw = parseInt(req.body.draw) || 0;
    let start = parseInt(req.body.start) || 0;
    let length = parseInt(req.body.length) || 10;
    let search = req.body.search?.value || '';
    let orderColumnIndex = req.body.order ? parseInt(req.body.order[0].column) : 0;
    let orderDir = req.body.order ? req.body.order[0].dir : 'desc';

    const columns = [
      'registeredMobile',
      'owners',
      'ownerEmails',
      // 'idCards',
      'businessName',
      'registrationCirtificate',
      'gstNumber',
      'panCard',
      'fssaiLicense'
    ];
    const orderColumn = columns[orderColumnIndex] || '_id';

    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { registeredMobile: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { panCard: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const totalRecords = await StudioOwner.countDocuments({});
    const totalFiltered = await StudioOwner.countDocuments(searchQuery);

    const studios = await StudioOwner.find(searchQuery)
      .sort({ [orderColumn]: orderDir === 'asc' ? 1 : -1 })
      .skip(start)
      .limit(length)
      .exec();

    res.json({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalFiltered,
      data: studios
    });
  } catch (error) {
    console.error('Error fetching studio data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
