const httpStatus = require('http-status')
const pick = require('../utils/pick')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')
const { userService, postService, cardService, paymentservice, emailService, receiptsService } = require('../services')
const base64 = require('base-64')
const Razorpay = require("razorpay");
const crypto = require('crypto');
const { createpaymentDetail } = require('../services/payment.service');
const RazorpayKeyId = process.env.RAZORPAY_KEY_ID
const RazorPaySecret = process.env.RAZORPAY_SECRET
const axios = require('axios')
const createOrders = catchAsync(async (req, res) => {
    const { username, id, isCard } = req?.query;    
    let result = await getproductDetails(isCard === 'true', id);
    try {
        const instance = new Razorpay({
            key_id: RazorpayKeyId,
            key_secret: RazorPaySecret,
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
        var instance = new Razorpay({ key_id: RazorpayKeyId, key_secret:RazorPaySecret })
        const paymentStatus = await instance.payments.fetch(razorpayPaymentId)
        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);

        // const shasum = crypto.createHmac("sha256", "G7FIwPIJmngzneGErUjdDW0L");

        // shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        // const digest = shasum.digest("hex");
        // console.log(digest)
        // console.log(razorpaySignature)
        // comaparing our digest with the actual signature
        //if (digest !== razorpaySignature)
        if (paymentStatus.status != "authorized" && paymentStatus.status != "captured") {
           return res.status(400).json({ msg: "Transaction not legit!" });
        }

        emailService.sendInvoice(paymentStatus, razorpayOrderId, productDetails, buyerDetails, isCard)

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        let result = await getproductDetails(isCard, productDetails.productid);

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
            paymentStatus: "success",
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
        res.status(500).send(error);
    }
});

const getPaymentDetails = catchAsync(async (req, res) => {
    try {
        // getting the details back from our font-end
        const user = req.user;
        const username = user?.name;
        let pendingJobs = await paymentservice.getPendingJobs(username);
        const successJobs = await paymentservice.getSuccessJobs(username);
        //const cardPayments = await paymentservice.getInfulencerCardPayments(username);
        const totalRevenue = await paymentservice.getTotalRevenue(username);
        
        const result = {
            username,   
            pendingJobs,
            successJobs,
            totalRevenue,
            paid: user.paid,
            balance: totalRevenue - user.paid
        }
        res.status(200).send(result);
    } catch (error) {
        console.log(error)
       // res.status(500).send(error);
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
        res.status(500).send(error);
    }
});

const getReceipts = catchAsync(async (req, res) => {
    const id = req.params.id
    try {
        const [email, receiptId] = base64.decode(id).split(',')
        const receiptDetails = await receiptsService.getReceipts(email, receiptId)
        if (receiptDetails) {
            res.send(receiptDetails)
        }
        else {
            res.send({status: "error", message: "Invalid receipt details"})
        }
    }
    catch (e) {
        console.log(id)
        res.send({status: "error", message: "Invalid receipt details"})
    }
})
const getInstAuthToken = async () => {
    const client_id = process.env.INSTA_CLIENT_ID
    const client_secret = process.env.INSTA_CLIENT_SECRET
    const payload = {
        grant_type: "client_credentials", 
        client_id, 
        client_secret
    }
    const resp = await axios.post(`https://${process.env.INSTA_API_URL}/oauth2/token/`,payload)
    if (resp.status == 200) {
        return resp.data.access_token
    }
    return false
}

const storeInstaPaymentDetail = catchAsync(async (req, res) => {
    try {
        const bearer = await getInstAuthToken()
        const {payment_id, payment_status, payment_request_id, username} = req.body
        if (bearer) {
            const resp = await axios.get(`https://${process.env.INSTA_API_URL}/v2/payments/${payment_id}/`, {
                headers: {
                    "Authorization" : `bearer ${bearer}`,
                }
            })
            if (resp.data.status === true) {
                const paymentDetails = await paymentservice.updateInstaPaymentStatus(payment_request_id, payment_id)
                res.send({status: "payment success", isCard: paymentDetails.isCard })
            }
            else {
                res.send({status: "payment failure"})
            }
        }
    }
    catch (e) {
        console.log(e)
        res.send({status: "payment failure"})
    }
})
const getInstaPaymentUrl = catchAsync(async (req, res) => {
    try {
    const bearer = await getInstAuthToken()
    if (bearer) {
        const product = await getproductDetails(req.body.isCard, req.body.productId)
        const amount = product.price
        let purpose = ''
        let influencer = ''
        if (req.body.isCard) {
          purpose = `${product.title} (${req.body.productId})`
          influencer = product.user_name 
        }
        else {
          purpose = `Image / Video (${req.body.productId})`
          influencer = product.username 
        }
        const paymentPayload = {
            purpose,
            amount,
            send_email: false,
            send_sms: false,
            webhook: '',
            redirect_url: `http://localhost:3000/${influencer}`,
            allow_repeated_payments: false,
            buyer_name: req.body.buyer_name,
            email: req.body.email,
            phone: req.body.phone,
        }
        const resPay = await axios.post(`https://${process.env.INSTA_API_URL}/v2/payment_requests/`,paymentPayload, {
            headers: {
                "Authorization" : `bearer ${bearer}`,
            }
        })
        if (resPay.statusText == "Created") {
            res.send({url: resPay.data.longurl})
            const buyerDetails = {
                buyerName: req.body.buyer_name,
                buyerPhoneNumber:req.body.phone, 
                buyerEmailId: req.body.email,
            }
            let status = 'success';
            if (req.body.isCard) {
                buyerDetails.comments = req.body.comments
                status = 'pending'
            }

            const paymentDetail = {
                buyerPhoneNumber: req.body.phone,
                buyerDetails,
                productId:req.body.productId,
                productDetails: product,
                razorpayOrderId: resPay.data.id,
                influencer,
                status: status,
                paymentStatus: "initiated",
                isCard:req.body.isCard
            };
          //  console.log(paymentDetail)
            await createpaymentDetail(paymentDetail);

           // console.log({url: resPay.data.longurl})
        }
        else {
            res.send({status: "error", message: "Unable to process payment"}) 
        }
    }
    else {
        res.send({status: "error", message: "Unable to process payment"}) 
    }
        
    }
    catch (e) {
        //console.log(e)
        res.send({status: "error", message: "Unable to process payment"}) 
    }
})

module.exports = {
    createOrders,
    getPaymentDetails,
    paymentSuccess: paymentVerification,
    updatePaymentStatus,
    getReceipts,
    getInstaPaymentUrl,
    storeInstaPaymentDetail,
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

