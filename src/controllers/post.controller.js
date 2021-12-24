const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService } = require('../services');
const upload = require('../utils/AwsS3upload');
const singleUpload = upload.single("image");
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const Aws = require('../utils/Aws');
const { compress } = require('../utils/jimp');
const { upsertPost } = require('../services/post.service');

const createPostByUserId = catchAsync(async (req, res) => {
  const username = req.user?.name;
  const post = await postService.createPost({ ...req?.body, username: username });
  // res.status(httpStatus.CREATED).send(post);
  uploadImages.apply()
});

const getAllPosts = catchAsync(async (req, res) => {
  const username = req.user?.name;
  // const filter = pick(req.query, ['name', 'role']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.getAllImagesByUserId(username);
  res.send(result);
});

// const getPostByUserId = catchAsync(async (req, res) => {

//   // const result = await postService.getAllImagesByUserId(username);
//   const username = req.user?.name;
//   if (!username) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   res.send('result');
// });

const updatePostByUserId = catchAsync(async (req, res) => {
  uploadImages(req, res);
  const post = await postService.updatePostById(req.params.userId, req.body);
  res.send(post);
});

const uploadImages = catchAsync(async (req, res) => {
  const isVideo = req.file.mimetype === 'video/mp4'
  let result = {};
  if (!isVideo) {
    result = await compress(req.file.buffer);
  } else {
    result = req.file.buffer; // getting video content
  }
  let uuid = "";
  if (req.body.isUpdate === "false") {
    uuid = uuidv4().toString();
  } else {
    uuid = req.body.uuid;
  }
  const photo_url = await Aws.savePhoto(
    uuid,
    result,
    isVideo
  );
  const post = {
    title: req.body.title,
    price: req.body.price,
    image: photo_url.Location,
    uuid: uuid,
    username: req.user?.name,
    isVideo: isVideo
  };
   await upsertPost(uuid, post);
   console.log(uuid);
  res.send({
    message: "success"
  });
}
);


module.exports = {
  createPostByUserId,
  getAllPosts,
  updatePostByUserId,
  uploadImages
};
