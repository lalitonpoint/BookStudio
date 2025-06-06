const express = require('express');
const router = express.Router();
const Grievance = require('../../models/api/Grievance');
const Admin = require('../../models/admin/Admin');
const auth = require('../../middleware/auth'); // Middleware for authentication
const multer = require('multer');
const { getNextGrievanceId } = require('../../helpers/grievance_helper'); // Ensure correct path
const { detect } = require('langdetect');
const langs = require('langs');
const BhashiniHelper = require('../../helpers/bhashiniHelper');


// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Create a grievance
router.post('/create', auth, upload.array('attachments'), async (req, res) => {
    try {
        const {
            subject,
            onBehalf,
            aadharNumber,
            catId,
            ministryId,
            contactInformation,
            description,
            nature,
            moreDescription,
            assignedDepartment,
            resolutionDeadline,
            stateAnddistrict,
            proposedResolution,
            priority,
            sentiment
        } = req.body;

        // Ensure all required fields are provided
        if (!subject || !contactInformation || !description) {
            return res.status(400).json({ status: false, error: 'Required fields are missing.' });
        }
        //const admin = await Admin.findOne(); //{ ministry: ministryId }
        // if (!admin) {
        //     return res.status(404).json({ status: false, error: 'Admin not found for the specified ministryId.' });
        // }

        //console.log('Admin lookup result:', admin);
        const userId =  req.user._id;
        const username = req.user.name;
        
        const status = 'Pending';
        let userLang ='English';
        // Generate Grievance ID dynamically
        const grievanceId = await getNextGrievanceId();

        // Check if there are uploaded files and map their paths
        const attachments = req.files && req.files.length > 0
            ? req.files.map(file => file.path)
            : [];


        let assignedTo = 'lalit@appsquadz.com';
        const text = description;
        const detectedLanguages = detect(text);
        if (detectedLanguages.length > 0) {
            const langCode = detectedLanguages[0].lang; // Get the most probable language code
            language = langs.where("1", langCode); // Map it to the full name

            console.log(`Detected Language: ${language ? language.name : 'Unknown'}`);
        } else {
            console.log("Could not detect language");
        }

        if (language && language.name) { // Check if language is not null
            // if (language.name === 'Hindi') assignedTo = 'deepak@appsquadz.com';
            // if (language.name === 'English') assignedTo = 'lalit@appsquadz.com';
            // if (language.name === 'Afrikaans') assignedTo = 'lalit@appsquadz.com';
            // if (language.name === 'Urdu') assignedTo = 'deepak@appsquadz.com';
            userLang = language.name;
        }
        // Create a new grievance document
        const grievance = new Grievance({
            grievanceId,
            subject,
            catId: catId,
            ministryId: ministryId,
            aadharNumber: aadharNumber,
            submittedBy: username,
            onBehalf:onBehalf,
            userId,
            contactInformation,
            description,
            nature:nature,
            moreDescription: moreDescription,
            assignedDepartment,
            assignedTo,
            userLang,
            resolutionDeadline,
            stateAnddistrict,
            proposedResolution,
            attachments,
            priority: priority,
            sentiment:sentiment
        });

        const savedGrievance = await grievance.save();

        res.status(201).json({
            status: true,
            message: 'Grievance created successfully',
            grievance: savedGrievance
        });
    } catch (err) {
        console.error('Error creating grievance:', err.message);
        res.status(500).json({ status: false, error: err.message });
    }
});

// Get all grievances
// router.get('/all', auth, async (req, res) => {
//     const userId = req.user._id; // Extract user ID from the authenticated user
//     try {
//         // Find grievances related to the authenticated user and sort by numeric part of grievanceId
//         const grievances = await Grievance.aggregate([
//             { $match: { userId } }, // Match grievances by userId
//             {
//                 $addFields: {
//                     numericPart: {
//                         $toInt: {
//                             $arrayElemAt: [
//                                 { $split: ["$grievanceId", "-"] }, 1 // Extract numeric part after 'G-'
//                             ]
//                         }
//                     }
//                 }
//             },
//             { $sort: { numericPart: -1 } } // Sort by numeric part in descending order
//         ]);

//         if (!grievances || grievances.length === 0) {
//             return res.status(200).json({ status: true, message: 'No grievances found' });
//         }

//         res.status(200).json({ status: true, grievances });
//     } catch (err) {
//         console.error('Error fetching grievances:', err);
//         res.status(500).json({ status: false, error: 'Internal Server Error' });
//     }
// });



router.get('/all', auth, async (req, res) => {
    const userId = req.user._id; // Extract user ID from authenticated user

    try {
        // Find grievances related to the authenticated user
        let grievances = await Grievance.aggregate([
            { $match: { userId } }, // Match grievances by userId
            {
                $addFields: {
                    numericPart: {
                        $toInt: {
                            $arrayElemAt: [{ $split: ["$grievanceId", "-"] }, 1] // Extract numeric part after 'G-'
                        }
                    }
                }
            },
            { $sort: { numericPart: -1 } } // Sort by numeric part in descending order
        ]);

        if (!grievances || grievances.length === 0) {
            return res.status(200).json({ status: true, message: 'No grievances found', grievances:[] });
        }

        // Get user preferred language
        //let userPreferredLang = req.user.language || 'en'; // Default to English

        // Translate grievance feedback
        for (let grievance of grievances) {
            if (grievance.feedback) {
                const detectedLanguages = detect(grievance.feedback);
                if (detectedLanguages.length > 0) {
                    langCode = detectedLanguages[0].lang; // Get the most probable language code
                    language = langs.where("1", langCode); // Map it to the full name

                    console.log(`Detected Language: ${language ? language.name : 'Unknown'}`);
                    console.log(langCode);
                }
                let userPreferredLang = grievance.userLang || 'en'; // Default to English
                //let detectedLang = await detectLanguage(grievance.feedback);
                console.log(langCode);
                // Translate only if feedback language is different from the user's preferred language
                if (language && language !== userPreferredLang) {
                    grievance.translatedFeedback = await BhashiniHelper(grievance.feedback, userPreferredLang);
                    grievance.feedback=grievance.translatedFeedback.translated_content;
                } else {
                    grievance.translatedFeedback = grievance.feedback; // No translation needed
                }
                grievance.feedback=grievance.translatedFeedback.translated_content;
                //console.log(grievance.translatedFeedback.translated_content);
            }
        }

        res.status(200).json({ status: true, grievances });
    } catch (err) {
        console.error('Error fetching grievances:', err);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
});


// Update grievance
router.put('/:id', async (req, res) => {
    try {
        const updatedGrievance = await Grievance.findOneAndUpdate(
            { grievanceId: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedGrievance) return res.status(200).json({ status: true, message: 'Grievance not founds' });
        res.json({ status: true, grievance: updatedGrievance });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

// Delete grievance
router.delete('/:id', async (req, res) => {
    try {
        const deletedGrievance = await Grievance.findOneAndDelete({ grievanceId: req.params.id });
        if (!deletedGrievance) return res.status(200).json({ status: true, message: 'Grievance not foundd' });
        res.json({ status: true, message: 'Grievance deleted successfully' });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
});

router.put('/feedback/:id', auth, async (req, res) => {
    try {
        const { thumbs, user_feedback, status } = req.body; // Extract only thumbs and user_feedback

        // Ensure at least one field is provided
        if (!thumbs && !user_feedback) {
            return res.status(400).json({
                status: false,
                message: 'At least one of thumbs or user_feedback must be provided.',
            });
        }

        // Prepare the update object dynamically
        const updateFields = {};
        if (thumbs !== undefined) updateFields.thumbs = thumbs;
        if (user_feedback !== undefined) updateFields.user_feedback = user_feedback;

        // Update status if user_feedback is "up"
        if (thumbs && thumbs.toLowerCase() === 'up') {
            updateFields.status = 'Complete';
        }else{
            updateFields.status = 'Re Open';
        }

        // Perform the update
        const updatedGrievance = await Grievance.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateFields },
            { new: true } // Return the updated document
        );
        console.log('Update Fields:', updateFields);

        if (!updatedGrievance) {
            return res.status(200).json({
                status: true,
                message: 'Grievance not found',
            });
        }

        res.json({
            status: true,
            grievance: updatedGrievance,
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err.message,
        });
    }
});


router.get('/count/grievancesCount', auth, async (req, res) => {
    console.log(req.user); // `req.user` will contain the user info extracted from the token

    try {
        const userId = req.user._id; // Extract user ID from token

        // Fetch grievance counts specific to the user
        const totalGrievances = await Grievance.countDocuments({ userId });
        const inprogressGrievances = await Grievance.countDocuments({ userId, status: "Open" });
        const pendingGrievances = await Grievance.countDocuments({ userId, status: "Pending" });
        const closedGrievances = await Grievance.countDocuments({ userId, status: "Complete" });
        const reopenGrievances = await Grievance.countDocuments({ userId, status: "Re Open" });

        // Send response
        res.status(200).json({
            status: true,
            data: {
                totalGrievances,
                inprogressGrievances,
                pendingGrievances,
                closedGrievances,
                reopenGrievances,
            },
        });
    } catch (error) {
        console.error('Error fetching grievance counts:', error);
        res.status(500).json({ status: false, error: 'Internal Server Error' });
    }
});


module.exports = router;
