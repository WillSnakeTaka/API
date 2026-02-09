const mongoose = require('mongoose');

const catSchema = new mongoose.Schema(
  {
    // Name is required for identity and search.
    name: {
      type: String,
      required: [true, 'Cat name is required'],
      trim: true,
      minlength: [1, 'Cat name cannot be empty'],
    },
    breed: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    age: {
      type: Number,
      min: 0,
      default: 0,
    },
    color: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
  },
  { timestamps: true }
);

// Index on name speeds up common cat name lookups.
catSchema.index({ name: 1 });

module.exports = mongoose.model('Cat', catSchema);
