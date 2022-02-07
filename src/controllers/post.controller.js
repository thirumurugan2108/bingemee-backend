const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService } = require('../services');
const upload = require('../utils/AwsS3upload');
const { v4: uuidv4 } = require('uuid');
const Aws = require('../utils/Aws');
const { compress } = require('../utils/jimp');
const { upsertPost } = require('../services/post.service');

// const createPostByUserId = catchAsync(async (req, res) => {
//   const username = req.user?.name;
//   const post = await postService.createPost({ ...req?.body, username: username });
//   // res.status(httpStatus.CREATED).send(post);
//   uploadPostWithImage.apply()
// });

const getAllPosts = catchAsync(async (req, res) => {
  const username = req.user?.name;
  const result = await postService.findPostsByUsername(username);
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

// const updatePostByUserId = catchAsync(async (req, res) => {
//   uploadPostWithImage(req, res);
//   await updatePost(req, res);
// });

const uploadPostWithImage = catchAsync(async (req, res) => {

  // if (req.body.isFileUpdate === "true") {
    // if(req.file.mimetype.includes('svg')){
    //   ret
    // }
  const isVideo = req.file.mimetype === 'video/mp4'
  let resultFileToUpload = {};
  if (!isVideo) {
    resultFileToUpload = await compress(req.file.buffer);
  } else {
    resultFileToUpload = req.file.buffer; // getting video content
  }

  let uuid = "";
  if (req.body.uuid == undefined) {
    uuid = uuidv4().toString();
  } else {
    uuid = req.body.uuid;
  }

  const photo_url = await Aws.savePhoto(
    uuid,
    resultFileToUpload,
    isVideo
  );
  const generateUniqueId = `${new Date().getTime().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  const post = {
    title: req.body.title,
    price: req.body.price,
    isPaid: req.body.isPaid,
    extensionName: req.body.extensionName,
    fileUrl: photo_url.Location + '?clearCache=' + generateUniqueId,
    uuid: uuid,
    username: req.user?.name,
    isVideo: isVideo
  };
  await upsertPost(uuid, post);
  res.send({
    message: "success"
  });
  // } 
  // else {
  //   const post = {
  //     title: req.body.title,
  //     price: req.body.price,
  //     uuid: req.body.uuid,
  //     username: req.user?.name,
  //     isVideo: req.body.isVideo
  //   };
  //   await upsertPost(uuid, post);
  //   res.send({
  //     message: "success"
  //   });
  // }
}
);
const updatePostWithoutImage = catchAsync(async (req, res) => {
  const post = await postService.updatePostById(req.body.id, req.body);
  res.send(post);
});

module.exports = {
  getAllPosts,
  updatePostWithoutImage,
  uploadPostWithImage
};


