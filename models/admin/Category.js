const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: String,
  checked: { type: Boolean, default: false },
});

const categorySchema = new mongoose.Schema({
  group: String, // e.g., DANCE, FITNESS, PHOTOGRAPHY
  category: String, // e.g., Dance Class, Portrait
  subcategories: [subcategorySchema],
  categoryimage: { type: String, trim: true }, // Vehicle Image URL/Path
  type: { type: String, enum: ['studio', 'expertise'], required: true }, // distinguishes left/right
  status: { type: Number, enum: [1, 2, 3], default: 1 }, // 1 = Active, 2 = Deactive, 3 = Deleted
},{ timestamps: true });


module.exports = mongoose.model('Category', categorySchema);
