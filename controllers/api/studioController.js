const Studio = require('../../models/api/Studio');

// Step 1 API: Register Studio Owner & Company Details
exports.registerStudioStep1 = async (req, res) => {
  try {
    const validation = validateStep1Data(req.body);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    const step1Data = req.body;

    // Save logic here (could check if already exists by registeredMobile and update)
    const studio = new Studio(step1Data);
    await studio.save();

    return res.status(200).json({
      success: true,
      message: 'Step 1 data saved successfully',
      studioId: studio._id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while saving Step 1',
      error: error.message
    });
  }
};

// Inline validation for Step 1
function validateStep1Data(data) {
  const {
    registeredMobile,
    owners,
    businessName,
    registrationCirtificate,
    panCard
  } = data;

  if (!registeredMobile || registeredMobile.trim() === '') {
    return { success: false, message: 'Mobile number is required' };
  }

  if (!owners || !Array.isArray(owners) || owners.length === 0) {
    return { success: false, message: 'At least one studio owner is required' };
  }

  for (let i = 0; i < owners.length; i++) {
    const owner = owners[i];
    if (!owner.name || owner.name.trim() === '') {
      return { success: false, message: `Owner name is required for owner ${i + 1}` };
    }
    if (!owner.mobile || owner.mobile.trim() === '') {
      return { success: false, message: `Owner mobile is required for owner ${i + 1}` };
    }
  }

  if (!businessName || businessName.trim() === '') {
    return { success: false, message: 'Business name is required' };
  }

  if (!registrationCirtificate || !Array.isArray(registrationCirtificate) || registrationCirtificate.length === 0) {
    return { success: false, message: 'At least one registration type is required' };
  }

  if (!panCard || panCard.trim() === '') {
    return { success: false, message: 'PAN card is required' };
  }

  return { success: true };
}


exports.registerStep2 = async (req, res) => {
  try {
    const studioId = req.body.id;
    const validation = validateStep2Data(req.body);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    const {
      studioName, type, customType, slogan, bestSuitedFor,
      address, googleMapLink, locality, contactNumbers, studioEmail,
      operationalSince, facilities, additionalFacilities, totalArea,
      usableArea, visibleToUsers
    } = req.body;

    const studio = await Studio.findById(studioId);
    if (!studio) return res.status(404).json({ success: false, message: 'Studio not found' });

    // File handling
    if (req.files) {
      if (req.files.logo) studio.logo = req.files.logo[0].path;
      if (req.files.images) studio.images = req.files.images.map(f => f.path);
      if (req.files.video) studio.video = req.files.video[0].path;
    }

    Object.assign(studio, {
      studioName, type, customType, slogan, bestSuitedFor,
      address, googleMapLink, locality, contactNumbers, studioEmail,
      operationalSince, facilities, additionalFacilities, totalArea,
      usableArea, visibleToUsers
    });

    await studio.save();
    res.status(200).json({ success: true, message: 'Step 2 completed' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error in Step 2' });
  }
};



  function validateStep2Data(data) {
    const requiredFields = [
      'studioName',
      'type',
      'address',
      'googleMapLink',
      'locality',
      'contactNumbers',
      'totalArea',
      'usableArea'
    ];
  
    for (const field of requiredFields) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        return {
          success: false,
          message: `Field '${field}' is required`
        };
      }
    }
  
    return { success: true };
  }
  

  exports.registerStep3 = async (req, res) => {
    try {
      const studioId = req.body.id;
      const validation = validateStep3Data(req.body);
      if (!validation.success) {
        return res.status(400).json(validation);
      }
  
      const {
        website, instagram, facebook, youtube,
        operatingHours, calendar, bookingOptions,
        pricingType, perHourRate, perDayRate, perCustomRate,
        rentPackages, additionalDetails
      } = req.body;
  
      const studio = await Studio.findById(studioId);
      if (!studio) return res.status(404).json({ success: false, message: 'Studio not found' });
  
      Object.assign(studio, {
        website, instagram, facebook, youtube,
        operatingHours, calendar, bookingOptions,
        pricingType, perHourRate, perDayRate, perCustomRate,
        rentPackages, additionalDetails
      });
  
      await studio.save();
      res.status(200).json({ success: true, message: 'Step 3 completed. Studio registration is complete.' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error in Step 3' });
    }
  };
  

  function validateStep3Data(data) {
    const {
      pricingType,
      bookingOptions,
      operatingHours,
    } = data;
  
    if (!pricingType) {
      return { success: false, message: 'Pricing type is required' };
    }
  
    if (!bookingOptions || !Array.isArray(bookingOptions) || bookingOptions.length === 0) {
      return { success: false, message: 'At least one booking option is required' };
    }
  
    if (!operatingHours || typeof operatingHours !== 'object') {
      return { success: false, message: 'Operating hours must be provided' };
    }
  
    return { success: true };
  }
  