const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cardSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
      minlength: 8,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    user_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cardSchema.plugin(toJSON);
cardSchema.plugin(paginate);

/**
 * @typedef Card
 */
const Card = mongoose.model('Card', cardSchema);

module.exports = Card;

