const { uploadImage } = require("../utils/uploadHelper"); // Import helper for file upload
const multiparty = require('multiparty');
const moment = require('moment'); // For date manipulation
const Studio = require('../models/studioModel'); // For date manipulation

const profilePage = (req, res) => {
    res.render('pages/profile');
    // res.render('pages/login/login', { title: 'OnPoints Admin ', layout: false });

}


const saveStudio = async (req, res) => {
    try {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(400).json({ success: false, message: "Invalid form data" });
            }

            // Extract personal details
            const name = fields.name?.[0];
            const mobile = fields.mobile?.[0];
            const email = fields.email || []; // multiple
            const panCardNumber = fields.panCardNumber?.[0];
            const businessName = fields.businessName?.[0] || '';
            const gstNumber = fields.gstNumber?.[0] || '';
            const fssaiLicense = fields.fssaiLicense?.[0] || '';

            // PAN card file
            const panCardFile = files.panCardId?.[0];

            // Validate required fields
            const missingFields = [];
            if (!name) missingFields.push('name');
            if (!mobile) missingFields.push('mobile');
            if (!panCardNumber) missingFields.push('panCardNumber');
            if (!panCardFile) missingFields.push('panCardIdr');

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // Upload PAN card file
            let panCardIdrUrl = '';
            if (panCardFile) {
                const result = await uploadFile(panCardFile); // your custom function
                if (!result.success) {
                    return res.status(500).json({ success: false, message: "PAN card upload failed" });
                }
                panCardIdrUrl = result.url;
            }

            // Save to DB
            const newStudio = new Studio({
                personalDetail: {
                    name,
                    mobile,
                    email,
                    panCardNumber,
                    panCardIdr: panCardIdrUrl,
                    businessName,
                    gstNumber,
                    fssaiLicense
                },
                step: 1,
                approvalStatus: 0 // default inactive
            });

            await newStudio.save();

            res.status(201).json({
                success: true,
                message: "Studio saved successfully",
                data: newStudio
            });
        });
    } catch (error) {
        console.error("Studio save error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { profilePage, saveStudio }