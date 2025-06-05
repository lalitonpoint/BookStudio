const mongoose = require('mongoose');

const photoVideographerSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  phone: String,
  profile_pic: String,
  logo: String,
  profession: {
    type: String,
    enum: ['Photographer', 'Videographer', 'Photo-Videographer'],
    required: true
  },
  profession_type: {
    type: String,
    enum: ['Freelancer', 'Agency'],
    required: true
  },
  about_you: String,
  experience_year: String,
  location: String,
  travel: Boolean,
  expertise: [String],
  certification: String,
  equipments: String,
  clients: String,
  portfolio: String,
  instagram: String,
  facebook: String,
  youtube: String,
  website: String,
  availability: {
    perHour: Boolean,
    perDay: Boolean,
    both: Boolean
  },
  rate_per_day: Number,
  rate_per_hour: Number,
  additional_packages: String,
  contact_whatsapp: Boolean,
  contact_call: Boolean,
  contact_email: Boolean,
  booking_link: String,
  additional_info: String,
  is_approved: { type: Boolean, default: false },

  role: {
    type: String,
    enum: ['Photographer', 'Videographer', 'Photo-Videographer'],
    required: true
  }
}, { timestamps: true });

const PhotoVideographer = mongoose.model('PhotoVideographer', photoVideographerSchema);

const dummyUsers = [
  {
    full_name: "Ravi Sharma",
    email: "ravi.sharma@example.com",
    password: "$2b$10$abcdefghijklmnopqrstuv",  // bcrypt hashed placeholder
    profession: "Photographer",
    profession_type: "Freelancer",
    phone: "+919876543210",
    about_you: "Experienced wedding photographer.",
    experience_year: "5",
    location: "Mumbai, India",
    travel: true,
    expertise: ["Wedding", "Events"],
    certification: "Certified Professional Photographer",
    equipments: "Canon EOS 5D, Nikon D850",
    clients: "Client A, Client B",
    portfolio: "https://portfolio.ravisharma.com",
    instagram: "https://instagram.com/ravi.sharma",
    facebook: "https://facebook.com/ravisharma",
    youtube: "https://youtube.com/ravisharma",
    website: "https://ravisharma.com",
    availability: { perHour: true, perDay: false, both: false },
    rate_per_day: 15000,
    rate_per_hour: 1500,
    additional_packages: "Album printing",
    contact_whatsapp: true,
    contact_call: true,
    contact_email: true,
    booking_link: "https://bookme.com/ravi",
    additional_info: "Open for destination shoots.",
    is_approved: false,
    role: "Photographer",
  },
  {
    full_name: "Sneha Kapoor",
    email: "sneha.kapoor@example.com",
    password: "$2b$10$zyxwvutsrqponmlkjihgf",
    profession: "Videographer",
    profession_type: "Agency",
    phone: "+919812345678",
    about_you: "Creative videographer specializing in documentaries.",
    experience_year: "7",
    location: "Kolkata, India",
    travel: false,
    expertise: ["Documentary", "Commercial"],
    certification: "Certified Videographer",
    equipments: "Sony A7S III, DJI Ronin",
    clients: "Client X, Client Y",
    portfolio: "https://portfolio.snehakapoor.com",
    instagram: "https://instagram.com/sneha.kapoor",
    facebook: "https://facebook.com/snehakapoor",
    youtube: "https://youtube.com/snehakapoor",
    website: "https://snehakapoor.com",
    availability: { perHour: false, perDay: true, both: false },
    rate_per_day: 20000,
    rate_per_hour: 2000,
    additional_packages: "Editing and post-production",
    contact_whatsapp: false,
    contact_call: true,
    contact_email: true,
    booking_link: "https://bookme.com/sneha",
    additional_info: "Available for commercial shoots.",
    is_approved: false,
    role: "Videographer",
  },
];

(async function seedIfEmpty() {
  try {
    const count = await PhotoVideographer.countDocuments();
    if (count === 0) {
      console.log('PhotoVideographer collection empty — inserting dummy data...');
      await PhotoVideographer.insertMany(dummyUsers);
      console.log('Dummy data inserted.');
    } else {
      // console.log('PhotoVideographer collection has data. Skipping seed.');
    }
  } catch (err) {
    console.error('Error in seeding PhotoVideographer data:', err);
  }
})();

module.exports = PhotoVideographer;
