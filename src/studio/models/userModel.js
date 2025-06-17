const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String },
    mobile: { type: String },
    isUsingMobile: Boolean,
    creatorType: {
        type: Number,
        enum: [0, 1, 2], // 0 => User, 1 => Studio, 2 => Photographer
        default: 0,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
