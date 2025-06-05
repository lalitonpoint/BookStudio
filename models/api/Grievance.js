const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    grievanceId: { type: String, required: true },
    subject: { type: String, required: true },
    aadharNumber:{ type: String, required: true },
    submittedBy: { type: String, required: true }, // Username
    onBehalf: { type: String }, // Username
    catId: { type: String }, // Username
    ministryId: { type: String }, // Username
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Foreign key reference
    contactInformation: { 
        type: String, 
        required: true, 
        validate: {
            validator: function (value) {
                // Mobile numbers should be exactly 10 digits
                return /^\d{10}$/.test(value);
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    description: { type: String, required: true },
    nature: { type: String },
    moreDescription: { type: String},
    assignedDepartment: { type: String },
    assignedTo: { type: String },
    userLang: { type: String },
    stateAnddistrict: { type: String },
    status: { type: String, default: 'Open' },
    resolutionDeadline: { type: Date },
    proposedResolution: { type: String },
    comments: { type: [String] },
    feedback: { type: String, required: false }, // Feedback field
    priority: { type: String }, // Feedback field
    sentiment: { type: String }, // Feedback field
    attachments: { type: [String] }, // Array of file paths
    thumbs: { type: String},
    user_feedback: { type: String},
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
