const express = require('express');
const auth = require('../../middlewares/auth');
const { cardController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('createCard'),  cardController.createCard)
  .get(auth('createCard'),cardController.getCard)
  .patch(auth('updateCard'), cardController.updateCardStatus)


module.exports = router;
