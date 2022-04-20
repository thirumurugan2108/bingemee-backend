const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3000/" : "https://bingemeee.com/"
const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
// if (config.env !== 'test') {
//   transport
//     .verify()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
// }

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html = '') => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendOTP = async (to, name, influencer = '') => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const subject  = 'Here\'s the authorization code you asked for'
  let text = `Dear ${name},
   To verify your email, please use the below OTP with in 10 mins.
   ${otp}`
   if (influencer) {
    text += `or use below link to ${baseURL}influencer/${influencer}?validateEmail=true&email=${to} enter the otp
   `;
   }
  let html = `Dear ${name},
  To verify your email, please use the below OTP with in 10 mins.
  <b>${otp}</b>`
  if (influencer) {
  html += `or <a href="${baseURL}/influencer/${influencer}?validateEmail=true&email=${to}">click here to enter the OTP</a>
  `
  } 
  await sendEmail(to, subject, text, html);
  return otp
}

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendOTP
};
