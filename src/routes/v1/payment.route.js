const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router
  .route('/')
  .get(paymentController.createOrders)
  .post(paymentController.paymentSuccess)

  router
    .route('/paymentDetails')
    .get(auth('getPaymentDetails'),paymentController.getPaymentDetails)
    .post(auth('updatepaymentStatus'),paymentController.updatePaymentStatus);
module.exports = router;
