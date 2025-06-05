const mongoose = require('mongoose');

const StudioSchema = new mongoose.Schema({
  // Step 1 - Owner and Company Registration Details
  registeredMobile: { type: String, required: true, unique: true },
  owners: [{
    name: { type: String, required: true },
    mobile: { type: String, required: true }
  }],
  ownerEmails: [String],
  idCards: [String],
  businessName: { type: String, required: true },
  registrationCirtificate: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      image: {
        type: String,
        required: true,
        trim: true,
        // Optionally, validate that image is a URL
        validate: {
          validator: function(v) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(v);
          },
          message: props => `${props.value} is not a valid image URL!`
        }
      }
    }
  ],
  gstNumber: String,
  panCard: { type: String, required: true },
  fssaiLicense: String,

  // Step 2 - Studio Details
  studioName: { type: String},
  logo: String,
  type: [String],
  customType: String,
  slogan: String,
  bestSuitedFor: [String],
  address: { type: String, required: false },
  googleMapLink: { type: String, required: false },
  locality: { type: String, required: false },
  contactNumbers: [String],
  studioEmail: String,
  operationalSince: String,
  images: [String],
  video: String,
  facilities: [String],
  additionalFacilities: [String],
  totalArea: String,
  usableArea: String,
  visibleToUsers: { type: Boolean, default: false },

  // Step 3 - Social and Booking Details
  website: String,
  instagram: String,
  facebook: String,
  youtube: String,
  operatingHours: {
    type: Map,
    of: String
  },
  
  rentPackages: [{
    name: { type: String },
    price: { type: Number },
    duration: { type: String }
  }],
  calendar: [{
    date: String,
    slots: [{
      time: String,
      status: { type: String, enum: ['available', 'blocked', 'booked'], default: 'available' }
    }]
  }],
  bookingOptions: {
    whatsapp: Boolean,
    call: Boolean,
    directLink: String,
    comments: String
  },
  pricingType: { type: String, enum: ['per_hour', 'per_day', 'Custom', 'na'], required: false },
  perHourRate: Number,
  perDayRate: Number,
  perCustomRate: String,
  additionalDetails: String
}, { timestamps: true });

module.exports = mongoose.model('Studio', StudioSchema);
