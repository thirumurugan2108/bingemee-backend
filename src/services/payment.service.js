const { PaymentDetails } = require('../models');
const mongoose = require('mongoose');
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
    status: "pending"
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

const updateInstaPaymentStatus = async (payment_request_id, payment_id) => {
  const PaymentDetailResult = await PaymentDetails.find({'razorpayOrderId':payment_request_id});
  // const filter = { user_name: username };
  // var _id = Mongoose.Types.ObjectId.fromString(id);
  const result = await PaymentDetails.findByIdAndUpdate({_id: PaymentDetailResult[0]._id}, {razorpayPaymentId: payment_id, paymentStatus: "success", });
  // const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  return result;
};

const getSuccessJobs = async (username) => {
  const filter = {
    influencer:username,
    status: "success",
    isCard: 'true'
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

const getInfulencerCardPayments = async (influencer) => {
  const PaymentDetailResult = await PaymentDetails.find({influencer, isCard: true}).sort( { "createdAt": -1 } )
  const cardPayments = []
  PaymentDetailResult.map((res, index) => {
    const d = new Date(res.createdAt);
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
module.exports = {
  createpaymentDetail,
  getPendingJobs,
  getSuccessJobs,
  updatePaymentStatus,
  getUserPaymentProductIds,
  getTotalRevenue,
  getInfulencerCardPayments,
  getInfulencerPostTransaction,
  updateInstaPaymentStatus,
};
