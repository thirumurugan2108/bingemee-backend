// const { mongoose } = require('../config/config');
const { Mongoose } = require('mongoose');
const { Contact } = require('../models');

/**
 * Create a card
 * @param {Object} cardBody
 * @returns {Promise<PositionAlignSetting>}
 */
const createInquiryDetails = async (inquiryBody) => {
  const result = await Contact.create(inquiryBody);
  return result;
};


module.exports = {
  createInquiryDetails
};
