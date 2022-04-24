const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {  contactService } = require('../services');

const createInquiry = catchAsync(async (req, res) => {
  const contact = await contactService.createInquiryDetails( req?.body);
  res.status(httpStatus.CREATED).send(contact);
});



module.exports = {
  createInquiry,
};
