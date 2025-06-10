const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/api/User');
const auth = require('./middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const path = require('path');
const session = require('express-session');  // Import express-session
const indexRoutes = require('./indexRoutes');  // Import express-session
const app = express();
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // For API JSON requests
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'node_modules')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve files

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
}));

// MongoDB Connection

connectDB();

// Middleware to set adminName globally
app.use((req, res, next) => {
    res.locals.adminName = req.session.adminName || null;
    next();
});

app.use('/', indexRoutes);

const PORT = 3500;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});