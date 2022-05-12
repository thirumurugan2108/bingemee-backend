const { Receipts } = require('../models');

const getReceipts = async (email, receiptId) => {
  const filter = {
    email,
    receiptId
  }
  console.log(filter)
  const ReceiptResult = await Receipts.find(filter);
  return ReceiptResult.shift();
};

module.exports = {
  getReceipts
}
