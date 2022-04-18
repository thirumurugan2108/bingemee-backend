const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService, cardService, paymentservice } = require('../services');

const register = catchAsync(async (req, res) => {
  const body = {
    ...req.body,
    role: "influencer",
    total:0,
    paid:0,
    balance:0
  }

  const user = await userService.createInfluencer(body);
  cardService.createCard({
    "title": "DM on instagram",
    "description": "We can chat in instagram for 10 mins",
    "price": "200",
    "isActive": true,
  }, user.name)
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const sendLoginOtp = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email, "user")

  if (user) {
    const otp = await emailService.sendOTP(user.email, user.name)
    const updateStatus = await userService.loginWithOTP(user.email, otp)
    if (updateStatus == true) {
      res.status(httpStatus.CREATED).send(true);
    }
    else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update OTP');
    }
  }
  else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is not registered with us.');
  }
})

const userRegister = catchAsync(async (req, res) => {
  //const tokens = await tokenService.generateAuthTokens(user);
  const userData = await userService.getUserByEmail(req.body.email, "user")
  if (userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered with us.');
  }
  const otp = await emailService.sendOTP(req.body.email, req.body.name, req.body.influencer)
  const body = {
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    role: "user",
    otp,
    otpSentTime: Date.now(),
    total:0,
    paid:0,
    balance:0
  }
  const user = await userService.createUser(body);
  res.status(httpStatus.CREATED).send(true);
});

const registerVerifyOtp = catchAsync(async (req, res) => {
  const {email, otp} = req.body
  const user = await userService.validateOtp(email, otp, 'signup')
  const paidProductIds = await paymentservice.getUserPaymentProductIds(email)
  const tokens = await tokenService.generateAuthTokens(user)
  res.status(httpStatus.CREATED).send({ user, tokens, paidProductIds })
});
const verifyOtp = catchAsync(async (req, res) => {
  const {email, otp} = req.body
  const user = await userService.validateOtp(email, otp, 'login')
  const paidProductIds = await paymentservice.getUserPaymentProductIds(email)
  const tokens = await tokenService.generateAuthTokens(user)
  res.status(httpStatus.CREATED).send({ user, tokens, paidProductIds })
});

const login = catchAsync(async (req, res) => {
  const { name, password } = req.body;
  const user = await authService.loginUserWithNameAndPassword(name, password);
  if(!user.isEmailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username is not verified yet  ');
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  userRegister,
  registerVerifyOtp,
  verifyOtp,
  sendLoginOtp,
};
