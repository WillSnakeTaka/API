const mongoose = require('mongoose');

const meowSchema = new mongoose.Schema(
  {
    catId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cat',
      required: [true, 'catId is required'],
    },
    // Text is required to keep meow records meaningful.
    text: {
      type: String,
      required: [true, 'Meow text is required'],
      trim: true,
      minlength: [1, 'Meow text cannot be empty'],
      maxlength: [280, 'Meow text must be 280 characters or less'],
    },
    mood: {
      type: String,
      enum: ['happy', 'sleepy', 'playful', 'hungry', 'grumpy'],
      default: 'happy',
    },
  },
  { timestamps: true }
);

// Compound index speeds filtering meows by cat and sorting by newest.
meowSchema.index({ catId: 1, createdAt: -1 });

module.exports = mongoose.model('Meow', meowSchema);
