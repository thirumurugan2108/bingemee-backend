const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService } = require('../services');

const createPostByUserId = catchAsync(async (req, res) => {
  console.log(req.user);
  const username = req.user?.name;
  console.log({...req?.body, username: username});
  const user = await postService.createPost({...req?.body, username: username});
  res.status(httpStatus.CREATED).send(user);
});

const getAllPosts = catchAsync(async (req, res) => {
  console.log(req.user);
  const username = req.user?.name
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.getAllImagesByUserId(username);
  res.send(result);
});

const getPostByUserId = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updatePostByUserId = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});


module.exports = {
  createPostByUserId,
  getAllPosts,
  getPostByUserId,
  updatePostByUserId,
};
