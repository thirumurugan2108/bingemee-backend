const httpStatus = require('http-status')
const pick = require('../utils/pick')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')
const { userService, postService, cardService, paymentservice, emailService, receiptsService, subscriptionService } = require('../services')
const base64 = require('base-64')
const Razorpay = require("razorpay");
const crypto = require('crypto');
const { createpaymentDetail, getPaymentDetailsById } = require('../services/payment.service');
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
const Last7Days = () => {
    const result = [];
    for (let i=0; i<7; i++) {
      let d = new Date();
      d.setDate(d.getDate() - i);
      const curDate = d.getDate()
      const month = d.getMonth()+1
      result.push(`${curDate}/${month}`)
    }
    return(result.reverse());
}
const getPaymentDetails = catchAsync(async (req, res) => {
    try {
        // getting the details back from our font-end
        const user = req.user;
        const username = user?.name;
        let pendingJobs = await paymentservice.getPendingJobs(username);
        const successJobs = await paymentservice.getSuccessJobs(username);
        //const cardPayments = await paymentservice.getInfulencerCardPayments(username);
        const totalRevenue = await paymentservice.getTotalRevenue(username);
        const last7Days = Last7Days()
        const d = new Date()
        const toDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()+1}`
        d.setDate(d.getDate() - 5);
        const fromDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
        const transactions = await paymentservice.getLastDurationTransactions(username, fromDate, toDate)
        const labels = []
        const imageData = [0, 0, 0, 0, 0, 0, 0]
        const videoData = [0, 0, 0, 0, 0, 0, 0]
        const cardsData = [0, 0, 0, 0, 0, 0, 0]
        const subscriptionData = [0, 0, 0, 0, 0, 0, 0]
        last7Days.map(days => {
            const [day, month] = days.split('/')
            labels.push(day)
        })
        
        // transactions to graph data.
        transactions.map(trans => {
            const index = last7Days.indexOf(trans.date)
            if (trans.isCard) {cardsData[index] = trans.price}
            else if (trans.isImage) {imageData[index] = trans.price}
            else if (trans.isVideo) {videoData[index] = trans.price}
            else if (trans.isSubscription) {subscriptionData[index] = trans.price}
        })
        const result = {
            username,   
            pendingJobs,
            successJobs,
            totalRevenue,
            paid: user.paid,
            balance: totalRevenue - user.paid,
            transactions,
            graph: {
                labels,
                imageData,
                videoData,
                cardsData,
                subscriptionData
            }
        }
        console.log(result)
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
        //console.log(id)
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

const verifyInstaPayment = catchAsync(async (req) => {
    const bearer = await getInstAuthToken()
    const {payment_id, payment_status, payment_request_id, username} = req.body
    if (bearer) {
        const resp = await axios.get(`https://${process.env.INSTA_API_URL}/v2/payments/${payment_id}/`, {
            headers: {
                "Authorization" : `bearer ${bearer}`,
            }
        })
        if (resp.data.status === true) {
            const paymentDetails = await paymentservice.updatePaymentProcessingStatus(payment_request_id, payment_id, "success")
            //console.log(paymentDetails)
            if (paymentDetails.isSubscription) {
                userService.StoreSubscription(paymentDetails.email, paymentDetails.subscriptionDuration, paymentDetails.influencer, )
            }
            return true
        }
    }
    return false
})

const verifyCashfreePayment =  async (req) => {
    try {
    let API_VERSION = process.env.CASHFREE_API_VERSION
    let CLIENT_ID = process.env.CASHFREE_CLIENT_ID
    let CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET
    let API_URL = process.env.CASHFREE_API_URL
    let testMode = false
    if(req.body.test_mode && req.body.test_mode == process.env.TEST_MODE_SECRET) {
        API_VERSION = process.env.TEST_CASHFREE_API_VERSION
        CLIENT_ID = process.env.TEST_CASHFREE_CLIENT_ID
        CLIENT_SECRET = process.env.TEST_CASHFREE_CLIENT_SECRET
        API_URL = process.env.TEST_CASHFREE_API_URL
        testMode = true
    }
    const {order_id} = req.body
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-version": API_VERSION,
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
    }
    
    const resp = await axios.get(`https://${API_URL}/pg/orders/${order_id}/payments`, {headers})
    if (resp.status == 200) {
        if (resp.data[0].payment_status == "SUCCESS") {
            const paymentDetails = await paymentservice.updatePaymentProcessingStatus(order_id, resp.data.payment_id, "success", testMode)
            if (paymentDetails.isSubscription) {
                await userService.StoreSubscription(paymentDetails.buyerDetails.buyerEmailId, paymentDetails.subscriptionDuration, paymentDetails.influencer)
                await userService.updateSubscribers(paymentDetails.influencer, paymentDetails.buyerDetails.id)
            }
            return paymentDetails
        }
        else {
            await paymentservice.updatePaymentProcessingStatus(order_id, resp.data.payment_id, "failure", testMode)
            return false
        }
    }
    return false
}
catch (e) {
    console.log(e)
}
}

const storePaymentDetail = catchAsync(async (req, res) => {
    let paymentDetails = false
    try {
        
        if (req.body.payment_type=='instamojo') {
            paymentDetails = await verifyInstaPayment(req)
        }
        else if (req.body.payment_type =='cashfree') {
            paymentDetails = await verifyCashfreePayment(req)
        }
        if (paymentDetails) {
            res.send({status: "payment success", isCard: paymentDetails.isCard, isSubscription: paymentDetails.isSubscription, influencer: paymentDetails.influencer })
        }
        else {
            res.send({status: "payment failure"})
        }
    }
    catch (e) {
        console.log(e)
        res.send({status: "payment failure"})
    }
})

const InstMojoPaymentUrl = catchAsync(async (req, product) => {
    const bearer = await getInstAuthToken()
    if (req.body.isCard) {
        purpose = `${product.title} (${req.body.productId})`
        amount = product.price
    }
    else if (req.body.isSubscription && req.body.subscription) {
        const currentSubscription = product.subscription.filter(sub => sub.name == req.body.subscription).shift()
        purpose = `${currentSubscription.name} Subscription for ${product.influencer}`
        amount = currentSubscription.price
    }
    else {
        purpose = `Image / Video (${req.body.productId})`
        amount = product.price
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
    if (bearer) {
        const resPay = await axios.post(`https://${process.env.INSTA_API_URL}/v2/payment_requests/`,paymentPayload, {
            headers: {
                "Authorization" : `bearer ${bearer}`,
            }
        })
        return resPay
    }
    return false
})
const cashFreePaymentUrl = async (paymentDetails) => {
    try {
    //EXCLUDED LIVE PAYMENT.
    const excludedEmails = process.env.PAYMENT_EXCLUDE_EMAILS.split(',')
    let API_VERSION = process.env.CASHFREE_API_VERSION
    let CLIENT_ID = process.env.CASHFREE_CLIENT_ID
    let CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET
    let API_URL = process.env.CASHFREE_API_URL
    let testMode = ''
    if (excludedEmails.indexOf(paymentDetails.buyerDetails.buyerEmailId) != -1) {
        API_VERSION = process.env.TEST_CASHFREE_API_VERSION
        CLIENT_ID = process.env.TEST_CASHFREE_CLIENT_ID
        CLIENT_SECRET = process.env.TEST_CASHFREE_CLIENT_SECRET
        API_URL = process.env.TEST_CASHFREE_API_URL
        testMode=`&test_mode=${process.env.TEST_MODE_SECRET}`
    }

    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-version": API_VERSION,
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
    }
    
    let order_tags = {}
    if (paymentDetails.isSubscription) {
       order_tags = {
          subscription: true
       }
    }
    else if (paymentDetails.isCard) {
        order_tags = {
           card: true
        }
     }
     else {
        order_tags = {
            imageVideo: true
         }
     }
    const payload = {
        order_id: paymentDetails._id,
        order_amount: paymentDetails.amount,
        order_currency: "INR",
        customer_details: {
            customer_id: paymentDetails.buyerDetails.id,
            customer_email: paymentDetails.buyerDetails.buyerEmailId,
            customer_phone: paymentDetails.buyerDetails.buyerPhoneNumber,
        },
        order_meta: {
            return_url: `${process.env.PAYMENT_RETURN_URL_DOMAIN}/paymentVerification?payment_type=cashfree&order_id={order_id}&order_token={order_token}${testMode}`,
            //todo.
            notify_url: `${process.env.PAYMENT_RETURN_URL_DOMAIN}/cashfreeNotify`,
            order_tags,
        }
    }
    console.log(payload)
    const resp = await axios.post(`https://${API_URL}/pg/orders`, payload, {headers})
    if (resp.status == 200) {
         return resp.data
    }
    return false
}
catch (e) {
    console.log(e)
    return false
}
}
const createOrder = catchAsync(async (req, res) => {
    const isSubscription = req.body.subscription != ''
        const product = await getproductDetails(req.body.isCard, req.body.productId, isSubscription, req.body.influencer)
        const userDetails = await userService.getUserByEmail(req.body.email, 'user')
        let amount = 0
        let orderNote = ''
        let influencer = ''
        let subscriptionDuration = 0
        if (req.body.isCard) {
          influencer = product.user_name 
          amount = product.price
          orderNote = `${product.title} (${req.body.productId})`
        }
        else if (isSubscription) {
            const currentSubscription = product.subscription.filter(sub => sub.name == req.body.subscription).shift()
            amount = currentSubscription.price
            influencer = product.influencer
            orderNote = `${currentSubscription.name} Subscription for ${product.influencer}`
            subscriptionDuration = currentSubscription.duration
        }
        else {
          influencer = product.username 
          amount = product.price
          orderNote = `Image / Video (${req.body.productId})`
        }

        const buyerDetails = {
            buyerName: userDetails.name,
            buyerPhoneNumber:userDetails.mobile, 
            buyerEmailId: userDetails.email,
            id: userDetails._id,
        }
        let status = 'success';
        if (req.body.isCard) {
            buyerDetails.comments = req.body.comments
            status = 'pending'
        }

        const paymentDetail = {
            buyerPhoneNumber: userDetails.mobile,
            buyerDetails,
            productId:product.id,
            productDetails: product,
            razorpayOrderId: '',
            influencer,
            status: status,
            paymentStatus: "initiated",
            isCard:req.body.isCard,
            isSubscription,
            subscriptionDuration,
            orderNote,
            amount,
            paymentGateway: req.body.paymentGateway
        };
        let order_id = ''
        let paymentLink = ''
        const payDetails = await createpaymentDetail(paymentDetail)
        if (payDetails && payDetails._id) {
            res.send({url:`${process.env.BARADIEL_PAYMENT_PAGE_URL}?id=${payDetails._id}`})
        }
        else {
            res.send({status: "error", message: "Unable to process payment"}) 
        }
})

const getUrl = catchAsync(async (req, res) => {
    if (req.body.id) {
        const paymentDetail = await getPaymentDetailsById(req.body.id)
        const {order_id, payment_link} = await cashFreePaymentUrl(paymentDetail,paymentDetail.amount )
        if (paymentDetail.influencer) {
            const influencer = userService.getUserByName(paymentDetail.influencer)
            paymentDetail.influencerName = influencer.fullName
        }
        if (payment_link) {
           res.send({url: payment_link, paymentDetail, order_id})
        }
        else {
            res.send({status: "error", message: "Unable to process payment"}) 
        }
    }
    else {
        res.send({status: "error", message: "Unable to process payment"}) 
    }
})

const getPaymentUrl = catchAsync(async (req, res) => {
    try {
        const isSubscription = req.body.subscription != ''
        const product = await getproductDetails(req.body.isCard, req.body.productId, isSubscription, req.body.influencer)
        const userDetails = await userService.getUserByEmail(req.body.email, 'user')
        let amount = 0
        let orderNote = ''
        let influencer = ''
        let subscriptionDuration = 0
        if (req.body.isCard) {
          influencer = product.user_name 
          amount = product.price
          orderNote = `${product.title} (${req.body.productId})`
        }
        else if (isSubscription) {
            const currentSubscription = product.subscription.filter(sub => sub.name == req.body.subscription).shift()
            amount = currentSubscription.price
            influencer = product.influencer
            orderNote = `${currentSubscription.name} Subscription for ${product.influencer}`
            subscriptionDuration = currentSubscription.duration
        }
        else {
          influencer = product.username 
          amount = product.price
          orderNote = `Image / Video (${req.body.productId})`
        }

        const buyerDetails = {
            buyerName: userDetails.name,
            buyerPhoneNumber:userDetails.mobile, 
            buyerEmailId: userDetails.email,
            id: userDetails._id,
        }
        let status = 'success';
        if (req.body.isCard) {
            buyerDetails.comments = req.body.comments
            status = 'pending'
        }

        const paymentDetail = {
            buyerPhoneNumber: userDetails.mobile,
            buyerDetails,
            productId:product.id,
            productDetails: product,
            razorpayOrderId: '',
            influencer,
            status: status,
            paymentStatus: "initiated",
            isCard:req.body.isCard,
            isSubscription,
            subscriptionDuration,
            orderNote,
            amount,
            paymentGateway: req.body.paymentGateway
        };
        let order_id = ''
        let paymentLink = ''
        const payDetails = await createpaymentDetail(paymentDetail)
        if (req.body.paymentGateway == "instamojo") {
            // Need to test.
            const instMoJoURL = await InstMojoPaymentUrl(req, product)
            if (instMoJoURL){
              paymentLink = instMoJoURL.data.longurl
            }
        }
        if (req.body.paymentGateway =="cashfree") {
            const cashFreeOrder = await cashFreePaymentUrl(payDetails, amount)
            order_id = cashFreeOrder.order_id
            paymentLink = cashFreeOrder.payment_link
        }
        
        paymentDetail.razorpayOrderId = order_id
        
        if (paymentLink) {
           res.send({url: paymentLink})
        }
        else {
            res.send({status: "error", message: "Unable to process payment"}) 
        }
    }
    catch (e) {
        console.log(e)
        res.send({status: "error", message: "Unable to process payment"}) 
    }
})
const getTransactionsByUser = catchAsync(async (req, res) => {
    const user = req.user;
    const influencer = user?.name;
    let {status = '', type = '', page = 1} = req.body
    if (status == 'all')  {
        status = ''
    }
    if (!influencer) {
        res.send({status: "error", message: "Unable to fetch Transactions"}) 
    }
    else {
        const transactions = await paymentservice.getAllTransactions({influencer, status, type, page })
        res.send(transactions)
    }
})

module.exports = {
    createOrders,
    getPaymentDetails,
    paymentSuccess: paymentVerification,
    updatePaymentStatus,
    getReceipts,
    getPaymentUrl,
    storePaymentDetail,
    createOrder,
    getUrl,
    getTransactionsByUser,
};

async function getproductDetails(isCard, id, isSubscription = false, influencer= '') {
    let result = {};
    if (isCard) {
        result = await cardService.findCardById(id);
    } else if(isSubscription) {
        result = await subscriptionService.getSubscriptionData(influencer);
    }else {
        result = await postService.getPostsById(id);
    }
    return result;
}

