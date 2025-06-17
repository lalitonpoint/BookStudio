const User = require('../models/userModel')

const loginPage = (req, res) => {
    res.render('pages/login', { title: 'OnPoints Admin ', layout: false });
    // res.render('pages/login/login', { title: 'OnPoints Admin ', layout: false });

}

const createAccountPage = (req, res) => {
    res.render('pages/createAccount', { title: 'OnPoints Admin ', layout: false });
}


const notFound = (req, res) => {
    res.render('pages/404', { title: 'OnPoints Admin ', layout: false });
};

const otpPage = (req, res) => {
    res.render('pages/otp', { title: 'OnPoints Admin ', layout: false });
}
const addUser = async (req, res) => {
    try {
        const { fullName, email, mobile, isUsingMobile } = req.body;

        // Validate required field
        if (!fullName || (!email && !mobile)) {
            return res.status(400).json({ success: false, message: 'Full Name and either Email or Mobile is required.' });
        }

        // Check if user already exists
        let existingUser = null;
        if (isUsingMobile == true) {
            existingUser = await User.findOne({ mobile });
        } else {
            existingUser = await User.findOne({ email });
        }

        if (existingUser) {
            return res.status(200).json({ success: false, message: 'User already exists' });
        }


        // Create new user
        const newUser = new User({
            fullName,
            email: email || '',
            mobile: mobile || '',
            isUsingMobile,
            creatorType: 1 // Assuming '1' = Studio
        });

        await newUser.save();
        console.log(newUser);
        let mobEmail = newUser.isUsingMobile == 1 ? newUser.mobile : newUser.email;

        return res.status(200).json({ success: true, redirectUrl: '/studio/otp?mobEmail=' + mobEmail });

    } catch (error) {
        console.error('Create Account Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
const checkLogin = async (req, res) => {
    try {
        const { otp, mobile, email, isUsingMobile } = req.body;

        // Validate required fields
        if (!otp || typeof isUsingMobile === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'OTP and isUsingMobile are required.',
            });
        }

        // Determine user identifier
        const isMobile = isUsingMobile === true || isUsingMobile === 'true';
        const query = isMobile ? { mobile } : { email };

        if (!query[isMobile ? 'mobile' : 'email']) {
            return res.status(400).json({
                success: false,
                message: `Missing ${isMobile ? 'mobile' : 'email'} value.`,
            });
        }

        const existingUser = await User.findOne(query);

        if (!existingUser) {
            return res.status(200).json({
                success: false,
                message: 'User does not exist.',
            });
        }

        // Compare OTP — replace 123456 with actual OTP logic in production
        if (otp != '123456') {
            return res.status(401).json({
                success: false,
                message: 'Incorrect OTP.',
            });
        }

        // Set session
        req.session.isLoggedIn = true;
        req.session.admin = {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            mobile: existingUser.mobile,
            isUsingMobile: isMobile,
            isLoggedIn: true,
            creatorType: existingUser.creatorType,
        };

        console.log(`✅ User ${existingUser.email} logged in successfully.`);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            redirectUrl: 'profile',
        });

    } catch (error) {
        console.error('❌ Login Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

module.exports = {
    loginPage, createAccountPage, addUser, otpPage, checkLogin, notFound
}
