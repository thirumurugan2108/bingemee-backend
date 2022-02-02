// const { mongoose } = require('../config/config');
const { Mongoose } = require('mongoose');
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

const updateCardStatus = async (id, cardData) => {
  // const filter = { user_name: username };
  // var _id = Mongoose.Types.ObjectId.fromString(id);
  const cardResult = Card.findByIdAndUpdate({_id: id}, cardData);
  // const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  return cardResult;
};

const getCard =  async (username)=> {
  const filter = { user_name: username };
  const cardResult = await Card.find(filter);
  return cardResult;
}

const findCardById =  async (id)=> {
  const cardResult = await Card.findById(id);
  return cardResult;
}

module.exports = {
  createCard,
  updateCardStatus,
  getCard,
  findCardById
};
