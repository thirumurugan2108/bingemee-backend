const mongoose = require('mongoose');
const config = require('../config/config');

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
});

const { userService, subscriptionService } = require('../services');


const processCronJob = async () => {
  const users = await userService.getAllUserHasSubscription()
  user.map(usr => {
    usr.subscriptions.map()
    subscriptionService.getExpiryDuration(usr.subscriptions, )
  })
  console.log(users)
}



processCronJob()