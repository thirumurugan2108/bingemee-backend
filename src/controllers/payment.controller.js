const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService } = require('../services');

const Razorpay = require("razorpay");
const crypto = require('crypto');

const createOrders = catchAsync(async (req, res) => {

    try {
        const instance = new Razorpay({
            key_id: 'rzp_test_6mQa7wgUCs49Is',
            key_secret: '97ZXU8XaPGrOsqVyf0ZC7yon',
        });

        const options = {
            amount: 50000, // amount in smallest currency unit
            currency: "INR",
            receipt: "7411012",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");
        console.log(order);
        res.json(order);
    } catch (error) { 
        console.log(error);
        res.status(500).send(error);
    }
});

const paymentVerification = catchAsync(async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);

        const shasum = crypto.createHmac("sha256", "vhQqyGWpeIDwOqBiGYsojs5e");

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});




module.exports = {
    createOrders,
    paymentSuccess: paymentVerification,
};
