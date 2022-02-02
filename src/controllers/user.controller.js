const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, cardService, postService } = require('../services');
const { saveProfilePhoto } = require('../utils/Aws');
const { compress } = require('../utils/jimp');
const { v4: uuidv4 } = require('uuid');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers({}, {});

  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserDetials = catchAsync(async (req, res) => {
  const user = await userService.getUserByName(req?.query?.username);
  const cardList = await cardService.getCard(req?.query?.username);
  const postList = await postService.getAllPostsByUsername(req?.query?.username);
  const result = {
    user,
    cardList,
    images: postList?.images,
    videos: postList?.videos
  }
  res.send(result);
});

const uploadProfilePhoto = catchAsync(async (req, res) => {

  // if (req.body.isFileUpdate === "true") {
  const isVideo = req.file.mimetype === 'video/mp4';
  const username = req.user?.name;
  const userId = req.user?._id;
  console.log(userId);
  if (isVideo) {
    return res.status(400).json({ msg: "invalid file format. video can't be uploaded.please use image" });
  }

  let resultFileToUpload = await compress(req.file.buffer);

  let uuid = "";
  if (req.body.uuid == undefined) {
    uuid = uuidv4().toString();
  } else {
    uuid = req.body.uuid;
  }

  const photo_url = await saveProfilePhoto(
    username,
    resultFileToUpload
  );
  console.log(photo_url.Location);
  const generateUniqueId = `${new Date().getTime().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  photo_url.Location + '?clearCache=' + generateUniqueId

  await userService.updateUserById(req.user, { photoUrl: photo_url.Location + '?clearCache=' + generateUniqueId });
  // await upsertPost(uuid, post);
  res.send({
    message: "success"
  });
}
);

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserDetials,
  uploadProfilePhoto
};
