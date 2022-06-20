const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {  cardService } = require('../services');
const restrictedWords = JSON.parse(process.env.RESTRICTED_WORDS)

const createCard = catchAsync(async (req, res) => {
  const username = req.user?.name;
  const user = await cardService.createCard( req?.body, username);
  res.status(httpStatus.CREATED).send(user);
});

const getCard = catchAsync(async (req, res) => {
  const username = req?.user?.name;
  const result = await cardService.getCard(username);
  res.status(200).send(result);
});
const isRestrictedWordsPresent = async (strings) => {
  let isWordPresent = false
  const task = restrictedWords.map((restricted) => {
    if (strings.indexOf(restricted) !== -1) {
      isWordPresent = true
    }
  })
  await Promise.all(task)
  return isWordPresent
}
const updateCardStatus = catchAsync(async (req, res) => {
  // const username = req.user?.name;
  const isRestrictedWordPresent = await isRestrictedWordsPresent(req.body.title)
  if (isRestrictedWordPresent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restricted words present in your title');
  }
  const isRestrictedWordDesc = await isRestrictedWordsPresent(req.body.description)
  if (isRestrictedWordDesc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restricted words present in your description');
  }
  const result = await cardService.updateCardStatus(req?.body?.id, req?.body);
  res.send(result);
});

const deleteCardById = catchAsync(async (req, res) => {
  const result = await cardService.deleteCardById(req?.body?.id);
  res.status(200).send(result);
});


module.exports = {
  createCard,
  updateCardStatus,
  getCard,
  deleteCardById
};
