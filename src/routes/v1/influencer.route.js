const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

router
  .route('/home')
  .get(auth('getInfluencerHome'), userController.getInfluencerHomeData);


  module.exports = router;