const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {  cardService } = require('../services');

const createCard = catchAsync(async (req, res) => {
  const username = req.user?.name;
  const user = await cardService.createCard( req?.body, username);
  res.status(httpStatus.CREATED).send(user);
});

const getCard = catchAsync(async (req, res) => {
  console.log(req?.query?.username);
  const username = req?.query?.username;
  const result = await cardService.getCard(username);
  res.status(200).send(result);
});

const updateCardStatus = catchAsync(async (req, res) => {
  const username = req.user?.name;
  const result = await cardService.updateCardStatus(username, req?.body);
  res.send(result);
});




module.exports = {
  createCard,
  updateCardStatus,
  getCard
};