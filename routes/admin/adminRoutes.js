
// routes/adminRoutes.js
const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/admin/Admin');
const Grievance = require('../../models/api/Grievance');
const User = require('../../models/api/User');
const Ministry = require('../../models/admin/Ministry');
const mongoose = require('mongoose');
const router = express.Router();


// Admin Registration (GET)
router.get('/register', async (req, res) => {
    try {
        // Fetch ministries from the database
        const ministries = await Ministry.find(); // Adjust the query as per your database structure

        // Render the register page with the ministries data

        res.render('admin/register', { ministries, error: null });
    } catch (err) {
        console.error('Error fetching ministries:', err);
        res.status(500).render('admin/register', { ministries: [], error: 'Failed to load ministries. Please try again.' });
    }
});


router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, address, phone } = req.body;

        // Validate input fields
        if (!name || !email || !password || !confirmPassword || !address || !phone) {
            return res.render('admin/register', { error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('admin/register', { error: 'Invalid email format' });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.render('admin/register', { error: 'Passwords do not match' });
        }

        // Check if admin with this email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.render('admin/register', { error: 'Admin with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password: password,
            address,
            phone
        });

        // Save to the database
        await admin.save();

        // Redirect to login page with a success message
        res.redirect('/admin/login');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).render('admin/register', { error: 'Server error. Please try again later.' });
    }
});

// Admin Login (GET)
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.error(`Login failed: Admin with email ${email} not found`);
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.error(`Login failed: Password mismatch for email ${email}`);
            return res.render('admin/login', { error: 'Invalid email or password' });
        }

        // Store session data
        req.session.isAdmin = true;
        req.session.adminName = admin.name;
        req.session.adminEmail = admin.email;
        req.session.language = admin.language;

        console.log(`Admin logged in: ${admin.name} (${admin.email})`);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).render('admin/login', { error: 'Server error. Please try again later.' });
    }
});



router.get('/dashboard', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    try {
        // Fetch grievance counts
        const totalGrievances = await Grievance.countDocuments();
        const inprogressGrievances = await Grievance.countDocuments({
            status: { $in: ["In Progress"] },
        });
        const pendingGrievances = await Grievance.countDocuments({ status: "Pending" });
        const closedGrievances = await Grievance.countDocuments({ status: "Complete" });
        const reopenGrievances = await Grievance.countDocuments({ status: "Re Open" });
        const Usercount = await User.countDocuments();



        // Render dashboard with counts
        res.render('layouts/main', {
            title: 'Admin Dashboard',
            currentPage: 'dashboard', // Set the current page for the sidebar
            adminName: req.session.adminName,
            body: '../admin/dashboard',
            data: {
                totalGrievances,
                inprogressGrievances,
                pendingGrievances,
                closedGrievances,
                reopenGrievances,
                Usercount
            },
        });
    } catch (error) {
        console.error('Error fetching grievance counts:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Manage Users Route
router.get('/users', (req, res) => {
    res.render('admin/users', {
        title: 'Manage Users',
        currentPage: 'users', // Set the current page to 'users'
    });
});

// Citizen list route
router.get('/citizen_list', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    try {
        // Fetch all citizens from the User collection
        const citizens = await User.find({}, 'name email pinCode state district mobile').exec();

        // Render the citizen list page with the fetched data
        res.render('layouts/main', {
            title: 'Citizen List',
            currentPage: 'citizen_list',
            adminName: req.session.adminName,
            body: '../admin/citizen_list', // DataTable page
            citizens // Pass citizen data to the view
        });
    } catch (err) {
        console.error('Error fetching citizens:', err.message);
        res.status(500).render('layouts/main', {
            title: 'Error',
            currentPage: 'citizen_list',
            adminName: req.session.adminName,
            body: '../admin/error',
            errorTitle: 'Internal Server Error',
            errorMessage: 'Something went wrong while fetching citizen data.',
            redirectUrl: '/admin/citizen_list',
        });
    }
});



// Get all grievances for admin
router.get('/grievances', async (req, res) => {
    try {
        const grievances = await Grievance.find().populate('userId', 'name email'); // Fetch grievances with user details
        res.json(grievances);
    } catch (err) {
        console.error('Error fetching grievances:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const TRANSLATE_API_URL = 'http://13.202.207.48:7000/scaler/translate'; // Translation API URL

router.get('/grievance_details/:id', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    const grievanceId = req.params.id;
    const adminLanguage = req.session.language;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(grievanceId)) {
        return res.status(400).render('layouts/main', {
            title: 'Error',
            currentPage: 'grievance_list',
            adminName: req.session.adminName,
            adminLanguage: adminLanguage,
            body: '../admin/error',
            errorTitle: 'Grievance Not Found',
            errorMessage: 'The requested grievance does not exist.',
            redirectUrl: '/admin/grievance_list',

        });
    }

    try {
        // Fetch grievance details along with user information
        const grievance = await Grievance.findById(grievanceId)
            .populate({
                path: 'userId',
                model: 'User',
                select: 'name email'
            })
            .exec();

        if (!grievance) {
            return res.status(404).render('layouts/main', {
                title: 'Grievance Not Found',
                currentPage: 'grievance_list',
                adminName: req.session.adminName,
                adminLanguage: adminLanguage,
                body: '../admin/error',
                errorTitle: 'Grievance Not Found',
                errorMessage: 'The requested grievance could not be found.',
                redirectUrl: '/admin/grievance_list',
            });
        }


        // Log the original description
        console.log('Original Description:', grievance.description);

        // Translate grievance description
        try {
            // Prepare an array of fields to translate
            let fieldsToTranslate = [];
            if (grievance.description) fieldsToTranslate.push(grievance.description);
            if (grievance.nature) fieldsToTranslate.push(grievance.nature);
            if (grievance.moreDescription) fieldsToTranslate.push(grievance.moreDescription);
            console.log('fieldsToTranslate', fieldsToTranslate);
            console.log(adminLanguage);
            // If no fields are available, skip translation
            if (fieldsToTranslate.length === 0) {
                // grievance.description = 'अनुवाद उपलब्ध नहीं है';
                // grievance.nature = 'अनुवाद उपलब्ध नहीं है';
                // grievance.moreDescription = 'अनुवाद उपलब्ध नहीं है';
            } else {
                // Join fields with `_` separator for API request
                const textToTranslate = fieldsToTranslate.join(' # ');

                const response = await axios.post(TRANSLATE_API_URL, {
                    content: textToTranslate,
                    target_language: adminLanguage
                });

                console.log('Original:', textToTranslate);
                console.log('Translation API Response:', response.data);

                if (response.data && response.data.translated_content) {
                    // Split the translated text based on `_`
                    const translatedText = response.data.translated_content.split('#');

                    // Assign translated values in the same order they were sent
                    let index = 0;
                    if (grievance.description) grievance.translated_description = translatedText[index++] || grievance.description;
                    if (grievance.nature) grievance.translated_nature = translatedText[index++] || grievance.nature;
                    if (grievance.moreDescription) grievance.translated_moreDescription = translatedText[index++] || grievance.moreDescription;
                } else {
                    // grievance.description = 'अनुवाद उपलब्ध नहीं है';
                    // grievance.nature = 'अनुवाद उपलब्ध नहीं है';
                    // grievance.moreDescription = 'अनुवाद उपलब्ध नहीं है';
                }
            }
        } catch (apiError) {
            console.error('Translation API Error:', apiError.message);
            // grievance.description = 'अनुवाद उपलब्ध नहीं है';
            // grievance.nature = 'अनुवाद उपलब्ध नहीं है';
            // grievance.moreDescription = 'अनुवाद उपलब्ध नहीं है';
        }



        // Render the grievance details page
        res.render('layouts/main', {
            title: 'Grievance Details',
            currentPage: 'grievance_list',
            adminName: req.session.adminName,
            adminLanguage: adminLanguage,
            body: '../admin/grievance_details',
            grievance, // Updated grievance with translated description
            loading: false,
        });
    } catch (err) {
        console.error('Error fetching grievance:', err.message);
        res.status(500).render('layouts/main', {
            title: 'Error',
            currentPage: 'grievance_list',
            adminName: req.session.adminName,
            body: '../admin/error',
            errorTitle: 'Internal Server Error',
            errorMessage: 'Something went wrong. Please try again later.',
            redirectUrl: '/admin/grievance_list',
        });
    }
});



router.post('/grievance_status/:id', async (req, res) => {
    const { status, feedback } = req.body;
    console.log(req.body);
    try {
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ success: false, error: 'Grievance not found' });
        }

        // Update status and feedback
        grievance.status = status;
        grievance.feedback = feedback;
        // grievance.priority = priority;
        // grievance.sentiment = sentiment;

        await grievance.save();

        res.json({ success: true, redirectUrl: '/admin/grievance_list', });
    } catch (err) {
        console.error('Error updating grievance status:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});



// Route to fetch and render grievance list
router.get('/grievance_list', async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }

    try {
        const grievances = await Grievance.find({ assignedTo: req.session.adminEmail })

            .populate('submittedBy', 'name email') // Fetch user details
            .sort({ createdAt: -1 })
            .exec();

        res.render('layouts/main', {
            title: 'Manage Grievances',
            currentPage: 'grievance_list',
            adminName: req.session.adminName,
            body: '../admin/grievance_list', // Grievance list view
            grievances, // Pass grievances to the view
        });
    } catch (err) {
        console.error('Error fetching grievances:', err.message);
        res.status(500).render('layouts/main', {
            title: 'Error',
            currentPage: 'grievance_list',
            adminName: req.session.adminName,
            body: '../admin/error', // Error view
            error: 'Internal Server Error',
        });
    }
});



// Settings Route
router.get('/settings', (req, res) => {
    res.render('admin/settings', {
        title: 'Settings',
        currentPage: 'settings', // Set the current page to 'settings'
    });
});
// Admin Logout (GET)
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});


router.post('/send-query', async (req, res) => {
    const { userQuery, lang } = req.body; // Extract the userQuery from the request body

    if (!userQuery || !userQuery.trim()) {
        return res.status(400).send('Invalid query. Please provide a valid input.');
    }

    try {
        // Make a POST request to the external API
        const response = await axios.post(
            'http://3.108.40.230/bedrock_lang_base.php',
            { user_query: userQuery, lang: lang ? lang : 'ENGLISH' }, // Send userQuery in the payload
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Send the external API's response back to the frontend
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error while communicating with the external API:', error.message);
        res.status(500).send('Failed to process the query. Please try again.');
    }
});


router.post('/analyze', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ success: false, message: 'Text is required' });
    }

    try {
        // Call the external API
        const response = await axios.post(
            'http://13.202.207.48:5000/api/analyze',
            { text }, // Payload
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        );

        // Respond with API result
        res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze text',
            error: error.response ? error.response.data : error.message,
        });
    }
});


router.post('/translate', async (req, res) => {
    let { text, userLang } = req.body;  // Destructure userLang as let for modification

    try {
        // Detect Language API
        const dedect = await axios.post('http://3.108.40.230/lan_conversion.php', {
            user_query: text
        });

        const detectedLanguage = dedect.data?.data?.detected_language || 'Unknown';
        console.log("Detected Language:", detectedLanguage);

        // Determine target language
        let targetLang = detectedLanguage === 'English' ? userLang : 'English';

        // Call Translation API
        const response = await axios.post(TRANSLATE_API_URL, {
            content: text,
            target_language: targetLang
        });

        res.status(200).json({ success: true, data: response.data.translated_content });
    } catch (error) {
        console.error('Translation Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: 'Translation failed',
            error: error.response ? error.response.data : error.message,
        });
    }
});



module.exports = router;
