module.exports = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        // User is logged in
        // console.log('session', req.session.modulePermissions);
        console.log('loginin')

        if (req.originalUrl === '/studio/createAccount' || req.originalUrl === '/studio/otp' || req.originalUrl === '/studio') {
            return res.redirect('/studio/dashboard'); // Redirect to dashboard if trying to access login page while logged in
        } else {
            // User is logged in and trying to access other pages, allow access
            return next();
        }
    } else {
        console.log(req.originalUrl)
        // User not logged in
        console.log('not loginin')
        if (req.originalUrl === '/studio/createAccount' || req.originalUrl === '/studio/otp' || req.originalUrl === '/studio') {
            return next()
        }
        else {
            return res.redirect('/studio'); // Redirect to dashboard if trying to access login page while logged in

        }

    }
};