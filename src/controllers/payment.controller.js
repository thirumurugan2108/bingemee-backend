const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService, cardService, paymentservice } = require('../services');


const Razorpay = require("razorpay");
const crypto = require('crypto');
const { createpaymentDetail } = require('../services/payment.service');

const createOrders = catchAsync(async (req, res) => {
    const { username, id, isCard } = req?.query;

    
    let result = await getproductDetails(isCard === 'true', id);
    try {
        const instance = new Razorpay({
            key_id: 'rzp_test_6mQa7wgUCs49Is',
            key_secret: '97ZXU8XaPGrOsqVyf0ZC7yon',
        });

        const options = {
            amount: result.price * 100, // amount in smallest currency unit
            currency: "INR",
            // receipt: "7411012",
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");
        res.json({ ...order, price: result.price * 100 });
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
            buyerDetails,
            productDetails,
            isCard
        } = req.body;

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);

        const shasum = crypto.createHmac("sha256", "97ZXU8XaPGrOsqVyf0ZC7yon");

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
        console.log(productDetails, buyerDetails);

        let result = await getproductDetails(isCard, productDetails.productid);

        // res.send({
        //     message: "success"
        //   });
        console.log(result);
        console.log(isCard);
        let status = 'success';
        if(isCard) {
            status = 'pending'
        }
        const paymentDetail = {
            buyerPhoneNumber: buyerDetails.buyerPhoneNumber ,
            buyerDetails:buyerDetails,
            productId:productDetails.productid,
            productDetails: result,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            razorpaySignature: razorpaySignature,
            influencer:productDetails.username,
            status: status,
            isCard:isCard
        };

        await createpaymentDetail(paymentDetail);
        if(isCard) {
            res.status(200).send({
                msg: "success",
                orderId: razorpayOrderId,
                paymentId: razorpayPaymentId,
            });
        } else {
            res.status(200).send({
                msg: "success",
                orderId: razorpayOrderId,
                paymentId: razorpayPaymentId,
                fileurl:result.fileUrl,
                isVideo:result.isVideo
            });
        }
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error);
    }
});

const getPaymentDetails = catchAsync(async (req, res) => {
    try {
        // getting the details back from our font-end
        const user = req.user;
        const username = user?.name;
        const pendingJobs = await paymentservice.getPendingJobs(username);
        const successJobs = await paymentservice.getSuccessJobs(username);

        const result = {
            pendingJobs,
            successJobs,
            totalRevenue: user.total,
            paid: user.paid,
            balance: user.balance
        }
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

const updatePaymentStatus = catchAsync(async (req, res) => {
    try {
        // getting the details back from our font-end
        const body = req.body;
        const result = await paymentservice.updatePaymentStatus(body.id, body.status);

        res.status(200).send({
            message: "status has been updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});


module.exports = {
    createOrders,
    getPaymentDetails,
    paymentSuccess: paymentVerification,
    updatePaymentStatus
};
async function getproductDetails(isCard, id) {
    let result = {};
    if (isCard) {
        result = await cardService.findCardById(id);
    } else {
        result = await postService.getPostsById(id);
    }
    return result;
}

