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
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
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
const generateThumbnail = (uuid, photo_url) => {
  const fileSplit = photo_url.Location.split('videos/')
  const urlPath = `${fileSplit[0]}videos/`
  const thumbnailPath = '/tmp/thumbnail/';
  const thumbnail = `${uuid.replace('.mp4', '')}-thumbnail.png`
  const command = ffmpeg(`${urlPath}${uuid}`)
  .screenshots({
      timestamps: ['1'],
      filename: thumbnail,
      folder: thumbnailPath,
      size: '320x240'
  })
  .on('end', async () => {
    const data = fs.readFileSync(`${thumbnailPath}${thumbnail}`);
    await Aws.savePhoto(
      thumbnail,
      data,
      false,
      true
    );
  })
}
const uploadPostWithImage = catchAsync(async (req, res) => {
  let uuid = "";
  let albumFileNames= ''
  let photo_url = ''
  let isVideo = false
  const generateUniqueId = `${new Date().getTime().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  if (req.body.uuid == undefined) {
    uuid = uuidv4().toString();
  } else {
    uuid = req.body.uuid;
  }
  if (req.files.length == 1) {
    isVideo = req.files[0].mimetype === 'video/mp4'
    let resultFileToUpload = {};
    if (!isVideo) {
      resultFileToUpload = req.files[0].buffer;
      // resultFileToUpload = await compress(req.file.buffer);
    } else {
      resultFileToUpload = req.files[0].buffer; // getting video content
    }
    
    if (isVideo) {
      uuid +=  '.mp4'
    }
    photo_url = await Aws.savePhoto(
      uuid,
      resultFileToUpload,
      isVideo
    );
    if (isVideo) {
      generateThumbnail(uuid, photo_url)    
    }
  }
  else {
    await Promise.all(req.files.map(async (fl, index) => {
      const extSplit = fl.originalname.split('.')
      const resultFileToUpload = fl.buffer;
      isVideo = fl.mimetype === 'video/mp4'
      albumFileNames += `${index}.${extSplit[1]},`
      s3Url = await Aws.savePhoto(
        `${uuid}/${index}.${extSplit[1]}`,
        resultFileToUpload,
        isVideo
      );
      if (!photo_url) {
        photo_url = s3Url
        if (isVideo) {
          generateThumbnail(uuid, photo_url)
        }
      }
    }))

    albumFileNames = albumFileNames.slice(0, -1)
  }

  const post = {
    title: req.body.title,
    price: req.body.price,
    isPaid: req.body.isPaid,
    extensionName: req.body.extensionName,
    fileUrl: photo_url.Location + '?clearCache=' + generateUniqueId,
    uuid: uuid,
    username: req.user?.name,
    isVideo: isVideo,
    albumFileNames
    }
  
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

const deletePost = catchAsync(async (req, res) => {
  try {
    const postData = await postService.getPostByUUID(req.params.uuid)
    const delRes = await Aws.deleteObject(req.params.uuid, postData[0].isVideo)
    if (delRes === "success") {
      const post = await postService.deletePost(req.params.uuid);
      res.send("success")
    }
    else {
      throw new ApiError(httpStatus.NOT_FOUND, 'Unable to delete the post');
    }
  }
  catch(e) {
    console.log(e)
  }
  //const post = 
  //res.send('success')
});

module.exports = {
  getAllPosts,
  updatePostWithoutImage,
  uploadPostWithImage,
  deletePost,
};


