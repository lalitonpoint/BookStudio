const mongoose = require("mongoose");

const studioSchema = new mongoose.Schema({
    personalDetail: {
        name: { type: String, required: true },
        mobile: { type: Number, required: true },
        email: [{ type: String }], // Changed to array of strings
        panCardNumber: { type: String, required: true },
        panCardId: { type: String, required: true }, // Check if this is a typo; might be `panCardId`
        businessName: { type: String },
        businessRegistrationCertificate: { type: String },
        gstNumber: { type: String },
        fssaiLicense: { type: String },
    },

    step: { type: Number, enum: [0, 1, 2, 3], default: 0 },

    approvedBy: {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        adminName: { type: String },
        approvedAt: { type: Date }
    },

    approvalStatus: { type: Number, enum: [0, 1], default: 0 },
}, {
    timestamps: true
});

module.exports = mongoose.model("Studio", studioSchema);
