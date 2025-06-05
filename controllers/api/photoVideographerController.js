const PhotoVideographer = require('../../models/admin/PhotoVideographer');
const bcrypt = require('bcryptjs');

// Register PhotoVideographer
exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      profile_pic,
      logo,
      profession,
      profession_type,
      about_you,
      experience_year,
      location,
      travel,
      expertise,
      certification,
      equipments,
      clients,
      portfolio,
      instagram,
      facebook,
      youtube,
      website,
      availability,
      rate_per_day,
      rate_per_hour,
      additional_packages,
      contact_whatsapp,
      contact_call,
      contact_email,
      booking_link,
      additional_info,
      role
    } = req.body;

    // Check if user exists
    const existingUser = await PhotoVideographer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status : false, message: 'Email already registered' });
    }
    // Create new user object
    const newUser = new PhotoVideographer({
      full_name,
      email,
      phone,
      profile_pic,
      logo,
      profession,
      profession_type,
      about_you,
      experience_year,
      location,
      travel,
      expertise,
      certification,
      equipments,
      clients,
      portfolio,
      instagram,
      facebook,
      youtube,
      website,
      availability,
      rate_per_day,
      rate_per_hour,
      additional_packages,
      contact_whatsapp,
      contact_call,
      contact_email,
      booking_link,
      additional_info,
      role,
      is_approved: false, // default
    });

    await newUser.save();

    res.status(201).json({ status : true, message: 'Registration successful, pending approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status : false, messge: 'Server error' });
  }
};
