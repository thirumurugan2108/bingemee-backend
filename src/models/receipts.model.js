const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const receiptsSchema = mongoose.Schema(
    {
        receiptId: {
            type: String,
            required: true,
            trim: true
        },
        email : {
            type: String,
            required: true,
            trim: true
        },
        productDetails: {
            type: Object,
            required: false,
        },
        amount: {
            type: String,
            required: true,
            trim: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            default: true,
        },
        paymentGateWay: {
            type: String,
            required: true,
            default: true,
        },
        paymentStatus: {
            type: String,
            required: true,
            default: 'success',
        },
        influencer: {
            type: String,
            required: true,
        },
        isCard: {
            type: Boolean,
            required:true,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
receiptsSchema.plugin(toJSON);
// PaymentDetails.plugin(paginate);

/**
 * @typedef receipts
 */
const receipts = mongoose.model('receipts', receiptsSchema);

module.exports = receipts;

