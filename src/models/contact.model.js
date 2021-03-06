const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
contactSchema.plugin(toJSON);
// cardSchema.plugin(paginate);

/**
 * @typedef Contact
 */
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;

