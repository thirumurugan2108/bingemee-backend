const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, postService } = require('../services');
const upload = require('../utils/AwsS3upload');
const singleUpload = upload.single("image");
const { v4  } = require('uuid');

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

const getPostByUserId = catchAsync(async (req, res) => {

  // const result = await postService.getAllImagesByUserId(username);
  const username = req.user?.name;
  if (!username) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send('result');
});

const updatePostByUserId = catchAsync(async (req, res) => {
  uploadImages(req,res);
  const post = await postService.updatePostById(req.params.userId, req.body);
  res.send(post);
});

const uploadImages = catchAsync(async (req, res) => {
  singleUpload(req, res, async function (err) {
    if (err) {
      return res.json({
        success: false,
        errors: {
          title: "Image Upload Error",
          detail: err.message,
          error: err,
        },
      });
    }
    let update = { profilePicture: req.file.location };
    const user = await postService.createPost({
      ...req?.body
      , username: req.user?.name
      , image: req.file.location
    });
    console.log(update);
    res.status(200).json({ success: true });
  })
}
);


module.exports = {
  createPostByUserId,
  getAllPosts,
  getPostByUserId,
  updatePostByUserId,
  uploadImages
};
