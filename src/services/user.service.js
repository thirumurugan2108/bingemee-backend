const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createInfluencer = async (userBody) => {
  // if (await User.isEmailTaken(userBody.email)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  if (await User.isUserNameTaken(userBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  return User.create(userBody);
};

const createUser = async (userBody) => {
  userBody.fullName = userBody.name
  userBody.password = 't12456567'
  if (await User.isEmailTaken(userBody.email)) {
    console.log("asdasd")
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  // if (await User.isUserNameTaken(userBody.name)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  // }
  return User.create(userBody);
};

const validateOtp = async(email, otp, type) => {
  // console.log(email)
  // console.log(otp)
  const user = await User.validateOtp(email, otp, type);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please enter the valid OTP');
  }
  return user
}

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by name
 * @param {string} name
 * @returns {Promise<User>}
 */
 const getUserByName = async (name) => {
  return User.findOne({ name: name });
};

const loginWithOTP = async (email, otp) => {
  const userData = await User.updateOtp(email, otp)
  return true
}
/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (user, updateBody) => {
  // const user = await getUserById(userId);
  // if (!user) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  // }
  // if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  user.photoUrl = updateBody.photoUrl;
  // Object.assign(user, updateBody);
  // const filter = { user_name: username };
  // const cardResult = await Card.findOneAndUpdate(filter, cardData, {upsert: true});
  // const result = await User.findOneAndUpdate({name: username},updateBody);
  // const result = await User.updateOne({ _id: ObjectId(userId) },updateBody);
  // console.log(user.toString());
  // console.log(updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};


module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByName,
  updateUserById,
  deleteUserById,
  validateOtp,
  getUserByEmail,
  loginWithOTP,
};
