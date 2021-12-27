const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router
  .route('/')
  .get(paymentController.createOrders)
  .post(paymentController.paymentSuccess)

module.exports = router;
