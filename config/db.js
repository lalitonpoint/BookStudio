// db.js
const mongoose = require('mongoose');

const mongoURI = 'mongodb://127.0.0.1:27017/bookstudio';

async function connectDB() {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 20000, // 20 seconds timeout
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process on failure
  }
}

module.exports = connectDB;
