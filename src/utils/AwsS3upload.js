const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4  } = require('uuid');

const s3 = new aws.S3();

aws.config.update({
  apiVersion: 'latest',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: "ap-south-1",
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: 'bingmee1',
    metadata: function (req, file, cb) {
      const id = v4();
      if(req?.isUpdate && req.uuid) {
        cb(null, { fieldName: req.uuid });
      } else {
        cb(null, { fieldName: id });
      }
    },
    key: function (req, file, cb) {
      const id = v4();
      if(req?.isUpdate && req.uuid) {
        cb(null, req.uuid);
      } else {
        cb(null, id);
      }
      
    },
  }),
});

module.exports = upload;