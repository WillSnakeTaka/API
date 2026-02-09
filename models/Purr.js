const mongoose = require('mongoose');

const purrSchema = new mongoose.Schema(
  {
    meowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meow',
      required: [true, 'meowId is required'],
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    durationSeconds: {
      type: Number,
      min: 1,
      default: 10,
    },
  },
  { timestamps: true }
);

// Index on meowId speeds lookup of purrs for one meow.
purrSchema.index({ meowId: 1 });

purrSchema.pre('validate', async function validateMeowId(next) {
  try {
    const Meow = mongoose.model('Meow');
    const exists = await Meow.exists({ _id: this.meowId });
    if (!exists) {
      const error = new mongoose.Error.ValidationError(this);
      error.addError('meowId', new mongoose.Error.ValidatorError({ message: 'meowId must reference an existing Meow' }));
      return next(error);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model('Purr', purrSchema);
