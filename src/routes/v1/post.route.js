const express = require('express');
const auth = require('../../middlewares/auth');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const validate = require('../../middlewares/validate');
// const userValidation = require('../../validations/user.validation');
// const userController = require('../../controllers/user.controller');
const postController = require('../../controllers/post.controller');

const router = express.Router();

router
  .route('/')
  // .post(auth('managePosts'),  postController.createPostByUserId)
  .get(auth('getAllPosts'),  postController.getAllPosts)
  // .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/uploadImages')
  .post(auth('uploadImages'), upload.single('file'), postController.uploadPostWithImage)
  router
  .route('/updatePost')
  .post(auth('updatePost'), postController.updatePostWithoutImage)

//   .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
//   .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
