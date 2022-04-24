const fs = require("fs");
const AWS = require("aws-sdk");

class Aws {
  static async savePhoto(filename, fileContent, isVideo = false, thumbnail = false) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    let Key = isVideo ? `videos/${filename}` : `images/${filename}`
    if (thumbnail) {
      Key = `thumbnail/${filename}`
    }
    const par = {
      Bucket: 'bingmee1',
      Key,
      ACL: "public-read",
      Body: fileContent,
    };
    return await s3.upload(par).promise();
  }

  static async saveProfilePhoto(filename, fileContent) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const par = {
      Bucket: 'bingmee1',
      Key: `profile/${filename}`,
      ACL: "public-read",
      Body: fileContent,
    };

    return await s3.upload(par).promise();
  }



  // static async pushNotification(payload) {
  //   const SQS = new AWS.SQS({
  //     apiVersion: "2012-11-05",
  //     region: process.env.get("AWS_SQS_REGION"),
  //     accessKeyId: process.env.get("AWS_SQS_ACCESS_KEY"),
  //     secretAccessKey: process.env.get("AWS_SQS_SECRET_KEY"),
  //   });
  //   const response = await SQS.sendMessage({
  //     QueueUrl: process.env.get("AWS_SQS_QUEUE_URL"),
  //     MessageBody: JSON.stringify(payload),
  //   }).promise();

  //   console.log({
  //     QueueUrl: process.env.get("AWS_SQS_QUEUE_URL"),
  //     MessageBody: JSON.stringify(payload),
  //   });
  // }

  // static async invalidateCacheAtCloudFront(payload) {
  //   const config = {
  //     accessKeyId: process.env.get("AWS_CLOUDFRONT_ACCESS_KEY"),
  //     secretAccessKey: process.env.get("AWS_CLOUDFRONT_SECRET_KEY"),
  //   };
  //   const cloudFront = new AWS.CloudFront(config);
  //   const invalidationParams = {
  //     DistributionId: process.env.get("CLOUD_FRONT_DISTRIBUTION_ID"),
  //     InvalidationBatch: {
  //       CallerReference: Date.now().toString(),
  //       Paths: {
  //         Quantity: payload.path.length,
  //         Items: payload.path,
  //       },
  //     },
  //   };
  //   await cloudFront.createInvalidation(invalidationParams).promise();
  // }
}

module.exports = Aws;
