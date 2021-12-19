const express = require('express');
const auth = require('../../middlewares/auth');
const paymentController = require('../../controllers/payment.controller');

const router = express.Router();

router
  .route('/')
  .get(auth('createOrders'),  paymentController.createOrders)
  .post(auth('paymentSuccess'),  paymentController.paymentSuccess)

module.exports = router;
