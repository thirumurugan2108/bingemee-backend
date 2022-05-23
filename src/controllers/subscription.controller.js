const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError')
const catchAsync = require('../utils/catchAsync')
const { subscriptionService } = require('../services')

const updateSubscription = catchAsync(async (req, res) => {
  try {
    if (req.body.influencer && req.body.price) { 
      const subscription = []
      console.log(process.env)
      const config = JSON.parse(process.env.SUBSCRIPTION_CONFIG)
      //console.log(config)
      config.map(cnf => {
        let price = parseInt(req.body.price)
        if (cnf.discount != 0 ) {
          price = Math.round((price * cnf.duration) - ((price * cnf.duration*cnf.discount)/100), 2)
        }
        subscription.push({...cnf, price  })
      })
      const payload = {
        influencer: req.body.influencer,
        subscription,
        status: true
      }
      console.log(payload)
      const subscriptionResult = await subscriptionService.updateSubscription(payload);
      console.log(subscriptionResult)
      res.send(subscriptionResult);
    }
    else {
      throw new ApiError(httpStatus.NOT_FOUND, "Missing required data")
    }
  }
  catch (e) {
    console.log(e)
  }
})

const getSubscriptionDetails =  catchAsync(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionData(req.query.influencer)
  console.log(subscription)
  if (subscription) {
    res.send(subscription)
  }
  else {
    throw new ApiError(httpStatus.NOT_FOUND, "Unable to fetch subscription")
  }
})

const disableSubscriptionStatus =  catchAsync(async (req, res) => {
  const subscriptionResult = await subscriptionService.disableSubscriptionStatus(req.body);
  res.send({status: "success"})
})

module.exports = {
  updateSubscription,
  getSubscriptionDetails,
  disableSubscriptionStatus,
}