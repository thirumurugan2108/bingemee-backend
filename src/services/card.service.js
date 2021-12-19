const { Card } = require('../models');

/**
 * Create a card
 * @param {Object} cardBody
 * @returns {Promise<PositionAlignSetting>}
 */
const createCard = async (cardBody, username) => {
  const filter = { user_name: username };
  const cardResult = await Card.findOneAndUpdate(filter, cardBody, {upsert: true});
  return cardResult;
  // return Card.create({...cardBody, user_name: username});
};

const updateCardStatus = async (username, cardData) => {
  const filter = { user_name: username };
  const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  return cardResult;
};

const getCard =  async (username)=> {
  const filter = { user_name: username };
  const cardResult = await Card.findOne(filter);
  return cardResult;
}
module.exports = {
  createCard,
  updateCardStatus,
  getCard
};
