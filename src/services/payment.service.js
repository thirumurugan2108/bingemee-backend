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

// const updateCardStatus = async (username, cardData) => {
//   const filter = { user_name: username };
//   const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
//   return cardResult;
// };

// const getCard =  async (username)=> {
//   const filter = { user_name: username };
//   const cardResult = await Card.find(filter);
//   return cardResult;
// }

// const findCardById =  async (id)=> {
//   const cardResult = await Card.findById(id);
//   return cardResult;
// }

module.exports = {
  createpaymentDetail
};
