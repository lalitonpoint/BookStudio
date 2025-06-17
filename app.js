const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const app = express();
const connectDB = require('./db/db');
const expressLayouts = require('express-ejs-layouts');


const adminRoutes = require('./src/admin/routes/admin.routes');
const LoginCtrl = require('./src/studio/controllers/loginController');
const studioRoutes = require('./src/studio/routes/studioRoutes');


connectDB();



app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 24000 * 60 * 1000 }
}));

app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'yourSecret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');


app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        app.set('views', path.join(__dirname, 'src/admin/views'));
    } else if (req.path.startsWith('/studio')) {
        app.set('views', path.join(__dirname, 'src/studio/views'));
    } else {
        app.set('views', path.join(__dirname, 'src/website/views'));
    }
    next();
});

app.use('/admin', adminRoutes);
app.use('/studio', studioRoutes);
// Catch-all route for 404 - must be last route


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:%s`, PORT));

