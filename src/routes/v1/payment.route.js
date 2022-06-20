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
  .get(auth('getPaymentDetails'), paymentController.getPaymentDetails)
  .post(auth('updatepaymentStatus'), paymentController.updatePaymentStatus);
  
router
  .route('/receipts/:id')
  .get(paymentController.getReceipts)
router
  .route('/createOrder')
  .post(paymentController.createOrder)
router
  .route('/getPaymentUrl')
  .post(paymentController.getPaymentUrl)
router
  .route('/getUrl')
  .post(paymentController.getUrl)
router.route('/storePaymentDetail').post(paymentController.storePaymentDetail)
router.route('/getTransactionsByUser').post(auth('getTransactionsByUser'), paymentController.getTransactionsByUser);
module.exports = router;
