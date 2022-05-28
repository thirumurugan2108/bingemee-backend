const httpStatus = require('http-status');
const { Subscription } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Create a post
 * @param {Object} postBody
 * @returns {Promise<PositionAlignSetting>}
 */
const createSubscription = async (data) => {
  return Subscription.create(data);
};


const getSubscriptionData = async (influencer, statusCheck = false) => {
  try {
  const subscriptions = await Subscription.find({ influencer });
  if (subscriptions.length > 0) {
    const subscription = subscriptions.shift()
    if (statusCheck && subscription.status == true) {
      return subscription
    }
    return subscription
  }
  else {
    return false
  }
}
catch(e) {
  console.log(e)
}
}

const updateSubscription = async (data) => {
  const subscription = await getSubscriptionData(data.influencer)
  if (!subscription) {
    return createSubscription(data)
  }

  const subscriptionData = Subscription.findByIdAndUpdate(subscription['_id'], data);
  return subscriptionData;
}
const disableSubscriptionStatus = async({id}) => {
  const subscriptionData = Subscription.findByIdAndUpdate(id, {status: false});
  return subscriptionData;
}

const getTotalSubscribers = async({id}) => {
  
}
module.exports = {
  createSubscription,
  getSubscriptionData,
  updateSubscription,
  disableSubscriptionStatus
};
