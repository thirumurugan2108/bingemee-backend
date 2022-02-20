const httpStatus = require('http-status');
const { Post } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a post
 * @param {Object} postBody
 * @returns {Promise<PositionAlignSetting>}
 */
const createPost = async (postBody) => {
  // if (await User.isEmailTaken(userBody.email)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  // if (await User.isUserNameTaken(userBody.name)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  // }
  return Post.create(postBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const findPostsByUsername = async (name) => {
  const posts = await Post.find({ username: name });

  let images = [];
  let videos = [];
  posts.forEach(element => {
    if (!element.isVideo) {
      images.push(element);
    } else {
      videos.push(element);
    }
  });
  const result = {
    images: images,
    videos: videos
  };
  return result;
};

const updatePostById = async (id, post) => {
   const result = Post.findByIdAndUpdate(id,post);
   return result;
};
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getPostsById = async (id) => {
  const test = await Post.findById(id)
  return test;
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
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const upsertPost = async (uuid, post) => {
  const filter = { uuid: uuid };
  const postResult = await Post.findOneAndUpdate(filter, post, { upsert: true });
  return postResult;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
// const deleteUserById = async (userId) => {
//   const user = await getUserById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   await user.remove();
//   return user;
// };

const getAllPostsByUsername = async (username) => {
  const filter = { username: username };
  const postResult = await Post.find(filter).sort({ 'updatedAt' : -1});;
  let images = [];
  let videos = [];
  postResult.forEach(element => {
    let filteredElement = {
      title: element.title,
      price: element.price,
      isPaid: element.isPaid,
      id: element.id,
      
    }
    if(element.isPaid === 'No') {
      filteredElement.fileUrl = element.fileUrl;
    }
    if (!element.isVideo) {
      images.push(filteredElement);
    } else {
      videos.push(filteredElement);
    }
  });
  const result = {
    images: images,
    videos: videos
  };
  return result;
};
module.exports = {
  createPost,
  getPostsById,
  findPostsByUsername,
  getAllPostsByUsername,
  updatePostById,
  upsertPost
};
