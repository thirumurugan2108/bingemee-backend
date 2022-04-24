const express = require('express');
const auth = require('../../middlewares/auth');
const { contactController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(contactController.createInquiry)

module.exports = router;
