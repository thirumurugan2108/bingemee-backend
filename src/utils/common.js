const displayPriceConversion = (userCommision, price) => {
  const commisionPercent = userCommision ? userCommision : process.env.COMMISSION_DEFAULT
  let displayPrice = price + (price*commisionPercent/100)
  if (process.env.GST_PERCENTAGE) {
    displayPrice = displayPrice + (displayPrice*process.env.GST_PERCENTAGE/100)
  }
  displayPrice = displayPrice.toFixed(2)
  return displayPrice
}


module.exports = {
  displayPriceConversion
}