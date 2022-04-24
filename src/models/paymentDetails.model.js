const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const paymentDetailSchema = mongoose.Schema(
    {
        buyerPhoneNumber: {
            type: Number,
            required: true,
            trim: true
        },
        buyerDetails: {
            type: Object,
            required: true,
            trim: true,
            lowercase: true,
        },
        productId: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
        },
        productDetails: {
            type: Object,
            required: true,
            default: true,
        },
        razorpayOrderId: {
            type: String,
            required: false,
            trim: true,
        },
        razorpayPaymentId: {
            type: String,
            required: true,
            default: true,
        },
        razorpaySignature: {
            type: String,
            required: true,
            default: true,
        },
        status: {
            type: String,
            required: true,
            default: 'pending',
        },
        paymentstatus: {
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
paymentDetailSchema.plugin(toJSON);
// PaymentDetails.plugin(paginate);

/**
 * @typedef PaymentDetails
 */
const PaymentDetails = mongoose.model('PaymentDetails', paymentDetailSchema);

module.exports = PaymentDetails;

