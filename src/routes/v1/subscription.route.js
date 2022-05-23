const express = require('express');
const auth = require('../../middlewares/auth');
const subscriptionController = require('../../controllers/subscription.controller');

const router = express.Router();
router.route('/').get(auth('getSubscriptionDetails'), subscriptionController.getSubscriptionDetails)
router.route('/disable').post(auth('disableSubscriptionStatus'), subscriptionController.disableSubscriptionStatus)
router.route('/update').post(auth('updateSubscription'), subscriptionController.updateSubscription)


module.exports = router;