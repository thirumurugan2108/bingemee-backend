const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const subscriptionSchema = mongoose.Schema(
  {
      influencer: {
          type: String,
          required: true,
          trim: true
      },
      subscription : {
          type: Array,
          trim: true
      },
      status: {
        type: Boolean,
        required: true,
        default: false
      },
  },
  {
      timestamps: true,
  }
);

// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);
// PaymentDetails.plugin(paginate);

/**
* @typedef subscription
*/
const subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = subscription;