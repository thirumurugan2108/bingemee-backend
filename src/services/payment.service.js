const { PaymentDetails } = require('../models');
const mongoose = require('mongoose');
const { defaultMaxListeners } = require('nodemailer/lib/xoauth2');
const totalRevenueView = mongoose.model('totalRevenue', {_id: String, totalRevenue: Number}, 'totalRevenue');
const postRevenueView = mongoose.model('postRevenue', {_id: String, postRevenue: Number}, 'postRevenue');
/**
 * Create a card
 * @param {Object} cardBody
 * @returns {Promise<PositionAlignSetting>}
 */
const  createpaymentDetail = async (paymentDetail) => {
  const PaymentDetailResult = await PaymentDetails.create(paymentDetail);
  return PaymentDetailResult;
  // return Card.create({...cardBody, user_name: username});
};

const getPendingJobs = async (username) => {
  const filter = {
    influencer:username,
    status: "pending",
    paymentStatus: "success"
  }
  const PaymentDetailResult = await PaymentDetails.find(filter).sort({ 'updatedAt' : -1});
  return PaymentDetailResult;
  // return Card.create({...cardBody, user_name: username});
};

const updatePaymentStatus = async (id, status) => {
  // const filter = { user_name: username };
  // var _id = Mongoose.Types.ObjectId.fromString(id);
  const result = await PaymentDetails.findByIdAndUpdate({_id: id}, {status: status});
  // const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  return result;
};

const updatePaymentProcessingStatus = async (payment_request_id, payment_id, status, testMode = false) => {
  const PaymentDetailResult = await PaymentDetails.findById(payment_request_id);
  //const PaymentDetailResult = await PaymentDetails.find({ $or:[{'razorpayOrderId':payment_request_id, _id: new mongoose.Types.ObjectId(payment_request_id)}]});
  // const filter = { user_name: username };
  // var _id = Mongoose.Types.ObjectId.fromString(id);
  const result = await PaymentDetails.findByIdAndUpdate({_id: PaymentDetailResult._id}, {razorpayPaymentId: payment_id, paymentStatus: status, testMode});
  // const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  return result;
};

const getSuccessJobs = async (username) => {
  const filter = {
    influencer:username,
    status: "success",
    isCard: 'true',
    paymentStatus: "success"
  }
  const PaymentDetailResult = await PaymentDetails.find(filter).sort({ 'updatedAt' : -1});
  return PaymentDetailResult;
};

const getUserPaymentProductIds = async (email) => {
  const productIds = []
  const PaymentDetailResult = await PaymentDetails.find({'buyerDetails.buyerEmailId':email, paymentStatus: "success"});
  PaymentDetailResult.map(pay => {
    productIds.push(pay.productId)
  })  
  return productIds;
}
const getTotalRevenue = async (email) => {
  let totalRevenue = 0
  const PaymentDetailResults = await totalRevenueView.find({_id:email})
  if (PaymentDetailResults) {
    totalRevenue = PaymentDetailResults[0].totalRevenue
  }

  return totalRevenue
}

const getInfulencerPostTransaction = async(postId) => {
  const revenueDetails = await postRevenueView.find({_id: postId})
  if (revenueDetails.length>0) {
    const {qty, totalRevenue} = JSON.parse(JSON.stringify(revenueDetails[0]))
    return {qty, totalRevenue}
  }
  else {
    return false
  }
}
const paymentDetailsToTransaction = async (paymentDetails) => {
  const transactions = []
  const task = paymentDetails.map((res, index) => {
    const d = new Date(res.createdAt);
    let price = res.productDetails.price
    if (res.isSubscription == true) {
      const subscription = res.productDetails.subscription.filter(sb => sb.duration == res.subscriptionDuration).shift()
      price = subscription.price
    }
    transactions.push({
      id: res._id,
      date: `${d.getDate()}/${d.getMonth()+1}`, 
      userName: res.buyerDetails.buyerName, 
      isCard: res.isCard,
      isSubscription: res.isSubscription,
      isVideo: res.productDetails.isVideo,
      isImage: res.isSubscription == false && res.isCard == false && res.productDetails.isVideo == false ? true : false,
      price,
      comments: res.buyerDetails.comments ? res.buyerDetails.comments : '',
      status: res.status,
      email: res.buyerDetails.buyerEmailId,
      phone: res.buyerDetails.buyerPhoneNumber,
      prodTitle: res.productDetails.title,
      prodDesc: res.productDetails.description
    })
  })
  await Promise.all(task)
  return transactions
}
const getLastDurationTransactions = async (influencer, fromDate, toDate) => {
  
  const fetchOptions = {
    influencer,
    createdAt: {$gte:new Date(fromDate).toISOString(), $lt:new Date(toDate).toISOString()},
    paymentStatus: "success"
  }
  if (process.env.SHOW_TEST_MODE_TRANSACTIONS === false) {
    fetchOptions.testMode = false
  }
  const PaymentDetailResult = await PaymentDetails.find({...fetchOptions}).sort( { "updatedAt": 1 } )
  return await paymentDetailsToTransaction(PaymentDetailResult)
}

const getInfulencerCardPayments = async (influencer) => {
  const PaymentDetailResult = await PaymentDetails.find({influencer, isCard: true, paymentStatus: "success"}).sort( { "createdAt": -1 } )
  const cardPayments = []
  PaymentDetailResult.map((res, index) => {
    cardPayments.push({
      sl: index + 1,
      createdAt: `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`,
      title: res.productDetails.title, 
      price: res.productDetails.price, 
      status: res.status, 
      comments: res.buyerDetails.comments,
      buyerName: res.buyerDetails.buyerName, 
      buyerPhoneNumber: res.buyerDetails.buyerPhoneNumber, 
      buyerEmailId: res.buyerDetails.buyerEmailId,
      id: res._id
    })
  })
  return cardPayments
}
const getAllTransactions = async ({influencer, type, status, page = 1, limit = 5}) => {
  let skip = 0
  if (page > 1) {
    skip = page*limit
  }
  const fetchOptions = {
    influencer,
    paymentStatus: "success",
  }
  if (status) {
    fetchOptions.status = status
  }
  switch (type) {
    case 'post':
      fetchOptions.isCard = false
      fetchOptions.isSubscription = false
      break;
    case 'cards': 
      fetchOptions.isCard = true
      break
    case 'subscription':
      fetchOptions.isSubscription = true
      break
  }

  if (process.env.SHOW_TEST_MODE_TRANSACTIONS === false) {
    fetchOptions.testMode = false
  }

  const PaymentDetailResult = await PaymentDetails.find({...fetchOptions}).sort( { "createdAt": -1 } ).skip(skip).limit(limit)
  return await paymentDetailsToTransaction(PaymentDetailResult)
}
const getPaymentDetailsById = async (id) => {
  return await PaymentDetails.findById(id)
}
module.exports = {
  createpaymentDetail,
  getPendingJobs,
  getSuccessJobs,
  updatePaymentStatus,
  getUserPaymentProductIds,
  getTotalRevenue,
  getInfulencerCardPayments,
  getInfulencerPostTransaction,
  updatePaymentProcessingStatus,
  getLastDurationTransactions,
  getPaymentDetailsById,
  getAllTransactions
};
