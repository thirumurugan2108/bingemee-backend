const { PaymentDetails } = require('../models');

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
  const PaymentDetailResult = await PaymentDetails.find(filter).sort({ 'createdAt' : -1});
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

const getSuccessJobs = async (username) => {
  const filter = {
    influencer:username,
    status: "success",
    isCard: 'true'
  }
  const PaymentDetailResult = await PaymentDetails.find(filter).sort({ 'createdAt' : -1});
  return PaymentDetailResult;
};

module.exports = {
  createpaymentDetail,
  getPendingJobs,
  getSuccessJobs,
  updatePaymentStatus
};
